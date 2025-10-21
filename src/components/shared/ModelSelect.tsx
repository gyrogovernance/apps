// Reusable component for model selection with datalist
import React from 'react';
import { AI_MODELS } from '../../lib/model-list';

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
  id = 'model-suggestions',
  label = 'Model Name',
  placeholder = 'Select or type model name (e.g., gpt-5-chat, claude-sonnet-4-5)',
  helperText = 'Select from the list or enter a custom model name',
  required = false,
  className = ''
}) => {
  return (
    <div className={className}>
      <label className="label-text">
        {label}
        {required && ' *'}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={id}
        placeholder={placeholder}
        className="input-field"
      />
      <datalist id={id}>
        {AI_MODELS.map((model) => (
          <option key={model.value} value={model.value} />
        ))}
      </datalist>
      {helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

