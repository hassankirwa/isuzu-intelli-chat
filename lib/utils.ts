import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ReadableStream } from "stream/web"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Updated streamToString function that always returns a string
export async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  // Read all chunks from the stream
  try {
    let done = false;
    while (!done) {
      const { done: isDone, value } = await reader.read();
      done = isDone;
      if (value) {
        chunks.push(value);
      }
    }
    
    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    // For binary data, convert to base64 string
    try {
      const decoder = new TextDecoder();
      return decoder.decode(buffer);
    } catch (error) {
      console.error("Error decoding stream as text:", error);
      // Convert binary data to base64 string
      return Buffer.from(buffer).toString('base64');
    }
  } catch (error) {
    console.error("Error reading stream:", error);
    throw new Error(`Failed to read stream: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Determine file type from filename
export function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  switch (ext) {
    case 'txt':
      return 'txt'
    case 'csv':
      return 'csv'
    case 'md':
      return 'markdown'
    case 'json':
      return 'json'
    case 'pdf':
      return 'pdf'
    case 'xlsx':
    case 'xls':
      return 'xlsx'
    case 'docx':
      return 'docx'
    default:
      return 'unknown'
  }
}

// Simple file parsers for different file types
export async function parseTextFile(content: string): Promise<string> {
  return content
}

export async function parseCsvFile(content: string): Promise<string> {
  // For CSV, we'll convert each row to a string paragraph
  const lines = content.split('\n')
  
  // Check if there's a header row (assumes first row is header)
  const header = lines[0].split(',').map(h => h.trim())
  
  // Process each data row
  const results: string[] = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const values = lines[i].split(',').map(v => v.trim())
    
    // Create a formatted string with headers
    const rowData = header.map((h, index) => {
      return `${h}: ${values[index] || ''}`
    }).join('\n')
    
    results.push(rowData)
  }
  
  return results.join('\n\n')
}

export async function parseJsonFile(content: string): Promise<string> {
  try {
    const data = JSON.parse(content)
    
    // Convert JSON to a formatted string representation
    return formatJsonAsText(data)
  } catch (error) {
    console.error('Error parsing JSON file:', error)
    return content // Return the raw content if parsing fails
  }
}

// Helper function to format JSON data as text
function formatJsonAsText(data: any, prefix = ''): string {
  if (typeof data !== 'object' || data === null) {
    return String(data)
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '[]'
    
    // If array items are primitive, format as a list
    if (data.every(item => typeof item !== 'object' || item === null)) {
      return data.map((item, i) => `${i+1}. ${item}`).join('\n')
    }
    
    // For array of objects, format each item
    return data.map((item, i) => 
      `Item ${i+1}:\n${formatJsonAsText(item, '  ')}`
    ).join('\n\n')
  }
  
  // For objects
  const keys = Object.keys(data)
  if (keys.length === 0) return '{}'
  
  return keys.map(key => {
    const value = data[key]
    
    if (typeof value === 'object' && value !== null) {
      return `${prefix}${key}:\n${formatJsonAsText(value, prefix + '  ')}`
    }
    
    return `${prefix}${key}: ${value}`
  }).join('\n')
}

// Get document metadata from a file
export function getFileMetadata(filename: string, fileType: string, fileSize: number): Record<string, any> {
  return {
    filename,
    fileType,
    fileSize,
    uploadedAt: new Date().toISOString(),
  }
}

/**
 * Checks if the content is a valid PDF by verifying the signature
 * @param content The content to check
 * @returns boolean indicating if the content is a valid PDF
 */
export function isValidPdf(content: Buffer | string): boolean {
  // Convert to buffer if it's a string
  const buffer = typeof content === 'string' ? Buffer.from(content) : content;
  
  // Check for PDF signature: "%PDF-"
  if (buffer.length < 5) {
    return false;
  }
  
  // Check for PDF signature (magic number)
  return buffer[0] === 0x25 && // %
         buffer[1] === 0x50 && // P
         buffer[2] === 0x44 && // D
         buffer[3] === 0x46 && // F
         buffer[4] === 0x2D;   // -
}

/**
 * Ensures we have a Buffer from string or Buffer
 * @param data The content to convert to Buffer
 * @returns Buffer
 */
export function ensureBuffer(data: string | Buffer): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  
  if (typeof data === 'string') {
    return Buffer.from(data);
  }
  
  // Should not happen with correct typing, but as a fallback
  throw new Error("Invalid data type provided to ensureBuffer");
}

