import { NextRequest, NextResponse } from "next/server"
import { listJsonDocuments, deleteJsonDocument, getJsonDocument } from "@/lib/document-store"

// Make sure route handler is server-side only
export const runtime = 'nodejs'

// GET - List all JSON documents
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    if (token !== "dummy-token") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    // Get the documents list
    const documents = await listJsonDocuments()
    
    return NextResponse.json({
      success: true,
      documents
    })
  } catch (error) {
    console.error("Error listing documents:", error)
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

// DELETE - Delete a document
export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    if (token !== "dummy-token") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    // Get filename from URL
    const url = new URL(req.url)
    const filename = url.searchParams.get("filename")
    
    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }
    
    // Delete the document
    const result = await deleteJsonDocument(filename)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: "Failed to delete document", 
        details: result.error 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: `Document ${filename} deleted successfully`
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 