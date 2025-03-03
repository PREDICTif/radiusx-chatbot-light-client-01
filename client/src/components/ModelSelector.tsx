import { FC } from 'react';
import { ModelType } from '@/lib/types';

interface ModelSelectorProps {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}

const ModelSelector: FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as ModelType);
  };

  return (
    <div className="relative">
      <select 
        value={selectedModel}
        onChange={handleChange}
        className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
        <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
        <option value="claude-3-opus-20240229">Claude 3 Opus</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <i className="fas fa-chevron-down text-xs"></i>
      </div>
    </div>
  );
};

export default ModelSelector;
