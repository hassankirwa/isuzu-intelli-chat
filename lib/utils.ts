import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ReadableStream } from "stream/web"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let result = ""

  return reader.read().then(function process({ done, value }): Promise<string> | string {
    if (done) {
      return result
    }

    result += decoder.decode(value, { stream: true })
    return reader.read().then(process)
  })
}

// Determine file type from filename
export function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  switch (ext) {
    case 'txt':
      return 'text'
    case 'csv':
      return 'csv'
    case 'md':
      return 'markdown'
    case 'json':
      return 'json'
    case 'pdf':
      return 'pdf'
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

