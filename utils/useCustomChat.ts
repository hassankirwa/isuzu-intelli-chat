import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UseCustomChatOptions {
  api: string;
  initialMessages?: Message[];
  onFinish?: (message: Message) => void;
}

export function useCustomChat({
  api,
  initialMessages = [],
  onFinish,
}: UseCustomChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // For managing the EventSource connection
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Create a user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
    };
    
    // Optimistically add the user message to the UI
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Clear the input
    setInput('');
    
    // Start loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a placeholder for the assistant's response
      const responseId = uuidv4();
      const assistantMessage: Message = {
        id: responseId,
        role: 'assistant',
        content: '',
      };
      
      // Add the empty assistant message to the messages
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      
      // Send the request to the API but don't use fetch for streaming
      const messagePayload = {
        message: userMessage.content,
        messages: messages
          .concat(userMessage)
          .map(({ role, content }) => ({ role, content })),
      };
      
      // Use EventSource (SSE) for streaming
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Need to use POST with body, so use fetch to create a Request first
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} ${errorData}`);
      }
      
      // Parse the JSON response
      const responseData = await response.json();
      let responseText = '';
      
      if (responseData && responseData.response) {
        responseText = responseData.response;
        
        // Update the assistant message with the response content
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === responseId
              ? { ...msg, content: responseText }
              : msg
          )
        );
      }
      
      // Call onFinish with the final message
      const finalMessage: Message = {
        id: responseId,
        role: 'assistant',
        content: responseText,
      };
      
      onFinish?.(finalMessage);
      
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [api, input, messages, onFinish]);
  
  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    setInput,
  };
} 