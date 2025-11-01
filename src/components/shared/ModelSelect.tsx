// Reusable component for model selection with autocomplete
import React, { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import { AI_MODELS, UNSPECIFIED_MODEL, type ModelInfo } from '../../lib/model-list';

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({
  value,
  onChange,
  id = 'model-select',
  label = 'Model Name',
  placeholder = 'Select or type model name (e.g., Unspecified, gpt-5-chat, claude-sonnet-4-5)',
  helperText = 'Select or type your AI assistant\'s model name',
  required = false,
  className = ''
}) => {
  const [query, setQuery] = useState('');

  // Combine Unspecified with AI models
  const allOptions: ModelInfo[] = [UNSPECIFIED_MODEL, ...AI_MODELS];

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    if (!query) return allOptions;
    
    const lowerQuery = query.toLowerCase();
    return allOptions.filter((model) =>
      model.label.toLowerCase().includes(lowerQuery) ||
      model.value.toLowerCase().includes(lowerQuery) ||
      model.company.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  // Find selected model info
  const selectedModel: ModelInfo | null = allOptions.find((model) => model.value === value) || 
                       (value && value !== UNSPECIFIED_MODEL.value ? { value, label: value, company: 'Custom' } : null);

  const displayValue = selectedModel ? selectedModel.label : (value || '');

  const handleChange = (selected: ModelInfo | null) => {
    const newValue = selected ? selected.value : UNSPECIFIED_MODEL.value;
    onChange(newValue);
    setQuery(''); // Clear query after selection
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    // Allow free-form typing - update value as user types
    onChange(inputValue || UNSPECIFIED_MODEL.value);
  };

  return (
    <Combobox value={selectedModel} onChange={handleChange} nullable>
      <div className={className}>
        <Combobox.Label className="label-text">
          {label}
          {required && ' *'}
        </Combobox.Label>
        <div className="relative mt-1">
          <Combobox.Input
            className="input-field w-full pr-10"
            displayValue={() => displayValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            autoComplete="off"
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className="text-gray-400">▼</span>
          </Combobox.Button>

          <Combobox.Options 
            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-xl ring-1 ring-black/10 border border-gray-200 dark:border-gray-700 focus:outline-none sm:text-sm"
            style={{ zIndex: 40 }}
          >
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                No models found. Press Enter to use "{query}"
              </div>
            ) : (
              <>
                {filteredOptions.map((model) => (
                  <Combobox.Option
                    key={model.value}
                    value={model}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-4 pr-4 ${
                        active
                          ? 'bg-primary text-white'
                          : 'text-gray-900 dark:text-gray-100'
                      }`
                    }
                  >
                    <div className="flex flex-col">
                      <span className="block truncate font-medium">{model.label}</span>
                      {model.company !== 'System' && model.company !== 'Custom' && (
                        <span className="text-xs opacity-70">
                          {model.company}
                        </span>
                      )}
                    </div>
                  </Combobox.Option>
                ))}
                {query && !filteredOptions.find(m => m.value === query) && (
                  <Combobox.Option
                    value={{ value: query, label: query, company: 'Custom' }}
                    className="relative cursor-default select-none py-2 pl-4 pr-4 text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="block truncate font-medium">Use "{query}"</span>
                      <span className="text-xs opacity-70">Custom model</span>
                    </div>
                  </Combobox.Option>
                )}
              </>
            )}
          </Combobox.Options>
        </div>
        {helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {helperText}
          </p>
        )}
      </div>
    </Combobox>
  );
};
