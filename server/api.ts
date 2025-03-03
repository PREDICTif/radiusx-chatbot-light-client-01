import { config } from '../client/src/lib/config';
import type { ModelType } from '../client/src/lib/types';

/**
 * Handles communication with AWS Bedrock API for Claude models
 */
export class BedrockApi {
  private apiKey: string;
  private endpoint: string;
  private region: string;
  private useMockResponses: boolean;
  
  constructor() {
    // Use environment variables or defaults from config
    this.apiKey = process.env.AWS_BEDROCK_API_KEY || config.aws.apiKey;
    this.endpoint = process.env.AWS_BEDROCK_ENDPOINT || config.aws.endpoint;
    this.region = process.env.AWS_REGION || config.aws.region;
    this.useMockResponses = config.features.useMockResponses;
  }
  
  /**
   * Send a request to AWS Bedrock API
   */
  async sendMessage(
    prompt: string, 
    model: ModelType = 'claude-v3-haiku'
  ): Promise<string> {
    // If configured to use mock responses, don't make actual API calls
    if (this.useMockResponses) {
      return this.generateMockResponse(prompt);
    }
    
    if (!this.apiKey) {
      throw new Error('AWS Bedrock API key not configured');
    }
    
    try {
      const url = `${this.endpoint}/model/${model}/invoke`;
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Amz-Region': this.region
      };
      
      // Format request according to AWS Bedrock/Claude API
      const requestBody = {
        prompt: `Human: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
        anthropic_version: "bedrock-2023-05-31"
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AWS Bedrock API Error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      return result.completion || "No response from API";
      
    } catch (error) {
      console.error('Error calling AWS Bedrock API:', error);
      throw error;
    }
  }
  
  // Mock response generator for testing without API access
  private generateMockResponse(prompt: string): string {
    const inputLower = prompt.toLowerCase();
    
    if (inputLower.includes("test")) {
      return "This is a test response. I'm a mock Claude AI assistant running in a demonstration environment. I can simulate responses, but I'm not actually connecting to Claude AI at the moment. This is just a frontend demonstration.";
    } else if (inputLower.includes("hello") || inputLower.includes("hi ")) {
      return "Hello there! I'm a simulated Claude assistant. How can I help you today? Note that this is a demonstration version running locally, not connected to the actual Claude API.";
    } else if (inputLower.includes("help")) {
      return "I can help you with a variety of tasks like answering questions, explaining concepts, or assisting with creative writing. What specifically would you like help with? (Note: This is a mock implementation for demonstration purposes)";
    } else if (inputLower.includes("weather")) {
      return "I don't have access to real-time weather data in this mock implementation. In a real implementation with Claude AI, I could potentially help interpret weather data if provided, but would not have direct access to current weather information.";
    } else if (inputLower.includes("time")) {
      return `The current time according to the server is ${new Date().toLocaleTimeString()}. This is based on the server's clock.`;
    } else if (inputLower.includes("api key")) {
      return "The API key for AWS Bedrock is configured in the .env file. This key is used to authenticate requests to the AWS Bedrock service. In this demo mode, no actual API calls are being made to protect your key and avoid charges.";
    } else if (inputLower.includes("endpoint")) {
      return "The AWS Bedrock endpoint is configured in the .env file. The default endpoint is regional, such as https://bedrock-runtime.us-east-1.amazonaws.com. You can change this to match your preferred AWS region.";
    } else if (inputLower.includes("model")) {
      return "This application supports multiple Claude AI models through AWS Bedrock, including Claude Haiku (faster, lighter), Claude Sonnet (balanced), and Claude Opus (most powerful). You can select different models using the dropdown in the interface.";
    } else if (inputLower.includes("what can you do")) {
      return "In a real implementation, Claude can write, edit, summarize, translate, answer questions about documents, brainstorm ideas, create content, help with coding, analyze data, and much more. This mock version is just demonstrating the UI interface.";
    } else if (inputLower.includes("github") || inputLower.includes("repo")) {
      return "This project is designed to be a frontend client for Claude AI. You can fork the repository on GitHub, modify it for your needs, and integrate it with your own backend that connects to the actual Claude API through AWS Bedrock.";
    } else if (inputLower.length < 10) {
      return "I noticed your message was quite short. Could you provide more details so I can give you a more helpful response? Remember, this is a demonstration with simulated responses.";
    } else {
      return "Thank you for your message. In a production environment, Claude AI would provide a thoughtful response based on your input. This mock implementation has limited response capabilities for demonstration purposes.";
    }
  }
}

export const bedrockApi = new BedrockApi();