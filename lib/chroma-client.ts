import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb"
import { v4 as uuidv4 } from "uuid"

// Initialize the ChromaDB client
const chromaClient = new ChromaClient({
  path: process.env.CHROMA_DB_URL || "http://localhost:8000",
})

// Initialize the embedding function with OpenAI
const embeddingFunction = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
  model_name: "text-embedding-3-small",
})

// Collection name for ISUZU knowledge
const COLLECTION_NAME = "isuzu_knowledge"

// Initialize the collection (create if it doesn't exist)
export async function getOrCreateCollection() {
  try {
    // Check if collection exists
    const collections = await chromaClient.listCollections()
    const collectionExists = collections.some((c) => c.name === COLLECTION_NAME)

    if (collectionExists) {
      return await chromaClient.getCollection({
        name: COLLECTION_NAME,
        embeddingFunction,
      })
    } else {
      // Create new collection
      return await chromaClient.createCollection({
        name: COLLECTION_NAME,
        embeddingFunction,
        metadata: {
          description: "ISUZU vehicle information and specifications",
        },
      })
    }
  } catch (error) {
    console.error("Error initializing ChromaDB collection:", error)
    throw error
  }
}

// Query the collection for relevant documents
export async function queryCollection(query: string, topK = 5) {
  try {
    const collection = await getOrCreateCollection()

    const results = await collection.query({
      queryTexts: [query],
      nResults: topK,
    })

    // Format the results
    const documents = results.documents[0] || []
    const metadatas = results.metadatas[0] || []

    // Combine documents with their metadata
    return documents.map((doc, i) => ({
      content: doc,
      metadata: metadatas[i] || {},
    }))
  } catch (error) {
    console.error("Error querying ChromaDB:", error)
    return []
  }
}

// Helper function to chunk text into smaller documents
function chunkText(text: string, maxChunkSize = 1000, overlapSize = 200): string[] {
  const chunks: string[] = []
  
  // If text is smaller than max chunk size, return it as a single chunk
  if (text.length <= maxChunkSize) {
    return [text]
  }
  
  let startIndex = 0
  while (startIndex < text.length) {
    // Find a good breaking point (newline or period) near the end of the chunk
    let endIndex = Math.min(startIndex + maxChunkSize, text.length)
    
    if (endIndex < text.length) {
      // Try to find a newline character to break at
      const newlineIndex = text.lastIndexOf('\n', endIndex)
      
      // If newline is found and it's not too far back, use it
      if (newlineIndex > startIndex && newlineIndex > endIndex - 200) {
        endIndex = newlineIndex + 1 // Include the newline
      } else {
        // Otherwise try to find a period or space to break at
        const periodIndex = text.lastIndexOf('.', endIndex)
        if (periodIndex > startIndex && periodIndex > endIndex - 100) {
          endIndex = periodIndex + 1 // Include the period
        } else {
          // Last resort: find a space
          const spaceIndex = text.lastIndexOf(' ', endIndex)
          if (spaceIndex > startIndex && spaceIndex > endIndex - 50) {
            endIndex = spaceIndex + 1 // Include the space
          }
        }
      }
    }
    
    chunks.push(text.substring(startIndex, endIndex).trim())
    
    // Move the start index for the next chunk, with overlap
    startIndex = endIndex - overlapSize
    
    // Make sure we're making progress
    if (startIndex >= text.length) {
      break
    }
  }
  
  return chunks
}

// Process and add documents to the collection
export async function addDocumentsToCollection(
  texts: string[], 
  metadata: Record<string, any>[] = [],
  chunkSize = 1000
) {
  try {
    const collection = await getOrCreateCollection()
    
    // Process each text into chunks
    const allChunks: string[] = []
    const allMetadata: Record<string, any>[] = []
    const allIds: string[] = []
    
    texts.forEach((text, index) => {
      const chunks = chunkText(text, chunkSize)
      
      chunks.forEach((chunk, chunkIndex) => {
        allChunks.push(chunk)
        allIds.push(`${uuidv4()}`)
        
        // Clone metadata for each chunk and add chunk information
        const chunkMetadata = { 
          ...metadata[index], 
          chunkIndex,
          totalChunks: chunks.length
        }
        allMetadata.push(chunkMetadata)
      })
    })
    
    // Add documents in batches if there are many
    const BATCH_SIZE = 50
    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batchChunks = allChunks.slice(i, i + BATCH_SIZE)
      const batchMetadata = allMetadata.slice(i, i + BATCH_SIZE)
      const batchIds = allIds.slice(i, i + BATCH_SIZE)
      
      await collection.add({
        ids: batchIds,
        documents: batchChunks,
        metadatas: batchMetadata,
      })
    }
    
    return {
      success: true,
      count: allChunks.length
    }
  } catch (error) {
    console.error("Error adding documents to ChromaDB:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// Get collection stats
export async function getCollectionStats() {
  try {
    const collection = await getOrCreateCollection()
    const count = await collection.count()
    
    return {
      name: COLLECTION_NAME,
      count,
      success: true
    }
  } catch (error) {
    console.error("Error getting collection stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// Delete documents from collection
export async function deleteDocuments(ids: string[]) {
  try {
    const collection = await getOrCreateCollection()
    await collection.delete({
      ids
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting documents from ChromaDB:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

