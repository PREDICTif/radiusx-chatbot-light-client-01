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

// Direct API request to the Claude API endpoint
export async function claudeApiRequest(
  prompt: string,
  model: ModelType,
  conversationId: string | null = null
): Promise<Response> {
  if (!config.api.apiKey) {
    throw new Error('API key is not configured');
  }
  
  const url = `${config.api.endpoint}/conversation`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    [config.api.headerName]: config.api.apiKey,
  };
  
  // Format the request based on Claude API requirements
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
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }
  
  // Parse the initial response
  const initialResponse = await res.json();
  
  // If we have a conversation ID and message ID, fetch the actual message
  if (initialResponse.conversationId && initialResponse.messageId) {
    const messageUrl = `${config.api.endpoint}/conversation/${initialResponse.conversationId}/${initialResponse.messageId}`;
    const messageResponse = await fetch(messageUrl, {
      method: 'GET',
      headers
    });
    
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      throw new Error(`API Error ${messageResponse.status}: ${errorText || messageResponse.statusText}`);
    }
    
    // Return the actual message response
    return messageResponse;
  }
  
  // Return the original response if it doesn't have conversation/message IDs
  // This creates a new Response object with the same data
  return new Response(JSON.stringify(initialResponse), {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
