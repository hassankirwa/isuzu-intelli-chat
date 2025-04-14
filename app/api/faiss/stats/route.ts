export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";

// CORS configuration
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
];

// Backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Token validation
function validateToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.slice(7);
  const validToken = process.env.ADMIN_API_TOKEN || 'admin-token-test-123';
  
  return token === validToken;
}

export async function GET(req: NextRequest) {
  try {
    // Setup CORS
    const origin = req.headers.get('origin');
    const corsHeaders: Record<string, string> = {};
    
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
      corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    
    // Validate token
    if (!validateToken(req)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" }, 
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Forward request to Python backend
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(`Backend returned error ${backendResponse.status}: ${errorText}`);
      }
      
      const backendData = await backendResponse.json();
      
      // Format response to match the frontend expectations
      return NextResponse.json({
        totalDocuments: backendData.total_documents,
        totalChunks: backendData.total_chunks,
        lastUpdated: backendData.last_updated,
        vectorStoreExists: backendData.total_chunks > 0,
        documentsDirectory: {
          exists: true,
          files: backendData.total_documents
        }
      }, { headers: corsHeaders });
      
    } catch (error) {
      console.error("Error communicating with backend:", error);
      
      // If backend is not available, return a fallback response
      return NextResponse.json({
        totalDocuments: 0,
        totalChunks: 0,
        lastUpdated: '',
        vectorStoreExists: false,
        documentsDirectory: {
          exists: false,
          files: 0
        },
        error: "Backend service unavailable"
      }, { headers: corsHeaders });
    }
    
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message }, 
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }
  
  return new NextResponse(null, { status: 204 });
} 