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
        const conversation = await response.json();
        
        // If the server uses a different structure than expected,
        // we need to adapt the data format
        if (conversation) {
          // Extract messages based on the format returned by our mock server
          // In our case, we'll construct messages from the conversation data
          const userMessage: Message = {
            id: conversation.id + '_user',
            role: 'user',
            content: 'Your message', // This is a placeholder
            createTime: conversation.createTime
          };
          
          const assistantMessage: Message = {
            id: conversation.lastMessageId,
            role: 'assistant',
            content: 'I\'ll help with that request. What else would you like to know?',
            createTime: new Date().getTime()
          };
          
          setMessages([userMessage, assistantMessage]);
        }
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

      // Construct a simpler payload that matches what our mock server expects
      const payload = {
        conversationId: activeConversationId,
        message: {
          content: [
            {
              contentType: 'text',
              body: content
            }
          ],
          role: 'user',
          model: selectedModel
        }
      };

      // Send message to API
      const response = await apiRequest('post', '/conversation', payload);
      const data = await response.json();

      // Create a new user message to add to the UI
      const userMessage: Message = {
        id: data.message.id || Date.now().toString(),
        role: 'user',
        content: content,
        createTime: Date.now()
      };
      
      // Add user message to chat
      setMessages(prev => [...prev, userMessage]);

      // If this is a new conversation, update the activeConversationId
      if (!activeConversationId) {
        setActiveConversationId(data.conversationId);
        
        // Create a new conversation object
        const newConversation: Conversation = {
          id: data.conversationId,
          title: "New Conversation",
          createTime: Date.now(),
          messageMap: {
            [userMessage.id || '']: userMessage
          },
          lastMessageId: userMessage.id || '',
          botId: null,
          shouldContinue: false
        };
        
        // Add the new conversation to the list
        setConversations(prev => [newConversation, ...prev]);
      }

      // Add a simulated assistant response
      const assistantMessage: Message = {
        id: data.message.id + '_response',
        role: 'assistant',
        content: "I'll help with that request. What else would you like to know?",
        createTime: Date.now() + 1000
      };
      
      // Simulate loading delay for assistant response
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        
        // Update conversation with assistant response
        setConversations(prev => 
          prev.map(conv => 
            conv.id === (data.conversationId || activeConversationId || '')
              ? { 
                  ...conv, 
                  lastMessageId: assistantMessage.id || '',
                  messageMap: {
                    ...conv.messageMap,
                    [userMessage.id || '']: userMessage,
                    [assistantMessage.id || '']: assistantMessage
                  }
                } 
              : conv
          )
        );
      }, 500);

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
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
