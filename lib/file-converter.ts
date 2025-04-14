import { Readable } from "stream";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import { isValidPdf, ensureBuffer } from "@/lib/utils";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Verify OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. File conversion may fail.");
}

// Convert PDF/XLSX to JSON using OpenAI's capabilities
export async function convertToJson(
  fileContent: Buffer | string, 
  fileType: string, 
  fileName: string
): Promise<any> {
  try {
    // Validate input
    if (!fileContent) {
      throw new Error("No file content provided");
    }
    
    if (!fileName) {
      throw new Error("No file name provided");
    }
    
    const contentType = getContentType(fileType);
    
    if (!contentType) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    console.log(`Converting ${fileType} file (${typeof fileContent}) to JSON. Buffer? ${Buffer.isBuffer(fileContent)}`);
    
    // For structured formats like XLSX, we can convert directly
    if (fileType === 'xlsx' || fileType === 'xls') {
      return await convertSpreadsheetToJson(fileContent, fileName);
    }
    
    // For PDF, we extract text and then convert
    if (fileType === 'pdf') {
      return await convertPdfToJson(fileContent, fileName);
    }
    
    // For CSV, we parse and convert
    if (fileType === 'csv') {
      return await convertCsvToJson(fileContent, fileName);
    }
    
    // For plain text files, we just return as a simple text object
    if (fileType === 'text' || fileType === 'txt') {
      const textContent = typeof fileContent === 'string' ? 
        fileContent : fileContent.toString('utf8');
      
      return {
        text: textContent,
        source: fileName,
        conversionMethod: "text-extraction"
      };
    }
    
    throw new Error(`Conversion not implemented for type: ${fileType}`);
  } catch (error) {
    console.error(`Error converting ${fileType} to JSON:`, error);
    throw error;
  }
}

// Convert PDF content to JSON
async function convertPdfToJson(content: Buffer | string, fileName: string) {
  try {
    // Ensure we have a valid Buffer for PDF parsing
    let pdfBuffer: Buffer;
    
    if (typeof content === 'string') {
      pdfBuffer = Buffer.from(content);
    } else if (Buffer.isBuffer(content)) {
      pdfBuffer = content;
    } else {
      // Try to convert whatever we have to a buffer
      pdfBuffer = ensureBuffer(content);
    }
    
    // Check if buffer is a valid PDF
    if (!isValidPdf(pdfBuffer)) {
      console.warn("Content doesn't appear to be a valid PDF (missing signature)");
      return { 
        text: "The provided file doesn't appear to be a valid PDF document",
        source: fileName,
        conversionMethod: "PDF validation failed"
      };
    }
    
    // Extract text from the PDF
    let extractedText: string;
    
    try {
      // Use pdf-parse to extract text from the PDF buffer
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;
      console.log(`Extracted ${extractedText.length} characters from PDF`);
      
      // If we got empty text, that's suspicious
      if (!extractedText || extractedText.trim() === '') {
        console.warn("PDF parsing returned empty text");
        extractedText = `[PDF Content from ${fileName} - appears to be empty or unreadable]`;
      }
    } catch (pdfError) {
      console.error("Error parsing PDF:", pdfError);
      // Fallback to using a placeholder for testing
      extractedText = `[PDF Content from ${fileName} - parsing failed: ${pdfError instanceof Error ? pdfError.message : "Unknown error"}]`;
      
      // Return simplified object with error info
      return {
        text: extractedText,
        source: fileName,
        conversionMethod: "PDF parsing failed",
        error: pdfError instanceof Error ? pdfError.message : "PDF parsing failed"
      };
    }
    
    // Use OpenAI to structure the content
    const systemPrompt = `Convert the following PDF content into a structured JSON format. Identify and organize key information like products, prices, specifications, and other relevant data. The content is from a file named ${fileName}.`;
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: extractedText
          }
        ]
      });
      
      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error("Invalid response from OpenAI API");
      }
      
      const jsonText = response.choices[0].message.content || '';
      if (!jsonText) {
        throw new Error("Empty response from OpenAI API");
      }
      
      // Extract JSON from response (it might include markdown code blocks)
      const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) || 
                        jsonText.match(/```\n([\s\S]*?)\n```/) || 
                        [null, jsonText];
      
      const cleanJson = jsonMatch[1] || jsonText;
      
      try {
        return JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("Error parsing JSON from OpenAI response:", parseError);
        // If parsing fails, return the text as a simple JSON object
        return { 
          text: cleanJson,
          source: fileName,
          conversionMethod: "AI-assisted PDF extraction (JSON parsing failed)"
        };
      }
    } catch (aiError) {
      console.error("Error calling OpenAI API:", aiError);
      // Return a basic JSON object with the extracted text
      return {
        text: extractedText.substring(0, 5000) + (extractedText.length > 5000 ? "..." : ""),
        source: fileName,
        conversionMethod: "Basic PDF extraction (OpenAI API call failed)",
        error: aiError instanceof Error ? aiError.message : "Unknown AI processing error"
      };
    }
  } catch (error) {
    console.error("Error converting PDF to JSON:", error);
    // Return a minimal JSON object instead of throwing
    return {
      text: "Failed to process PDF document",
      source: fileName,
      error: error instanceof Error ? error.message : "Unknown error",
      conversionMethod: "Failed PDF conversion"
    };
  }
}

// Convert XLSX content to JSON
async function convertSpreadsheetToJson(content: Buffer | string, fileName: string) {
  try {
    let data: any[] = [];
    
    if (Buffer.isBuffer(content)) {
      // Parse the XLSX file
      const workbook = XLSX.read(content, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      data = XLSX.utils.sheet_to_json(worksheet);
      console.log(`Extracted ${data.length} rows from spreadsheet`);
    }
    
    // If we have structured data, use it directly
    if (data.length > 0) {
      // Still use OpenAI to clean and format the data if needed
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Reformat the following spreadsheet data (already converted to JSON) according to this structure: ${data.length > 0 ? JSON.stringify(data[0]) : ''}`
          },
          {
            role: "user",
            content: JSON.stringify(data, null, 2)
          }
        ]
      });
      
      const jsonText = response.choices[0]?.message?.content || '';
      if (!jsonText) {
        console.warn("Empty response from OpenAI API, using original data");
        return data;
      }
      
      const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) || 
                        jsonText.match(/```\n([\s\S]*?)\n```/) || 
                        [null, jsonText];
      
      const cleanJson = jsonMatch[1] || jsonText;
      
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        // Return the original data if parsing fails
        console.warn("Failed to parse OpenAI response as JSON, using original data");
        return data;
      }
    } else {
      // Fallback to using AI if we couldn't parse the spreadsheet
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Convert the following spreadsheet content into a structured JSON format. Organize it as a collection of records with appropriate field names. The content is from a file named ${fileName}.`
          },
          {
            role: "user",
            content: typeof content === 'string' ? content : `[Spreadsheet content from ${fileName} - please convert to structured JSON]`
          }
        ]
      });
      
      const jsonText = response.choices[0]?.message?.content || '';
      if (!jsonText) {
        return { 
          text: "Failed to extract content from spreadsheet - empty AI response",
          source: fileName,
          conversionMethod: "AI-assisted spreadsheet extraction (failed)"
        };
      }
      
      // Extract JSON from response
      const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) || 
                        jsonText.match(/```\n([\s\S]*?)\n```/) || 
                        [null, jsonText];
      
      const cleanJson = jsonMatch[1] || jsonText;
      
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        return { 
          text: cleanJson,
          source: fileName,
          conversionMethod: "AI-assisted spreadsheet extraction"
        };
      }
    }
  } catch (error) {
    console.error("Error converting spreadsheet to JSON:", error);
    // Return a minimal object with error information instead of throwing
    return {
      text: "Failed to process spreadsheet",
      source: fileName,
      error: error instanceof Error ? error.message : "Unknown error",
      conversionMethod: "Failed spreadsheet conversion"
    };
  }
}

// Convert CSV content to JSON
async function convertCsvToJson(content: Buffer | string, fileName: string) {
  try {
    // Convert buffer to string if needed
    const csvContent = typeof content === 'string' ? 
      content : content.toString('utf8');
    
    // Basic CSV parsing - split by lines and then by commas
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      return {
        text: "Empty CSV file",
        source: fileName,
        conversionMethod: "csv-parsing-empty"
      };
    }
    
    // Assume first line is the header
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Parse data rows
    const jsonData = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim());
      const row: Record<string, string> = {};
      
      // Create object with header keys and row values
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      jsonData.push(row);
    }
    
    return jsonData;
  } catch (error) {
    console.error("Error converting CSV to JSON:", error);
    return {
      text: typeof content === 'string' ? content : content.toString('utf8'),
      source: fileName,
      error: error instanceof Error ? error.message : "Unknown error",
      conversionMethod: "Failed CSV conversion"
    };
  }
}

// Get MIME type based on file extension
function getContentType(fileType: string): string | null {
  const typeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'csv': 'text/csv',
    'txt': 'text/plain',
    'text': 'text/plain'
  };
  
  return typeMap[fileType.toLowerCase()] || null;
}

// Extract text from a PDF buffer (stub for actual implementation)
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  // In a real implementation, use a library like pdf-parse
  // For now, return a placeholder
  return "[PDF text content would be extracted here]";
} 