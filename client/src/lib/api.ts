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

// Direct AWS Bedrock API request (for future use)
export async function bedrockApiRequest(
  prompt: string,
  model: ModelType,
): Promise<Response> {
  if (!config.aws.apiKey) {
    throw new Error('AWS Bedrock API key is not configured');
  }
  
  const url = config.aws.endpoint;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.aws.apiKey}`,
    'X-Amz-Region': config.aws.region,
  };
  
  // Format the request based on Claude API requirements
  const requestBody = {
    modelId: model,
    prompt: prompt,
    temperature: 0.7,
    maxTokens: 1024,
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AWS Bedrock API Error ${res.status}: ${errorText || res.statusText}`);
  }
  
  return res;
}
