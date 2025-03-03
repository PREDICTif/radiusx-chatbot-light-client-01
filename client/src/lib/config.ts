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

// AWS Bedrock Configuration
export const config = {
  // API settings
  aws: {
    apiKey: envApiKey || 'H7UI4czPRX7mxrlg67v7tCPL1XnBx5y90p4ieSZ8', // Default for demo
    endpoint: envEndpoint || 'https://bedrock-runtime.us-east-1.amazonaws.com',
    region: envRegion || 'us-east-1',
  },
  
  // Feature flags
  features: {
    useMockResponses: true, // Set to false to use real API
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
    aws: {
      apiKey: process.env.AWS_BEDROCK_API_KEY || config.aws.apiKey,
      endpoint: process.env.AWS_BEDROCK_ENDPOINT || config.aws.endpoint,
      region: process.env.AWS_REGION || config.aws.region,
    },
    features: {
      ...config.features,
    },
    models: {
      ...config.models,
    },
  };
};