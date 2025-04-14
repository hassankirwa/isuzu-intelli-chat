import { NextRequest, NextResponse } from "next/server"
import { 
  streamToString, 
  getFileType, 
  getFileMetadata,
  isValidPdf,
  ensureBuffer
} from "@/lib/utils"
import { convertToJson } from "@/lib/file-converter"
import { storeJsonDocument } from "@/lib/document-store"
import { processDocumentForIndexing } from "@/lib/document-processor"
import { addChunksToIndex } from "@/lib/vector-store"
import { ReadableStream } from "stream/web"

// Make sure route handler is server-side only
export const runtime = 'nodejs'

// Configure max file size for Next.js 15+
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
    responseLimit: '20mb',
  },
}

// Add CORS headers for better compatibility
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  // Add CORS headers to all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  try {
    console.log("API endpoint hit: /api/upload - POST request received");
    
    // Verify authentication - could use more robust auth in production
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Unauthorized request - missing or invalid auth header");
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers
      })
    }
    
    // Simple token verification
    const token = authHeader.replace("Bearer ", "")
    const authToken = process.env.AUTH_TOKEN || "dummy-token";
    console.log("Auth token from environment:", authToken.substring(0, 4) + "******");
    
    if (token !== authToken) {
      console.log("Invalid token provided");
      return NextResponse.json({ error: "Invalid token" }, { 
        status: 401,
        headers 
      })
    }

    // Parse the form data
    let formData;
    try {
      formData = await req.formData();
      console.log("Form data parsed successfully");
    } catch (formError) {
      console.error("Error parsing form data:", formError);
      return NextResponse.json({ 
        error: "Failed to parse form data", 
        details: formError instanceof Error ? formError.message : "Unknown error" 
      }, { status: 400, headers })
    }
    
    const file = formData.get("file") as File | null
    const documentType = formData.get("documentType") as string || "general"
    const processForRag = formData.get("processForRag") === "true"
    const chunkSize = parseInt(formData.get("chunkSize") as string || "1000", 10)
    const chunkOverlap = parseInt(formData.get("chunkOverlap") as string || "200", 10)
    
    console.log("Received file:", file ? file.name : "No file", "Document type:", documentType);
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { 
        status: 400,
        headers 
      })
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400, headers })
    }
    
    // Get file information
    const filename = file.name
    const fileSize = file.size
    const fileType = getFileType(filename)
    
    // Read file content
    console.log(`Processing ${fileType} file: ${filename}`);
    try {
      const fileStream = file.stream() as any as ReadableStream;
      const content = await streamToString(fileStream)
      
      if (!content) {
        return NextResponse.json({ 
          error: "Failed to read file content", 
        }, { status: 400, headers })
      }
      
      let jsonData;
      let conversionMethod = "direct";
      
      // If it's a JSON file, parse it directly
      if (fileType === 'json') {
        try {
          const contentString = typeof content === 'string' ? content : content.toString('utf8');
          jsonData = JSON.parse(contentString);
          console.log("Successfully parsed JSON file");
        } catch (parseError) {
          console.error("Error parsing JSON file:", parseError);
          return NextResponse.json({ 
            error: "Failed to parse JSON file", 
            details: parseError instanceof Error ? parseError.message : "Invalid JSON" 
          }, { status: 400, headers })
        }
      } else {
        // Convert other file types to JSON
        try {
          // Ensure content is in the right format for conversion
          let processableContent: Buffer | string = content;
          
          // For PDF files, we need to make sure we have a Buffer
          if (fileType === 'pdf') {
            console.log("Processing PDF file with size:", typeof content === 'string' ? content.length : content.byteLength);
            processableContent = ensureBuffer(content);
            
            // Verify it's a valid PDF
            if (!isValidPdf(processableContent)) {
              throw new Error("Invalid PDF format: missing PDF signature");
            }
          } else if ((fileType === 'xlsx' || fileType === 'xls') && typeof content === 'string') {
            processableContent = Buffer.from(content);
          }
          
          // Log content type for debugging
          console.log(`Content type for conversion: ${typeof processableContent}, isBuffer: ${Buffer.isBuffer(processableContent)}, size: ${processableContent.length || 0} bytes`);
          
          // Attempt conversion
          jsonData = await convertToJson(processableContent, fileType, filename);
          
          if (!jsonData) {
            throw new Error(`Conversion returned empty result for ${fileType}`);
          }
          
          conversionMethod = `${fileType}-to-json`;
          console.log(`Successfully converted ${fileType} to JSON`);
        } catch (conversionError) {
          console.error(`Error converting ${fileType} to JSON:`, conversionError);
          return NextResponse.json({ 
            error: `Failed to convert ${fileType} file to JSON`, 
            details: conversionError instanceof Error ? conversionError.message : "Unknown error" 
          }, { status: 400, headers })
        }
      }
      
      // Create metadata for the document
      const metadata = {
        ...getFileMetadata(filename, fileType, fileSize),
        documentType,
        conversionMethod,
        createdAt: new Date().toISOString()
      };
      
      // Store the document
      console.log(`Storing JSON document with metadata:`, metadata);
      const storedFilename = `${filename.split('.')[0]}.json`;
      const storeResult = await storeJsonDocument(jsonData, storedFilename, metadata);
      
      if (!storeResult.success) {
        return NextResponse.json({ 
          error: "Failed to store document", 
          details: storeResult.error 
        }, { status: 500, headers })
      }
      
      // Initialize RAG processing result
      let ragResult = { indexed: false, chunks: 0 };
      
      // Process for RAG if requested
      if (processForRag) {
        try {
          console.log(`Processing document for RAG with chunk size ${chunkSize} and overlap ${chunkOverlap}`);
          const { documentChunks } = await processDocumentForIndexing(
            jsonData, 
            { 
              ...metadata, 
              filename: storedFilename 
            }, 
            chunkSize, 
            chunkOverlap
          );
          
          if (documentChunks.length > 0) {
            // Add the chunks to the vector index
            const indexResult = await addChunksToIndex(documentChunks);
            
            ragResult = {
              indexed: true,
              chunks: documentChunks.length,
            };
            
            console.log(`Successfully indexed ${documentChunks.length} chunks from ${filename}`);
          }
        } catch (ragError) {
          console.error("Error processing document for RAG:", ragError);
          // Don't fail the whole request if RAG processing fails
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        filename: storedFilename,
        metadata,
        rag: ragResult
      }, { status: 200, headers })
      
    } catch (error) {
      console.error("Error processing file:", error);
      return NextResponse.json({ 
        error: "Server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, { status: 500, headers })
    }
  } catch (error) {
    console.error("Error processing file upload:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500, headers })
  }
} 