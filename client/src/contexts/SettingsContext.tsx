import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiSettings {
  endpoint: string;
  apiKey: string;
}

interface SettingsContextType {
  apiSettings: ApiSettings;
  setApiSettings: (settings: ApiSettings) => void;
  hasApiSettings: boolean;
}

const defaultSettings: ApiSettings = {
  endpoint: "",
  apiKey: ""
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiSettings, setApiSettings] = useState<ApiSettings>(defaultSettings);
  const [hasApiSettings, setHasApiSettings] = useState<boolean>(false);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setApiSettings(parsedSettings);
        setHasApiSettings(!!parsedSettings.endpoint && !!parsedSettings.apiKey);
      } catch (err) {
        console.error('Error parsing saved API settings:', err);
      }
    }
  }, []);

  const updateApiSettings = (settings: ApiSettings) => {
    setApiSettings(settings);
    setHasApiSettings(!!settings.endpoint && !!settings.apiKey);
    localStorage.setItem('apiSettings', JSON.stringify(settings));
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        apiSettings, 
        setApiSettings: updateApiSettings,
        hasApiSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}