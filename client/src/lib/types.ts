// Available models
export type ModelType = 
  | 'claude-v3-haiku'
  | 'claude-v3-sonnet'
  | 'claude-v3-opus'
  | 'claude-v3.5-sonnet'
  | 'claude-v3.5-sonnet-v2'
  | 'claude-v3.5-haiku'
  | 'claude-instant-v1'
  | 'claude-v2'
  | 'mistral-7b-instruct'
  | 'mixtral-8x7b-instruct'
  | 'mistral-large'
  | 'amazon-nova-pro'
  | 'amazon-nova-lite'
  | 'amazon-nova-micro';

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  createTime: number;
  messageMap: Record<string, Message>;
  lastMessageId: string;
  botId: string | null;
  shouldContinue: boolean;
  userId?: number | null;
}

// Message types
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createTime?: number;
  conversationId?: string;
}

export interface TextContent {
  contentType: 'text';
  body: string;
}

export interface ImageContent {
  contentType: 'image';
  mediaType: string;
  body: string;
}

export interface AttachmentContent {
  contentType: 'attachment';
  fileName: string;
  body: string;
}

export type ContentItem = TextContent | ImageContent | AttachmentContent;

export interface MessageInputWithoutMessageId {
  content: ContentItem[];
  role: 'user' | 'assistant';
  model?: ModelType;
}

export interface ChatInputWithoutBotId {
  conversationId: string | null;
  message: MessageInputWithoutMessageId;
  continueGenerate?: boolean;
}

export interface MessageOutput {
  id: string;
  role: 'user' | 'assistant';
  content: ContentItem[];
  createTime: number;
}

export interface ChatOutputWithoutBotId {
  conversationId: string;
  message: MessageOutput;
  createTime: number;
}

export interface MessageRequestedResponse {
  conversationId: string;
  message: {
    id: string;
  };
}
