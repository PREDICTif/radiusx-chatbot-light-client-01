import { FC } from 'react';
import { Message, Conversation, ModelType } from '@/lib/types';
import ModelSelector from './ModelSelector';
import ChatInput from './ChatInput';
import { formatMessageContent } from '@/lib/utils';

interface MainChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  conversation: Conversation | undefined;
  sendMessage: (message: string) => Promise<void>;
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}

const MainChatArea: FC<MainChatAreaProps> = ({ 
  messages, 
  isLoading, 
  conversation, 
  sendMessage,
  selectedModel,
  setSelectedModel
}) => {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 h-full relative">
      <div className="flex items-center justify-between py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <h2 className="font-medium truncate">
            {conversation?.title || 'New Conversation'}
          </h2>
        </div>
        
        <ModelSelector 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel} 
        />
      </div>

      {/* Chat Messages */}
      <div id="chat-messages" className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Empty state for new conversation */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
              <i className="fas fa-robot text-2xl text-primary"></i>
            </div>
            <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Ask me anything, from creative writing to factual questions, coding help, planning, and more.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1693520999631-6ac145c1dd15?q=80&w=32&h=32&auto=format&fit=crop" 
                    alt="Claude" 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              
              <div 
                className={`max-w-3xl ${
                  message.role === 'user' 
                    ? 'bg-primary text-white rounded-lg rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 rounded-lg rounded-tl-none border border-gray-200 dark:border-gray-700'
                } p-3 shadow-sm`}
              >
                <div dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  <i className="fas fa-user text-xs"></i>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center p-4 gap-2 text-gray-500">
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm">Claude is thinking...</span>
        </div>
      )}

      <ChatInput 
        sendMessage={sendMessage} 
        isLoading={isLoading} 
      />
    </main>
  );
};

export default MainChatArea;
