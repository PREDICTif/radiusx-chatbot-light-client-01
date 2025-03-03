import { useState, useEffect } from 'react';
import { 
  Conversation, 
  Message, 
  ModelType, 
  ChatInputWithoutBotId,
  MessageInputWithoutMessageId 
} from '@/lib/types';
import { apiRequest } from '@/lib/api';

export function useConversations(
  selectedModel: ModelType, 
  setError: (error: Error | null) => void
) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
      } catch (err) {
        console.error('Error parsing saved conversations:', err);
      }
    }
  }, []);

  // Update messages when activeConversationId changes
  useEffect(() => {
    const fetchConversation = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiRequest('get', `/conversation/${activeConversationId}`);
        const conversation = await response.json() as Conversation;
        
        // Convert messageMap to array and sort by createTime
        const messageArray = Object.values(conversation.messageMap);
        messageArray.sort((a, b) => (a.createTime || 0) - (b.createTime || 0));
        
        setMessages(messageArray);
      } catch (err) {
        console.error('Error fetching conversation:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch conversation'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [activeConversationId, setError]);

  // Save conversations to localStorage when they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const textContent: MessageInputWithoutMessageId = {
        content: [
          {
            contentType: 'text',
            body: content
          }
        ],
        role: 'user'
      };

      const payload: ChatInputWithoutBotId = {
        conversationId: activeConversationId,
        message: {
          ...textContent,
          model: selectedModel
        },
      };

      const response = await apiRequest('post', '/conversation', payload);
      const data = await response.json();

      // If this is a new conversation, update the activeConversationId and add to conversations
      if (!activeConversationId) {
        setActiveConversationId(data.conversationId);
        
        // Fetch the new conversation to get the title
        const conversationResponse = await apiRequest('get', `/conversation/${data.conversationId}`);
        const conversation = await conversationResponse.json() as Conversation;
        
        setConversations(prev => [conversation, ...prev]);
      } else {
        // Update the existing conversation with new message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversationId 
              ? { ...conv, lastMessageId: data.message.id } 
              : conv
          )
        );
      }

      // Add the user message to the messages array
      const userMessage: Message = {
        ...data.message,
        role: 'user',
        content: content
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Fetch the assistant's response
      const messageResponse = await apiRequest('get', `/conversation/${data.conversationId}/${data.message.id}`);
      const messageData = await messageResponse.json();

      // Add the assistant message to the messages array
      const assistantMessage: Message = {
        ...messageData,
        role: 'assistant',
        content: messageData.message?.content[0]?.body || ''
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Re-fetch the conversation to ensure we have the latest state
      const updatedConversationResponse = await apiRequest('get', `/conversation/${data.conversationId}`);
      const updatedConversation = await updatedConversationResponse.json() as Conversation;
      
      // Update the conversations list with the latest conversation data
      setConversations(prev => 
        prev.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      );

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    setActiveConversationId,
    sendMessage,
  };
}
