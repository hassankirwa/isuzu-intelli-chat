import { NextRequest, NextResponse } from "next/server";
import { listJsonDocuments, getJsonDocument } from "@/lib/document-store";
import { OpenAI } from "openai";

// Make sure route handler is server-side only
export const runtime = 'nodejs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// CORS headers for better compatibility
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: NextRequest) {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { 
        status: 400,
        headers 
      });
    }

    // Get all documents
    const documents = await listJsonDocuments();
    if (!documents || documents.length === 0) {
      return NextResponse.json({ message: "No documents found to search" }, { 
        status: 404,
        headers 
      });
    }

    // Prepare document data to search
    const documentContents = await Promise.all(
      documents.map(async (doc) => {
        const content = await getJsonDocument(doc.filename);
        return {
          filename: doc.filename,
          type: doc.metadata?.documentType || "general",
          content: content
        };
      })
    );

    // Use OpenAI to search through the documents for relevant information
    const systemPrompt = `
You are a document search assistant. Your job is to:
1. Search through JSON documents to find information relevant to the user's query
2. Return only the specific information requested, formatted clearly
3. If multiple relevant pieces of information are found, include all of them
4. If no relevant information is found, say so clearly

The documents you have access to are:
${documentContents.map(doc => `- ${doc.filename} (${doc.type})`).join('\n')}
`;

    const userMessage = `
Query: ${query}

Please search through these documents and provide the most relevant information:

${JSON.stringify(documentContents, null, 2)}

When responding:
1. Only include information that directly answers the query
2. Cite the specific document filename where you found the information
3. Format your response as clear, concise text
`;

    // Request completion from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    // Extract and return the assistant's response
    const assistantResponse = response.choices[0]?.message?.content || "No information found";
    
    return NextResponse.json({
      query,
      response: assistantResponse,
      documentCount: documents.length
    }, { headers });
    
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500, headers });
  }
} 