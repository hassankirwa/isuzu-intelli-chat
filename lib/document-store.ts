import fs from 'fs/promises';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'data', 'documents');

// Store JSON document with metadata
export async function storeJsonDocument(data: any, filename: string, metadata: any): Promise<any> {
  try {
    // Ensure directory exists
    await fs.mkdir(DOCS_DIR, { recursive: true });
    
    // Clean filename and create path
    const sanitizedFilename = filename.replace(/[^a-z0-9_\-\.]/gi, '_');
    const documentPath = path.join(DOCS_DIR, `${sanitizedFilename}.json`);
    
    const storageObject = {
      data,
      metadata: {
        ...metadata,
        storedAt: new Date().toISOString(),
        filename: sanitizedFilename
      }
    };
    
    await fs.writeFile(documentPath, JSON.stringify(storageObject, null, 2));
    return { success: true, path: documentPath };
  } catch (error) {
    console.error("Error storing JSON document:", error);
    return { success: false, error };
  }
}

// List all stored JSON documents
export async function listJsonDocuments() {
  try {
    await fs.mkdir(DOCS_DIR, { recursive: true });
    const files = await fs.readdir(DOCS_DIR);
    
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const documents = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(DOCS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        try {
          const { metadata } = JSON.parse(content);
          return {
            filename: file,
            path: filePath,
            metadata
          };
        } catch (e) {
          return {
            filename: file,
            path: filePath,
            metadata: { error: 'Invalid JSON' }
          };
        }
      })
    );
    
    return documents;
  } catch (error) {
    console.error("Error listing JSON documents:", error);
    return [];
  }
}

// Get a specific JSON document by filename
export async function getJsonDocument(filename: string) {
  try {
    const documentPath = path.join(DOCS_DIR, filename);
    const content = await fs.readFile(documentPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error retrieving document ${filename}:`, error);
    return null;
  }
}

// Delete a JSON document
export async function deleteJsonDocument(filename: string) {
  try {
    const documentPath = path.join(DOCS_DIR, filename);
    await fs.unlink(documentPath);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document ${filename}:`, error);
    return { success: false, error };
  }
}

// Find relevant JSON documents based on query
export async function findRelevantJsonDocuments(query: string) {
  try {
    const documents = await listJsonDocuments();
    
    // Simple keyword matching for now (can be enhanced with embeddings later)
    const lowercaseQuery = query.toLowerCase();
    const matchingDocs = documents.filter(doc => {
      // Match against filename
      if (doc.filename.toLowerCase().includes(lowercaseQuery)) return true;
      
      // Match against metadata if available
      if (doc.metadata && typeof doc.metadata === 'object') {
        const metaString = JSON.stringify(doc.metadata).toLowerCase();
        if (metaString.includes(lowercaseQuery)) return true;
      }
      
      return false;
    });
    
    // Return the top 3 matches
    return matchingDocs.slice(0, 3);
  } catch (error) {
    console.error("Error finding relevant documents:", error);
    return [];
  }
} 