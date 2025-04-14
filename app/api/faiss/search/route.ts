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
    
    // Parse request body
    const requestData = await req.json();
    
    // Validate query
    if (!requestData.query) {
      return NextResponse.json(
        { error: "Missing required parameter: query" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Forward the query to the Python backend
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: requestData.query,
          top_k: requestData.top_k || 3,
        }),
      });
      
      if (!backendResponse.ok) {
        let errorMessage = `Query failed: ${backendResponse.status} ${backendResponse.statusText}`;
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
      const backendData = await backendResponse.json();
      
      // Transform results to match frontend expectations
      const transformedResults = backendData.results.map((result: any) => ({
        content: result.content,
        metadata: result.metadata,
        score: result.score,
      }));
      
      return NextResponse.json({
        results: transformedResults,
        query: backendData.query,
        processingTime: backendData.processing_time,
      }, { 
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