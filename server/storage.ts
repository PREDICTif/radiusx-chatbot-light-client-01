import { 
  users, 
  type User, 
  type InsertUser, 
  type Conversation, 
  type Message, 
  type InsertConversation, 
  type InsertMessage 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
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

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(message: any): Promise<any> {
    // This would normally communicate with the Claude API
    // For now, we'll just mock a conversation
    const conversationId = `conv_${Date.now()}`;
    const messageId = `msg_${Date.now()}`;
    
    const conversation: Conversation = {
      id: conversationId,
      title: "New Conversation",
      createTime: new Date(),
      lastMessageId: messageId,
      botId: null,
      userId: null
    };
    
    this.conversations.set(conversationId, conversation);
    
    // Create user message
    const userMessage: Message = {
      id: messageId,
      conversationId,
      role: 'user',
      content: message.content[0].body,
      createTime: new Date()
    };
    
    this.messages.set(messageId, userMessage);
    
    // Mock assistant response
    const assistantMessageId = `msg_${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      conversationId,
      role: 'assistant',
      content: "I'll help with that request. What else would you like to know?",
      createTime: new Date()
    };
    
    this.messages.set(assistantMessageId, assistantMessage);
    
    // Update conversation
    conversation.lastMessageId = assistantMessageId;
    
    return {
      conversationId,
      message: {
        id: messageId
      }
    };
  }

  async addMessageToConversation(conversationId: string, message: any): Promise<any> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    // Add user message
    const messageId = `msg_${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      conversationId,
      role: 'user',
      content: message.content[0].body,
      createTime: new Date()
    };
    
    this.messages.set(messageId, userMessage);
    
    // Mock assistant response
    const assistantMessageId = `msg_${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      conversationId,
      role: 'assistant',
      content: "Here's my response to your latest message. What other questions do you have?",
      createTime: new Date()
    };
    
    this.messages.set(assistantMessageId, assistantMessage);
    
    // Update conversation
    conversation.lastMessageId = assistantMessageId;
    
    return {
      conversationId,
      message: {
        id: messageId
      }
    };
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
