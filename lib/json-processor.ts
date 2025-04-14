import OpenAI from "openai";
import { getJsonDocument, findRelevantJsonDocuments } from "./document-store";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Process JSON and enhance it for human-readable chat responses
export async function processJsonForChat(jsonData: any, userQuery: string) {
  try {
    // Extract relevant parts of JSON based on query
    const relevantData = extractRelevantJsonData(jsonData, userQuery);
    
    // Use OpenAI to create a natural language response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are ISUZU IntelliChat assistant. Transform the JSON data into a helpful, 
                    natural response that directly answers the user's query. Format important details 
                    using markdown when appropriate. Always include specific prices, specifications, 
                    and technical details from the data when available. If the data contains tables or 
                    lists of information, format them in a readable way.`
        },
        {
          role: "user",
          content: `Query: "${userQuery}"\n\nJSON Data: ${JSON.stringify(relevantData, null, 2)}`
        }
      ],
      temperature: 0.3
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error processing JSON for chat:", error);
    return null;
  }
}

// Helper function to extract relevant parts of JSON based on query
function extractRelevantJsonData(jsonData: any, query: string) {
  // For small datasets, return all data
  if (!jsonData.data || typeof jsonData.data !== 'object') {
    return jsonData;
  }
  
  // Return the data field from our document storage format
  return jsonData.data;
}

// Find and process relevant JSON document for a query
export async function findAndProcessJsonForQuery(query: string) {
  try {
    // Instead of using fetch API, we'll directly use the local functions
    // This avoids URL parsing issues when running server-side
    const relevantDocs = await findRelevantJsonDocuments(query);
    
    if (relevantDocs.length === 0) {
      return null;
    }
    
    // Get full content of the most relevant document
    const mostRelevantDoc = await getJsonDocument(relevantDocs[0].filename);
    
    if (!mostRelevantDoc) {
      return null;
    }
    
    // Process the JSON into a natural language response
    return await processJsonForChat(mostRelevantDoc, query);
  } catch (error) {
    console.error("Error finding and processing JSON for query:", error);
    return null;
  }
} 