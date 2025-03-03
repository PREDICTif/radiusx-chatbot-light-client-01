import { 
  users, 
  type User, 
  type InsertUser, 
  type Conversation, 
  type Message, 
  type InsertConversation, 
  type InsertMessage 
} from "@shared/schema";
import { bedrockApi } from "./api";
import type { ModelType } from "../client/src/lib/types";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation methods
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(message: any): Promise<any>;
  addMessageToConversation(conversationId: string, message: any): Promise<any>;
  
  // Message methods
  getMessage(conversationId: string, messageId: string): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Generate mock response based on user input
  private generateMockResponse(userInput: string): string {
    const inputLower = userInput.toLowerCase();
    
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
    } else if (inputLower.includes("model")) {
      return "This is a demonstration of a Claude AI interface. In the full implementation, you would be communicating with one of several Claude models like Claude Haiku, Sonnet, or Opus. Each model has different capabilities and performance characteristics, with Opus being the most powerful and Haiku being faster but less capable.";
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

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(message: any): Promise<any> {
    // Generate IDs
    const conversationId = `conv_${Date.now()}`;
    const userMessageId = `msg_${Date.now()}`;
    const assistantMessageId = `msg_${Date.now() + 1}`;
    
    // Extract user input and model
    const userInput = message.content[0].body;
    const model: ModelType = message.model || 'claude-v3-haiku';
    
    // Create user message
    const userMessage: Message = {
      id: userMessageId,
      conversationId,
      role: 'user',
      content: userInput,
      createTime: new Date()
    };
    
    // Generate assistant response using BedrockApi
    try {
      // Get response from BedrockApi (uses mock response if configured)
      const responseContent = await bedrockApi.sendMessage(userInput, model);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: assistantMessageId,
        conversationId,
        role: 'assistant',
        content: responseContent,
        createTime: new Date()
      };
      
      // Create message map
      const messageMap: Record<string, Message> = {};
      messageMap[userMessageId] = userMessage;
      messageMap[assistantMessageId] = assistantMessage;
      
      // Create conversation
      const conversation: Conversation = {
        id: conversationId,
        title: this.generateConversationTitle(userInput),
        createTime: new Date(),
        lastMessageId: assistantMessageId,
        botId: model,
        userId: null,
        shouldContinue: false,
        messageMap: messageMap
      };
      
      // Store everything
      this.messages.set(userMessageId, userMessage);
      this.messages.set(assistantMessageId, assistantMessage);
      this.conversations.set(conversationId, conversation);
      
      return {
        conversationId,
        message: {
          id: userMessageId
        }
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  // Generate a conversation title based on the first message content
  private generateConversationTitle(firstMessage: string): string {
    // Truncate the first message if it's too long
    const maxLength = 30;
    let title = firstMessage.trim();
    
    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + '...';
    }
    
    return title || "New Conversation";
  }

  async addMessageToConversation(conversationId: string, message: any): Promise<any> {
    // Get existing conversation
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    // Generate IDs
    const userMessageId = `msg_${Date.now()}`;
    const assistantMessageId = `msg_${Date.now() + 1}`;
    
    // Extract user input and model
    const userInput = message.content[0].body;
    const model: ModelType = message.model || (conversation.botId as ModelType) || 'claude-v3-haiku';
    
    // Create user message
    const userMessage: Message = {
      id: userMessageId,
      conversationId,
      role: 'user',
      content: userInput,
      createTime: new Date()
    };
    
    try {
      // Get response from BedrockApi (uses mock response if configured)
      const responseContent = await bedrockApi.sendMessage(userInput, model);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: assistantMessageId,
        conversationId,
        role: 'assistant',
        content: responseContent,
        createTime: new Date()
      };
      
      // Update message map
      if (!conversation.messageMap) {
        conversation.messageMap = {};
      }
      
      // Type assertion to handle the messageMap being unknown
      const msgMap = conversation.messageMap as Record<string, Message>;
      msgMap[userMessageId] = userMessage;
      msgMap[assistantMessageId] = assistantMessage;
      
      // Store messages
      this.messages.set(userMessageId, userMessage);
      this.messages.set(assistantMessageId, assistantMessage);
      
      // Update conversation
      conversation.lastMessageId = assistantMessageId;
      
      // If first message defined the title, update it
      if (!conversation.title || conversation.title === "New Conversation") {
        conversation.title = this.generateConversationTitle(userInput);
      }
      
      this.conversations.set(conversationId, conversation);
      
      return {
        conversationId,
        message: {
          id: userMessageId
        }
      };
    } catch (error) {
      console.error('Error adding message to conversation:', error);
      throw error;
    }
  }

  // Message methods
  async getMessage(conversationId: string, messageId: string): Promise<Message | undefined> {
    const message = this.messages.get(messageId);
    if (message && message.conversationId === conversationId) {
      return message;
    }
    return undefined;
  }
}

export const storage = new MemStorage();