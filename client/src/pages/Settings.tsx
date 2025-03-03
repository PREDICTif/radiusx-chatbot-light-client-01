import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { apiSettings, setApiSettings } = useSettings();
  const { toast } = useToast();
  
  const [endpoint, setEndpoint] = useState(apiSettings.endpoint);
  const [apiKey, setApiKey] = useState(apiSettings.apiKey);

  useEffect(() => {
    setEndpoint(apiSettings.endpoint);
    setApiKey(apiSettings.apiKey);
  }, [apiSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setApiSettings({
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim()
    });
    
    toast({
      title: "Settings saved",
      description: "Your API settings have been saved successfully.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="endpoint" className="block text-sm font-medium mb-1">
              AWS Bedrock API Endpoint
            </label>
            <input
              id="endpoint"
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              placeholder="https://bedrock-runtime.us-east-1.amazonaws.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your AWS Bedrock API endpoint URL
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              placeholder="Your AWS access key or API key"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key for authentication with AWS Bedrock
            </p>
          </div>
          
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Save Settings
          </button>
        </form>
        
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-medium mb-2">About AWS Bedrock Access</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            To use this application, you need access to AWS Bedrock and the Claude AI models. 
            Follow these steps to get set up:
          </p>
          <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal pl-4 space-y-2">
            <li>Set up an AWS account and enable access to AWS Bedrock</li>
            <li>Request access to the Claude models in AWS Bedrock</li>
            <li>Create an API key with proper permissions</li>
            <li>Enter your endpoint and API key in the settings above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}