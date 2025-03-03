import { FC } from 'react';
import { Conversation } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  startNewConversation: () => void;
  selectConversation: (id: string) => void;
  isSidebarOpen: boolean;
}

const Sidebar: FC<SidebarProps> = ({ 
  conversations, 
  activeConversationId, 
  startNewConversation, 
  selectConversation,
  isSidebarOpen
}) => {
  return (
    <aside 
      className={`fixed md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 transition-transform duration-300 flex flex-col`}
    >
      <div className="p-4">
        <button 
          onClick={startNewConversation}
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-md py-2 px-4 flex items-center justify-center gap-2 transition-colors"
        >
          <i className="fas fa-plus text-sm"></i>
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 px-2">
        <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold px-2 mb-2">
          Recent Conversations
        </h2>
        
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <button 
              key={conversation.id}
              onClick={() => selectConversation(conversation.id)}
              className={`w-full text-left px-3 py-2 rounded-md mb-1 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm ${conversation.id === activeConversationId ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              <i className="fas fa-message text-gray-400"></i>
              <div className="truncate flex-1">
                <span>{conversation.title}</span>
              </div>
              <span className="text-xs text-gray-400">{formatDate(conversation.createTime)}</span>
            </button>
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
            No conversations yet
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
