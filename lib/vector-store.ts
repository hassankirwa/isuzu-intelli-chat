import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { Index, IndexOptions } from 'faiss-node';
import OpenAI from 'openai';
import { listJsonDocuments, getJsonDocument } from './document-store';
import { DocumentChunk } from './document-processor';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OpenAIEmbeddings } from '@langchain/openai';
import { join } from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Path where we'll store the FAISS index
const INDEX_DIR = path.join(process.cwd(), 'data', 'faiss');
const METADATA_DIR = path.join(process.cwd(), 'data', 'metadata');
const INDEX_FILE = path.join(INDEX_DIR, 'document_index.faiss');
const METADATA_FILE = path.join(METADATA_DIR, 'document_metadata.json');

// Make sure directories exist
async function ensureDirectories() {
  try {
    await fsPromises.mkdir(INDEX_DIR, { recursive: true });
    await fsPromises.mkdir(METADATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Interface for our document metadata
interface DocumentMetadata {
  id: string;
  filename: string;
  embedding_id: number; // Position in FAISS index
  type?: string;
  title?: string;
  description?: string;
  created_at: string;
}

// Interface for document chunk metadata
interface ChunkMetadata {
  id: string;
  filename: string;
  embedding_id: number;
  chunk_index: number;
  total_chunks: number;
  type?: string;
  source: string;
  title?: string;
  created_at: string;
}

// Initialize FAISS index with given dimension
export async function initializeIndex(dimension: number = 1536): Promise<Index | null> {
  await ensureDirectories();
  
  try {
    if (fs.existsSync(INDEX_FILE)) {
      // Load existing index
      return new Index(INDEX_FILE);
    } else {
      // Create new index
      const options: IndexOptions = {
        dimension,
        metric: 'L2', // Using Euclidean distance
      };
      
      const index = new Index(options);
      // Save the empty index
      index.write(INDEX_FILE);
      
      // Initialize empty metadata
      await fsPromises.writeFile(METADATA_FILE, JSON.stringify([], null, 2));
      
      return index;
    }
  } catch (error) {
    console.error('Error initializing FAISS index:', error);
    return null;
  }
}

// Get embeddings from OpenAI
export async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      encoding_format: "float",
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    return null;
  }
}

// Add a document to the index
export async function addDocumentToIndex(
  document: any, 
  filename: string,
  type: string = 'json',
  title?: string,
  description?: string
): Promise<boolean> {
  try {
    // Initialize index if not already done
    const index = await initializeIndex();
    if (!index) {
      throw new Error('Failed to initialize index');
    }
    
    // Convert document to text for embedding
    let textContent: string;
    
    if (typeof document === 'string') {
      textContent = document;
    } else {
      textContent = JSON.stringify(document);
    }
    
    // Get embedding
    const embedding = await getEmbedding(textContent);
    if (!embedding) {
      throw new Error('Failed to generate embedding');
    }
    
    // Add vector to index
    const embedding_id = index.add(embedding);
    
    // Save updated index
    index.write(INDEX_FILE);
    
    // Load existing metadata
    let metadata: DocumentMetadata[] = [];
    if (fs.existsSync(METADATA_FILE)) {
      const metadataContent = await fsPromises.readFile(METADATA_FILE, 'utf-8');
      metadata = JSON.parse(metadataContent);
    }
    
    // Add new document metadata
    const docMetadata: DocumentMetadata = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      filename,
      embedding_id,
      type,
      title,
      description,
      created_at: new Date().toISOString(),
    };
    
    metadata.push(docMetadata);
    
    // Save updated metadata
    await fsPromises.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error adding document to index:', error);
    return false;
  }
}

// Add chunks to the vector index
export async function addChunksToIndex(
  chunks: any[]
): Promise<boolean> {
  try {
    // Initialize index if not already done
    const index = await initializeIndex();
    if (!index) {
      throw new Error('Failed to initialize index');
    }
    
    // Load existing metadata
    let metadata: ChunkMetadata[] = [];
    if (fs.existsSync(METADATA_FILE)) {
      const metadataContent = await fsPromises.readFile(METADATA_FILE, 'utf-8');
      metadata = JSON.parse(metadataContent);
    }
    
    // Process chunks in batches to avoid rate limiting
    const batchSize = 5;
    let successCount = 0;
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Get embeddings for this batch
      const embeddingResults = await Promise.all(
        batch.map(async (chunk) => {
          try {
            const embedding = await getEmbedding(chunk.content);
            return { chunk, embedding };
          } catch (error) {
            console.warn(`Failed to get embedding for chunk ${chunk.metadata.chunk_index} of ${chunk.metadata.filename}: ${error}`);
            return { chunk, embedding: null };
          }
        })
      );
      
      // Add successful embeddings to index and metadata
      for (const { chunk, embedding } of embeddingResults) {
        if (!embedding) continue;
        
        // Add vector to index
        const embedding_id = index.add(embedding);
        successCount++;
        
        // Add chunk metadata
        const chunkMetadata: ChunkMetadata = {
          id: `chunk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          filename: chunk.metadata.filename,
          embedding_id,
          chunk_index: chunk.metadata.chunk_index,
          total_chunks: chunk.metadata.total_chunks,
          type: chunk.metadata.section || 'document',
          source: chunk.metadata.source,
          title: chunk.metadata.section,
          created_at: new Date().toISOString(),
        };
        
        metadata.push(chunkMetadata);
      }
      
      // Avoid rate limiting with a small delay between batches
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Save the index
    index.write(INDEX_FILE);
    
    // Save updated metadata
    await fsPromises.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    
    console.log(`Added ${successCount} of ${chunks.length} chunks to index`);
    return successCount > 0;
  } catch (error) {
    console.error('Error adding chunks to index:', error);
    return false;
  }
}

// Search for similar documents
export async function findSimilarDocuments(query: string, limit: number = 5): Promise<{
  documents: DocumentMetadata[],
  scores: number[]
}> {
  try {
    // Initialize index
    const index = await initializeIndex();
    if (!index) {
      throw new Error('Failed to initialize index');
    }
    
    // Get query embedding
    const queryEmbedding = await getEmbedding(query);
    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding');
    }
    
    // Search index
    const searchResults = index.search(queryEmbedding, limit);
    
    // Load metadata
    let metadata: DocumentMetadata[] = [];
    if (fs.existsSync(METADATA_FILE)) {
      const metadataContent = await fsPromises.readFile(METADATA_FILE, 'utf-8');
      metadata = JSON.parse(metadataContent);
    }
    
    // Match results with metadata
    const documents: DocumentMetadata[] = [];
    const scores: number[] = [];
    
    for (const result of searchResults) {
      const { id, distance } = result;
      const docMeta = metadata.find(m => m.embedding_id === id);
      
      if (docMeta) {
        documents.push(docMeta);
        scores.push(distance);
      }
    }
    
    return { documents, scores };
  } catch (error) {
    console.error('Error searching for similar documents:', error);
    return { documents: [], scores: [] };
  }
}

// Enhanced search function that returns the chunks
export async function findSimilarChunks(query: string, limit: number = 5): Promise<{
  chunks: { content: string; metadata: ChunkMetadata }[];
  scores: number[];
}> {
  try {
    // Initialize index
    const index = await initializeIndex();
    if (!index) {
      throw new Error('Failed to initialize index');
    }
    
    // Get query embedding
    const queryEmbedding = await getEmbedding(query);
    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding');
    }
    
    // Search index
    const searchResults = index.search(queryEmbedding, limit);
    
    // Load metadata
    let metadata: ChunkMetadata[] = [];
    if (fs.existsSync(METADATA_FILE)) {
      const metadataContent = await fsPromises.readFile(METADATA_FILE, 'utf-8');
      metadata = JSON.parse(metadataContent);
    }
    
    // Load document store to get content
    const documents = await listJsonDocuments();
    
    // Match results with metadata
    const chunks: { content: string; metadata: ChunkMetadata }[] = [];
    const scores: number[] = [];
    
    for (const result of searchResults) {
      const { id, distance } = result;
      const chunkMeta = metadata.find(m => m.embedding_id === id);
      
      if (chunkMeta) {
        // Get document content
        const doc = documents.find(d => d.filename === chunkMeta.filename);
        if (doc) {
          const content = await getJsonDocument(doc.filename);
          if (content && content.data) {
            // For now, just use the whole document content
            // In a more advanced implementation, you'd retrieve the specific chunk
            chunks.push({
              content: typeof content.data === 'string' ? content.data : JSON.stringify(content.data),
              metadata: chunkMeta
            });
            scores.push(distance);
          }
        }
      }
    }
    
    return { chunks, scores };
  } catch (error) {
    console.error('Error searching for similar chunks:', error);
    return { chunks: [], scores: [] };
  }
}

// Convert all existing documents to FAISS index
export async function indexAllExistingDocuments(): Promise<{
  success: boolean;
  indexed: number;
  failed: number;
}> {
  try {
    // Get all documents
    const documents = await listJsonDocuments();
    let indexed = 0;
    let failed = 0;
    
    // Process each document
    for (const doc of documents) {
      try {
        const content = await getJsonDocument(doc.filename);
        if (content) {
          const success = await addDocumentToIndex(
            content,
            doc.filename,
            doc.metadata?.documentType || 'json',
            doc.metadata?.title,
            doc.metadata?.description
          );
          
          if (success) {
            indexed++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error indexing document ${doc.filename}:`, error);
        failed++;
      }
    }
    
    return { success: true, indexed, failed };
  } catch (error) {
    console.error('Error indexing all documents:', error);
    return { success: false, indexed: 0, failed: 0 };
  }
}

export async function getVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  return FaissStore.load(
    join(process.cwd(), 'data', 'vectorstore', 'faiss_index'),
    embeddings
  );
}

export async function clearVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  return FaissStore.fromTexts(
    [''],
    [{}],
    embeddings,
    join(process.cwd(), 'data', 'vectorstore', 'faiss_index')
  );
} 