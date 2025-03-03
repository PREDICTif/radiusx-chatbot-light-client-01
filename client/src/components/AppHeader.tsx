import { FC } from 'react';

interface AppHeaderProps {
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
}

const AppHeader: FC<AppHeaderProps> = ({ toggleSidebar, toggleDarkMode, darkMode }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 z-10">
      <button 
        onClick={toggleSidebar}
        className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary md:hidden" 
        aria-label="Toggle sidebar"
      >
        <i className="fas fa-bars text-xl"></i>
      </button>
      <div className="flex items-center ml-3 md:ml-0">
        <img 
          src="https://images.unsplash.com/photo-1693520999631-6ac145c1dd15?q=80&w=32&h=32&auto=format&fit=crop" 
          alt="Claude AI Logo" 
          className="h-8 w-8 rounded-md mr-2"
        />
        <h1 className="text-xl font-semibold">Claude AI</h1>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button 
          onClick={toggleDarkMode}
          className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary p-2 rounded-full" 
          aria-label="Toggle dark mode"
        >
          <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
