import { NextRequest, NextResponse } from "next/server"
import { addDocumentsToCollection } from "@/lib/chroma-client"
import { 
  streamToString, 
  getFileType, 
  parseTextFile, 
  parseCsvFile, 
  parseJsonFile,
  getFileMetadata 
} from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    // Verify authentication - could use more robust auth in production
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Simple token verification
    const token = authHeader.replace("Bearer ", "")
    if (token !== "dummy-token") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Parse the form data
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    
    // Get file information
    const filename = file.name
    const fileSize = file.size
    const fileType = getFileType(filename)
    
    // Read file content
    const fileStream = file.stream()
    const content = await streamToString(fileStream)
    
    // Parse the file based on its type
    let parsedContent: string
    
    switch (fileType) {
      case 'text':
      case 'markdown':
        parsedContent = await parseTextFile(content)
        break
      case 'csv':
        parsedContent = await parseCsvFile(content)
        break
      case 'json':
        parsedContent = await parseJsonFile(content)
        break
      default:
        // For unsupported formats, use as is
        parsedContent = content
    }
    
    // Create metadata for the document
    const metadata = getFileMetadata(filename, fileType, fileSize)
    
    // Add to ChromaDB
    const result = await addDocumentsToCollection(
      [parsedContent], 
      [metadata]
    )
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `File processed and added to database (${result.count} chunks)`,
        metadata
      })
    } else {
      return NextResponse.json({ 
        error: "Failed to add to database", 
        details: result.error 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("Error processing file upload:", error)
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 