export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { existsSync, readFileSync, readdirSync } from "fs";
import { OpenAI } from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// CORS configuration
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
];

// Directory paths
const DATA_DIR = join(process.cwd(), 'data');
const DOCUMENTS_DIR = join(DATA_DIR, 'documents');
const VECTOR_DIR = join(DATA_DIR, 'vectorstore');

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

// Calculate cosine similarity between vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// Load all embeddings from the vectorstore
function loadEmbeddings(): { 
  chunks: Array<{ text: string, embedding: number[], metadata: any }>, 
  count: number 
} {
  // Check if vectorstore directory exists
  if (!existsSync(VECTOR_DIR)) {
    return { chunks: [], count: 0 };
  }
  
  const files = readdirSync(VECTOR_DIR);
  const embeddingFiles = files.filter(file => file.endsWith('_embeddings.json'));
  
  let allChunks: Array<{ text: string, embedding: number[], metadata: any }> = [];
  
  for (const file of embeddingFiles) {
    try {
      const filePath = join(VECTOR_DIR, file);
      const fileContent = readFileSync(filePath, 'utf-8');
      const embeddingData = JSON.parse(fileContent);
      
      if (embeddingData.chunks && Array.isArray(embeddingData.chunks)) {
        // Add metadata to each chunk
        const chunks = embeddingData.chunks.map((chunk: { text: string, embedding: number[] }) => ({
          ...chunk,
          metadata: {
            ...embeddingData.metadata,
            chunkIndex: embeddingData.chunks.indexOf(chunk)
          }
        }));
        
        allChunks = [...allChunks, ...chunks];
      }
    } catch (error) {
      console.error(`Error loading embeddings from ${file}:`, error);
    }
  }
  
  return { chunks: allChunks, count: allChunks.length };
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
    
    // Preflight check
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204,
        headers: corsHeaders
      });
    }
    
    // Validate token (optional for search endpoint)
    const isAdmin = validateToken(req);
    
    // Parse JSON body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON body" }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { query, limit = 5 } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: "Query is required and must be a string" }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Load all embeddings
    const { chunks, count } = loadEmbeddings();
    
    if (count === 0) {
      return NextResponse.json(
        { error: "No documents have been indexed yet" }, 
        { status: 404, headers: corsHeaders }
      );
    }
    
    try {
      // Create embedding for query
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
        encoding_format: "float"
      });
      
      const queryEmbedding = embeddingResponse.data[0].embedding;
      
      // Calculate similarity scores
      const results = chunks.map(chunk => ({
        text: chunk.text,
        metadata: chunk.metadata,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }));
      
      // Sort by similarity score (descending)
      results.sort((a, b) => b.score - a.score);
      
      // Return top N results
      const topResults = results.slice(0, limit);
      
      return NextResponse.json({
        results: topResults.map(result => ({
          content: result.text,
          metadata: result.metadata,
          score: result.score
        }))
      }, { headers: corsHeaders });
      
    } catch (error) {
      console.error("Error searching documents:", error);
      return NextResponse.json(
        { error: "Error searching documents", details: error instanceof Error ? error.message : "Unknown error" },
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