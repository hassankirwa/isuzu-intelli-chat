import { getEmbedding } from './vector-store';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants for limiting processing
const MAX_TEXT_LENGTH = 100000; // Limit very large texts 
const MAX_CHARS_PER_EMBEDDING = 8000; // OpenAI's text-embedding-3-large can handle 8K tokens

// Interface for document chunks
export interface DocumentChunk {
  content: string;
  metadata: {
    filename: string;
    source: string;
    chunk_index: number;
    total_chunks: number;
    page?: number;
    section?: string;
  };
}

/**
 * Process and chunk a document into smaller pieces
 * @param text Document text content
 * @param metadata Document metadata
 * @param chunkSize Maximum chunk size (approx. characters)
 * @param chunkOverlap Overlap between chunks
 */
export async function chunkDocument(
  text: string,
  metadata: { filename: string; source: string; },
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): Promise<DocumentChunk[]> {
  // Limit text size to prevent memory issues
  if (text.length > MAX_TEXT_LENGTH) {
    console.warn(`Document is very large (${text.length} chars). Truncating to ${MAX_TEXT_LENGTH} chars.`);
    text = text.substring(0, MAX_TEXT_LENGTH);
  }

  // Ensure chunk size doesn't exceed embedding model limits
  const effectiveChunkSize = Math.min(chunkSize, MAX_CHARS_PER_EMBEDDING);
  
  // Simple approach: split by paragraphs and combine
  const paragraphs = text.split(/\r?\n\r?\n/);
  const chunks: DocumentChunk[] = [];
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const para of paragraphs) {
    // If adding this paragraph exceeds chunk size and we already have content
    if (currentChunk.length + para.length > effectiveChunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        content: currentChunk,
        metadata: {
          ...metadata,
          chunk_index: chunkIndex,
          total_chunks: -1, // Will update after processing
        }
      });
      
      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      const overlapWords = Math.floor(chunkOverlap / 5); // Approximate 5 chars per word
      currentChunk = words.slice(-overlapWords).join(' ');
      chunkIndex++;
    }
    
    // Add paragraph to current chunk
    currentChunk += (currentChunk ? '\n\n' : '') + para;

    // If a single paragraph is too large, split it immediately
    if (currentChunk.length > effectiveChunkSize) {
      chunks.push({
        content: currentChunk,
        metadata: {
          ...metadata,
          chunk_index: chunkIndex,
          total_chunks: -1,
        }
      });
      
      currentChunk = '';
      chunkIndex++;
    }
  }
  
  // Add final chunk if not empty
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk,
      metadata: {
        ...metadata,
        chunk_index: chunkIndex,
        total_chunks: -1,
      }
    });
  }
  
  // Update total chunks
  chunks.forEach(chunk => {
    chunk.metadata.total_chunks = chunks.length;
  });
  
  return chunks;
}

/**
 * Extracts text from a document object based on its type
 */
export function extractTextFromDocument(document: any): string {
  if (typeof document === 'string') {
    return document;
  }
  
  if (document.text) {
    return document.text;
  }
  
  // Handle arrays of records (like from CSV/XLSX)
  if (Array.isArray(document)) {
    return document.map(item => {
      if (typeof item === 'string') return item;
      return Object.entries(item)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }).join('\n\n');
  }
  
  // For documents stored with our document-store format
  if (document.data) {
    return extractTextFromDocument(document.data);
  }
  
  return JSON.stringify(document);
}

/**
 * Process a document, chunk it, and generate embeddings for RAG indexing
 */
export async function processDocumentForIndexing(
  json: any,
  meta: object,
  chunkSize: number,
  chunkOverlap: number
): Promise<{
  documentChunks: DocumentChunk[];
}> {
  // Extract text from document
  const text = extractTextFromDocument(json);
  
  // Make sure we have required metadata fields
  const metadata = meta as Record<string, any>;
  const { filename } = metadata;
  const source = metadata.source || filename;
  
  if (!filename) {
    throw new Error("Filename is required in metadata");
  }
  
  // Chunk document with custom parameters
  const documentChunks = await chunkDocument(text, { filename, source }, chunkSize, chunkOverlap);
  
  return { documentChunks };
} 