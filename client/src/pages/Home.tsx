import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import MainChatArea from "@/components/MainChatArea";
import ErrorNotification from "@/components/ErrorNotification";
import { useConversations } from "@/hooks/useConversations";
import { ModelType } from "@/lib/types";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("claude-v3-haiku");

  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    setActiveConversationId,
    sendMessage,
  } = useConversations(selectedModel, setError);

  // Initialize dark mode
  useEffect(() => {
    const prefersDarkMode = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (savedDarkMode || prefersDarkMode) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    closeSidebar();
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    closeSidebar();
  };

  const clearError = () => {
    setError(null);
  };

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );

  return (
    <div className="font-sans antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-screen flex flex-col">
      <AppHeader 
        toggleSidebar={toggleSidebar} 
        toggleDarkMode={toggleDarkMode} 
        darkMode={darkMode} 
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          startNewConversation={startNewConversation}
          selectConversation={selectConversation}
          isSidebarOpen={isSidebarOpen}
        />

        <MainChatArea 
          messages={messages}
          isLoading={isLoading}
          conversation={activeConversation}
          sendMessage={sendMessage}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      </div>

      <ErrorNotification 
        error={error} 
        clearError={clearError} 
      />

      <div 
        onClick={closeSidebar}
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-10 ${isSidebarOpen ? 'block' : 'hidden'}`}
      ></div>
    </div>
  );
}
