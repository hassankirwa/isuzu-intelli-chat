import { NextRequest, NextResponse } from "next/server";
import { indexAllExistingDocuments } from "@/lib/vector-store";

export async function POST(req: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  try {
    // Verify auth (simplified)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers
      });
    }
    
    // Reindex all documents
    const result = await indexAllExistingDocuments();
    
    if (!result.success) {
      return NextResponse.json({ 
        error: "Failed to reindex documents" 
      }, { status: 500, headers });
    }
    
    return NextResponse.json({
      success: true,
      indexed: result.indexed,
      failed: result.failed
    }, { headers });
    
  } catch (error) {
    console.error("Error reindexing documents:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500, headers });
  }
}

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