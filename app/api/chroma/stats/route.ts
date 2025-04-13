import { NextRequest, NextResponse } from "next/server"
import { getCollectionStats } from "@/lib/chroma-client"

export async function GET(req: NextRequest) {
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

    // Get collection stats
    const stats = await getCollectionStats()
    
    if (stats.success) {
      return NextResponse.json(stats)
    } else {
      return NextResponse.json({ 
        error: "Failed to get collection statistics", 
        details: stats.error 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("Error getting collection stats:", error)
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 