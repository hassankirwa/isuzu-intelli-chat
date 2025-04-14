import { NextRequest, NextResponse } from "next/server"
import { streamToString, getFileType, getFileMetadata } from "@/lib/utils"
import { convertToJson } from "@/lib/file-converter"
import { storeJsonDocument } from "@/lib/document-store"

// Make sure route handler is server-side only
export const runtime = 'nodejs'
export const maxDuration = 120 // Increase for larger files

// Handle CORS preflight requests
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

export async function POST(req: NextRequest) {
  // Add CORS headers to all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  try {
    // Verify authentication - could use more robust auth in production
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers
      })
    }
    
    // Simple token verification
    const token = authHeader.replace("Bearer ", "")
    if (token !== "dummy-token") {
      return NextResponse.json({ error: "Invalid token" }, { 
        status: 401,
        headers
      })
    }

    // Parse the form data
    let formData;
    try {
      formData = await req.formData()
    } catch (formError) {
      console.error("Error parsing form data:", formError);
      return NextResponse.json({ 
        error: "Failed to parse form data", 
        details: formError instanceof Error ? formError.message : "Unknown error" 
      }, { status: 400, headers })
    }
    
    const file = formData.get("file") as File | null
    const structureHint = formData.get("structureHint") as string || ""
    const documentType = formData.get("documentType") as string || ""
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { 
        status: 400,
        headers
      })
    }
    
    // Get file information
    const filename = file.name
    const fileSize = file.size
    const fileType = getFileType(filename)
    
    // Check if file type is supported
    if (!['pdf', 'xlsx', 'xls'].includes(fileType)) {
      return NextResponse.json({ 
        error: "Unsupported file type. Only PDF, XLSX, and XLS are supported for conversion."
      }, { status: 400, headers })
    }
    
    console.log(`Processing ${fileType} file: ${filename}`);

    // Read file content - will be string or Buffer depending on file type
    try {
      const fileStream = file.stream()
      const content = await streamToString(fileStream)
      
      // Make sure we received content
      if (!content) {
        return NextResponse.json({ 
          error: "Failed to read file content", 
        }, { status: 400, headers })
      }
      
      // Ensure PDF and Excel files are handled as buffers
      let processableContent: Buffer | string = content;
      if (typeof content === 'string' && (fileType === 'pdf' || fileType === 'xlsx' || fileType === 'xls')) {
        console.log(`Converting string content to buffer for ${fileType} file`);
        processableContent = Buffer.from(content);
      }
      
      console.log(`File content received: ${Buffer.isBuffer(processableContent) ? 'Binary buffer' : 'Text'} (${typeof processableContent}) of size ${
        Buffer.isBuffer(processableContent) ? processableContent.length : processableContent.length
      } bytes`);
      
      // Convert the file to JSON
      const jsonData = await convertToJson(processableContent, fileType, filename, structureHint)
      
      // Create metadata for the document
      const metadata = {
        ...getFileMetadata(filename, fileType, fileSize),
        convertedAt: new Date().toISOString(),
        documentType: documentType || 'general',
        structureHint: structureHint || undefined
      }
      
      // Store the JSON document
      const outputFilename = `${filename.split('.')[0]}_converted.json`
      const storageResult = await storeJsonDocument(jsonData, outputFilename, metadata)
      
      if (!storageResult.success) {
        return NextResponse.json({ 
          error: "Failed to store the converted document", 
          details: storageResult.error
        }, { status: 500, headers })
      }
      
      return NextResponse.json({
        success: true,
        message: `File converted and stored as JSON successfully`,
        outputFilename,
        metadata,
        preview: JSON.stringify(jsonData).substring(0, 200) + "..." // Show a preview
      }, { headers })
    } catch (processError) {
      console.error("Error processing file:", processError);
      return NextResponse.json({ 
        error: "Error processing file", 
        details: processError instanceof Error ? processError.message : "Unknown error" 
      }, { status: 500, headers })
    }
    
  } catch (error) {
    console.error("Error processing file conversion:", error)
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500, headers })
  }
} 