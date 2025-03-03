// Check if import.meta.env is available (browser environment)
const isBrowser = typeof window !== 'undefined';
let envApiKey = '';
let envEndpoint = '';
let envRegion = '';

// Use import.meta.env only in browser environment
if (isBrowser && import.meta && import.meta.env) {
  envApiKey = import.meta.env.VITE_AWS_BEDROCK_API_KEY || '';
  envEndpoint = import.meta.env.VITE_AWS_BEDROCK_ENDPOINT || '';
  envRegion = import.meta.env.VITE_AWS_REGION || '';
}

// API Configuration
export const config = {
  // API settings
  api: {
    apiKey: envApiKey || 'H7UI4czPRX7mxrlg67v7tCPL1XnBx5y90p4ieSZ8', // Default API key
    endpoint: envEndpoint || 'https://7pg9r2dlcc.execute-api.us-east-1.amazonaws.com/api',
    headerName: 'x-api-key', // Header name for API key
  },
  
  // Feature flags
  features: {
    useMockResponses: false, // Set to true to use mock responses instead of real API
  },
  
  // Claude model IDs
  models: {
    haiku: 'claude-v3-haiku',
    sonnet: 'claude-v3-sonnet',
    opus: 'claude-v3-opus',
    sonnet35: 'claude-v3.5-sonnet',
    sonnet35v2: 'claude-v3.5-sonnet-v2',
    haiku35: 'claude-v3.5-haiku',
  },
};

// For server-side usage if needed
export const getServerConfig = () => {
  return {
    api: {
      apiKey: process.env.API_KEY || config.api.apiKey,
      endpoint: process.env.API_ENDPOINT || config.api.endpoint,
      headerName: process.env.API_HEADER_NAME || config.api.headerName,
    },
    features: {
      ...config.features,
    },
    models: {
      ...config.models,
    },
  };
};