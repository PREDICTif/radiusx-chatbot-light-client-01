import { config } from './config';
import type { ModelType } from './types';

// Use local API server
export async function apiRequest(
  method: string,
  path: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = `/api${path}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }
  
  return res;
}

// Use our proxy endpoint to communicate with Claude API
export async function claudeApiRequest(
  prompt: string,
  model: ModelType,
  conversationId: string | null = null
): Promise<Response> {
  try {
    // Format the request using our local proxy API
    const requestBody = {
      conversationId: conversationId,
      message: {
        content: [
          {
            contentType: "text",
            body: prompt
          }
        ],
        model: model
      }
    };
    
    console.log("Sending message to proxy endpoint:", requestBody);
    
    // Step 1: Send the message to get conversationId and messageId
    const initialResponse = await apiRequest('POST', '/chat', requestBody);
    const initialData = await initialResponse.json();
    
    console.log("Initial response received:", initialData);
    
    if (!initialData.conversationId || !initialData.message?.id) {
      throw new Error('Invalid response: missing conversation or message ID');
    }
    
    // Step 2: Fetch the actual message content with retry logic handled by server
    const messageResponse = await apiRequest(
      'GET', 
      `/message/${initialData.conversationId}/${initialData.message.id}`
    );
    
    // Return the message response containing the actual content
    return messageResponse;
  } catch (error) {
    console.error("Error in claudeApiRequest:", error);
    throw error;
  }
}
