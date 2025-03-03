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
): Promise<Response> {
  if (!config.api.apiKey) {
    throw new Error('API key is not configured');
  }
  
  const url = config.api.endpoint;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    [config.api.headerName]: config.api.apiKey,
  };
  
  // Format the request based on Claude API requirements
  const requestBody = {
    model: model,
    prompt: prompt,
    temperature: 0.7,
    max_tokens: 1024,
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
  
  return res;
}
