// Available Claude models
export type ModelType = 
  | 'claude-3-haiku-20240307'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-opus-20240229';

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  createTime: number;
  messageMap: Record<string, Message>;
  lastMessageId: string;
  botId: string | null;
  shouldContinue: boolean;
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
