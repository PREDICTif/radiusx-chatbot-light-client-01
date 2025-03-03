import { FC, useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

const ChatInput: FC<ChatInputProps> = ({ sendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !message.trim()) return;
    
    const currentMessage = message;
    setMessage('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    await sendMessage(currentMessage);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            placeholder="Type your message..."
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg pl-3 pr-10 py-3 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={1}
          ></textarea>
          <div className="absolute right-3 bottom-3 flex gap-2">
            <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Attach file">
              <i className="fas fa-paperclip"></i>
            </button>
          </div>
        </div>
        <button 
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`bg-primary hover:bg-primary/90 text-white rounded-full p-3 flex-shrink-0 transition-colors ${isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <i className="fas fa-shield-alt mr-1"></i>
        <span>Claude may display inaccurate info, including about people</span>
      </div>
    </div>
  );
};

export default ChatInput;
