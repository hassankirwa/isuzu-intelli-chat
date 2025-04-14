import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { fetchIsuzuContent } from "@/lib/isuzu-fetcher"

export const maxDuration = 60

// Make sure route handler is server-side only
export const runtime = 'nodejs'

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// ISUZU East Africa official information
const ISUZU_OFFICIAL_INFO = `
ISUZU East Africa (formerly General Motors East Africa) is the largest vehicle assembler in the region,
and has been operational since 1975. The company assembles a wide range of ISUZU vehicles including:

- Light Commercial Vehicles: D-MAX pickups
- Buses: MV, FRR, NQR 
- Trucks: N-Series (NLR, NMR, NPR, NQR), F-Series (FRR, FSR, FTR, FVR, FVZ), and G-Series (EXZ, GXZ)

Official Website: www.isuzu.co.ke
Contact: +254 (0) 709 111 000
Email: info.kenya@isuzu.co.ke
Location: Enterprise/Mombasa Road, Industrial Area, Nairobi, Kenya

ISUZU East Africa is committed to its customers by providing high-quality, durable vehicles, 
after-sales service, genuine parts, and excellent customer service.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let messages = [];
    let query = "";
    
    // Process incoming messages
    if (body.message) {
      // If it's a simple message object, create a messages array with just this message
      messages = [{ role: 'user', content: body.message }];
      query = body.message;
    } else if (body.messages && Array.isArray(body.messages)) {
      // If it's an array of messages, use the entire conversation history
      messages = body.messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content
      }));
      
      // Extract the last user message as the query for vector search
      const userMessages = messages.filter((m: { role: string }) => m.role === 'user');
      if (userMessages.length > 0) {
        query = userMessages[userMessages.length - 1].content;
      }
    } else {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    // Collect information from multiple sources
    let contextSources = [];
    
    // 1. Vector search from documents (primary source)
    if (query) {
      try {
        // Query the backend for similar documents
        const searchResponse = await fetch(`${BACKEND_URL}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            top_k: 3,
          }),
        });
        
        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          
          if (searchResults.results && searchResults.results.length > 0) {
            let documentsContext = "## Relevant Information from ISUZU Documents:\n\n";
            
            searchResults.results.forEach((result: any, index: number) => {
              documentsContext += `Document ${index + 1} (relevance: ${(1 - result.score).toFixed(2)}):\n`;
              documentsContext += `${result.content.substring(0, 800)}...\n\n`;
            });
            
            contextSources.push({
              type: "uploaded_documents",
              content: documentsContext
            });
          }
        }
      } catch (searchError) {
        console.error("Vector search error:", searchError);
        // Continue without search results if there's an error
      }
    }

    // 2. Fetch additional information from ISUZU East Africa website utility (if available)
    try {
      const isuzuWebContent = await fetchIsuzuContent(query);
      if (isuzuWebContent && isuzuWebContent.trim().length > 0) {
        contextSources.push({
          type: "official_website",
          content: `## Official ISUZU East Africa Information:\n\n${isuzuWebContent}`
        });
      }
    } catch (fetchError) {
      console.error("ISUZU content fetch error:", fetchError);
      // Continue without this info if there's an error
    }
    
    // Combine all context information with priority to uploaded documents
    const combinedContext = contextSources
      .map(source => source.content)
      .join("\n\n");
    
    // Enhanced system prompt with clear instructions
    const systemContent = `You are IsuzuGPT, the official AI assistant for ISUZU East Africa.

Your primary goal is to provide accurate, helpful information about ISUZU vehicles, services, parts, and products in East Africa.

${ISUZU_OFFICIAL_INFO}

${combinedContext ? `REFERENCE INFORMATION:\n${combinedContext}\n\n` : ''}

VERY IMPORTANT INSTRUCTIONS:

1. If the reference information above contains specific details DIRECTLY answering the user's question, prioritize that information as your primary source of truth.

2. If the reference information is insufficient or doesn't directly address the query:
   - Draw on your knowledge of ISUZU vehicles globally
   - Make it clear which information comes from references vs. your general knowledge
   - Be honest about any uncertainties

3. When discussing specifications, pricing, or availability:
   - Be specific about ISUZU East Africa's offerings when provided in the reference materials
   - Avoid making definitive statements about exact prices unless they appear in the references
   - If pricing or specs aren't in references, provide ranges or refer the user to contact ISUZU directly

4. For any questions about vehicle servicing, parts, or maintenance:
   - Provide general ISUZU recommended guidelines
   - Suggest contacting authorized ISUZU service centers for specific needs

5. Always maintain a professional, knowledgeable tone while being conversational and helpful.

Remember: When in doubt, it's better to acknowledge limitations and provide partial accurate information than to guess or provide potentially misleading information.`;
    
    const systemMessage = {
      role: 'system',
      content: systemContent
    };
    
    // Prepend system message or replace existing one
    const systemIndex = messages.findIndex((m: { role: string }) => m.role === 'system');
    if (systemIndex >= 0) {
      messages[systemIndex] = systemMessage;
    } else {
      messages = [systemMessage, ...messages];
    }

    // Generate response with GPT-4 using the full conversation history and retrieved context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      temperature: 0.7, // Balanced between creativity and factuality
    });
    
    return NextResponse.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "An error occurred processing your request" }, { status: 500 })
  }
}