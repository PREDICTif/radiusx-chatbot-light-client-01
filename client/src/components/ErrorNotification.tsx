import { FC } from 'react';

interface ErrorNotificationProps {
  error: Error | null;
  clearError: () => void;
}

const ErrorNotification: FC<ErrorNotificationProps> = ({ error, clearError }) => {
  if (!error) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-error text-white p-4 rounded-lg shadow-lg transition-transform duration-300 max-w-md flex items-center gap-3 ${error ? 'translate-y-0' : 'translate-y-full'}`}>
      <i className="fas fa-exclamation-circle"></i>
      <div className="flex-1">
        <p className="font-medium">Error</p>
        <p>{error.message}</p>
      </div>
      <button onClick={clearError} className="text-white hover:text-gray-200">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default ErrorNotification;
