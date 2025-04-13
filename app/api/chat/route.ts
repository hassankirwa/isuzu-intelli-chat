import type { NextRequest } from "next/server"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { fetchIsuzuContent } from "@/lib/isuzu-fetcher"
import { queryCollection } from "@/lib/chroma-client"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // Get the latest user message
  const latestMessage = messages[messages.length - 1]

  // Only retrieve context if it's a user message
  let relevantContent = ""
  if (latestMessage.role === "user") {
    try {
      // First, try to get relevant content from ChromaDB
      const chromaResults = await queryCollection(latestMessage.content, 5)
      
      if (chromaResults && chromaResults.length > 0) {
        // Format ChromaDB results
        relevantContent = chromaResults.map(result => {
          // Include metadata if available
          const metadataStr = result.metadata ? 
            `\nSource: ${result.metadata.filename || 'Unknown'}` : '';
          
          return `${result.content}${metadataStr}`;
        }).join('\n\n---\n\n');
      } else {
        // Fallback to the original fetcher if no ChromaDB results
        relevantContent = await fetchIsuzuContent(latestMessage.content)
      }
    } catch (error) {
      console.error("Error retrieving content:", error)
      
      // Fallback to the original fetcher if there was an error with ChromaDB
      try {
        relevantContent = await fetchIsuzuContent(latestMessage.content)
      } catch (fetchError) {
        console.error("Error with fallback content retrieval:", fetchError)
      }
    }
  }

  // Create an enhanced system message with the retrieved context
  const enhancedSystemMessage = `You are ISUZU IntelliChat, the official AI assistant for ISUZU East Africa, a global leader in commercial vehicles and diesel engines known for reliability, durability, and innovation.

${
  relevantContent
    ? `RELEVANT INFORMATION FROM ISUZU EAST AFRICA:
${relevantContent}`
    : ""
}

RESPONSE GUIDELINES:
- ${relevantContent ? "Use the RELEVANT INFORMATION section above to provide accurate details about ISUZU products." : "Provide general information about ISUZU products based on your knowledge."}
- If the relevant information contains specific data that answers the user's question, use it in your response.
- For technical questions, include specific details when available (engine specs, towing capacity, dimensions, etc.).
- When discussing maintenance, provide general schedules but emphasize the importance of following the owner's manual.
- For dealer inquiries, suggest visiting the ISUZU East Africa website's dealer locator.
- If unsure about specific ISUZU details, provide general automotive information and clearly suggest contacting an ISUZU dealer.
- Never make up information about ISUZU products or services.
- Emphasize that you are providing information specifically for ISUZU East Africa, which may differ from other regions.
- When providing pricing information, always mention that prices are from the 2022-2023 price bulletin and may have changed, encouraging users to contact a dealer for current pricing.

TONE AND STYLE:
- Maintain a professional, helpful, and knowledgeable tone that reflects ISUZU's brand values.
- Be concise but thorough, focusing on practical information.
- Use technical terminology appropriately but explain complex concepts in accessible language.
- Show enthusiasm for ISUZU's engineering excellence and reliability.

FORMATTING:
- Use markdown formatting to improve readability.
- Utilize headings (##) for main sections.
- Use bullet points for lists of features or specifications.
- Use numbered lists for sequential instructions or processes.
- Bold important information and model names.
- Create tables for comparing specifications when appropriate.

Always identify yourself as ISUZU IntelliChat at the beginning of the conversation, and sign off by encouraging the user to contact their local ISUZU East Africa dealer for personalized assistance.`

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: enhancedSystemMessage,
  })

  return result.toDataStreamResponse()
}

