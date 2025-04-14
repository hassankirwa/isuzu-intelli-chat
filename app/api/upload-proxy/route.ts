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

export async function POST(req: NextRequest) {
  try {
    // Setup CORS
    const origin = req.headers.get('origin');
    const corsHeaders: Record<string, string> = {};
    
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    
    // Validate token
    if (!validateToken(req)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" }, 
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Clone the request data - this is necessary because we can only consume the body once
    const formData = await req.formData();
    
    // Extract file info for metadata
    const file = formData.get("file") as File | null;
    const fileType = file?.type || 'application/octet-stream';
    const fileName = file?.name || 'unknown';
    
    // Forward the file and settings to the Python backend
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!backendResponse.ok) {
        let errorMessage = `Upload failed: ${backendResponse.status} ${backendResponse.statusText}`;
        try {
          if (backendResponse.headers.get('content-type')?.includes('application/json')) {
            const errorData = await backendResponse.json();
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } else {
            const errorText = await backendResponse.text();
            if (errorText) {
              errorMessage = `${errorMessage}. Details: ${errorText.substring(0, 200)}`;
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        return NextResponse.json(
          { error: errorMessage }, 
          { status: backendResponse.status, headers: corsHeaders }
        );
      }
      
      // Get response data from backend
      const responseData = await backendResponse.json();
      
      // Format the response to match frontend expectations
      const response = {
        ...responseData,
        rag: {
          indexed: true,
          chunks: responseData.chunks_created || 0
        },
        metadata: {
          fileType,
          fileName,
          timestamp: new Date().toISOString()
        }
      };
      
      return NextResponse.json(response, { 
        status: 200, 
        headers: corsHeaders 
      });
      
    } catch (error) {
      console.error("Error communicating with backend:", error);
      return NextResponse.json(
        { error: "Error communicating with backend service" }, 
        { status: 500, headers: corsHeaders }
      );
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }
  
  return new NextResponse(null, { status: 204 });
} 