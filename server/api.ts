import { getServerConfig } from '../client/src/lib/config';
import type { ModelType } from '../client/src/lib/types';

/**
 * Handles communication with Claude API endpoint
 */
export class ClaudeApi {
  private apiKey: string;
  private endpoint: string;
  private headerName: string;
  private useMockResponses: boolean;
  
  constructor() {
    const config = getServerConfig();
    // Use environment variables or defaults from config
    this.apiKey = config.api.apiKey;
    this.endpoint = config.api.endpoint;
    this.headerName = config.api.headerName;
    this.useMockResponses = config.features.useMockResponses;
    
    // Log configuration for debugging
    console.log(`Claude API initialized with endpoint: ${this.endpoint}`);
    console.log(`Using mock responses: ${this.useMockResponses ? 'Yes' : 'No'}`);
  }
  
  /**
   * Send a request to Claude API endpoint
   */
  async sendMessage(
    prompt: string, 
    model: ModelType = 'claude-v3-haiku',
    conversationId?: string | null
  ): Promise<any> {
    // If configured to use mock responses, don't make actual API calls
    if (this.useMockResponses) {
      return {
        text: this.generateMockResponse(prompt),
        apiConversationId: null,
        apiMessageId: null
      };
    }
    
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }
    
    try {
      const url = `${this.endpoint}/conversation`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add the API key with the specified header name
      headers[this.headerName] = this.apiKey;
      
      // Format request according to Claude API - following the OpenAPI spec
      const requestBody = {
        conversationId: conversationId || null,
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
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      // Parse the API response
      if (response.status === 200) {
        // Initial message creation returns messageId and conversationId
        const initialResponse = await response.json();
        console.log('Initial response:', JSON.stringify(initialResponse));
        
        if (initialResponse.conversationId && initialResponse.messageId) {
          // Save the API conversation ID and message ID
          const apiConversationId = initialResponse.conversationId;
          const apiMessageId = initialResponse.messageId;
          
          // We need to wait a brief moment to ensure the message is available
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Then fetch the actual assistant response (this will be the assistant's message)
          const messageUrl = `${this.endpoint}/conversation/${apiConversationId}/${apiMessageId}`;
          console.log('Fetching message from:', messageUrl);
          
          let messageData;
          let messageResponse = await fetch(messageUrl, {
            method: 'GET',
            headers
          });
          
          // Implement retry logic if needed
          if (!messageResponse.ok && messageResponse.status === 404) {
            // Try up to 3 times with increasing delays
            for (let retry = 1; retry <= 3; retry++) {
              console.log(`Message not ready yet, retry ${retry} of 3 in ${retry * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retry * 1000));
              
              messageResponse = await fetch(messageUrl, {
                method: 'GET',
                headers
              });
              
              if (messageResponse.ok) {
                break;
              }
              
              if (retry === 3) {
                const errorText = await messageResponse.text();
                console.error(`Error fetching message after retries: ${messageResponse.status} - ${errorText}`);
                return {
                  text: `Error getting Claude response after retries: ${messageResponse.status}`,
                  apiConversationId,
                  apiMessageId
                };
              }
            }
          }
          
          if (messageResponse.ok) {
            messageData = await messageResponse.json();
            console.log('Message data response:', JSON.stringify(messageData));
            
            // Extract text content from the response
            if (messageData.message && 
                messageData.message.content && 
                messageData.message.content.length > 0) {
              // Find the text content
              const textContent = messageData.message.content.find(
                (item: any) => item.contentType === 'text'
              );
              
              if (textContent && textContent.body) {
                // Return both the text content and the API IDs
                return {
                  text: textContent.body,
                  apiData: messageData,
                  apiConversationId,
                  apiMessageId
                };
              }
            }
            
            // Fallback: Return the entire response data if we can't extract content properly
            return {
              text: JSON.stringify(messageData),
              apiData: messageData,
              apiConversationId,
              apiMessageId
            };
          } else {
            const errorText = await messageResponse.text();
            console.error(`Error fetching message: ${messageResponse.status} - ${errorText}`);
            return {
              text: `Error getting Claude response: ${messageResponse.status}`,
              apiConversationId,
              apiMessageId
            };
          }
        }
        
        return {
          text: "No proper response from API",
          apiConversationId: null,
          apiMessageId: null
        };
      }
      
      return {
        text: "Failed to get a valid response from API",
        apiConversationId: null,
        apiMessageId: null
      };
      
    } catch (error) {
      console.error('Error calling Claude API:', error);
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

export const claudeApi = new ClaudeApi();