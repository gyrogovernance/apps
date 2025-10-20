// List of top-tier AI models for easy selection
// Users can also enter custom model names

export interface ModelInfo {
  value: string;
  label: string;
  company: string;
}

export const AI_MODELS: ModelInfo[] = [
  // Google
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', company: 'Google' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', company: 'Google' },
  
  // Meta
  { value: 'lama-4-maverick-17b-128e-instruct', label: 'Lama 4 Maverick 17B 128E Instruct', company: 'Meta' },
  { value: 'lama-4-scout-17b-16e-instruct', label: 'Lama 4 Scout 17B 16E Instruct', company: 'Meta' },
  
  // Anthropic
  { value: 'claude-opus-4-1-20250805-thinking-16k', label: 'Claude Opus 4.1 (Thinking 16K)', company: 'Anthropic' },
  { value: 'claude-opus-4-1-20250805', label: 'Claude Opus 4.1', company: 'Anthropic' },
  { value: 'claude-sonnet-4-5-20250929-thinking-32k', label: 'Claude Sonnet 4.5 (Thinking 32K)', company: 'Anthropic' },
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', company: 'Anthropic' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', company: 'Anthropic' },
  
  // OpenAI
  { value: 'gpt-5-high', label: 'GPT-5 High', company: 'OpenAI' },
  { value: 'gpt-5-chat', label: 'GPT-5 Chat', company: 'OpenAI' },
  
  // Alibaba
  { value: 'qwen3-max-2025-09-23', label: 'Qwen3 Max', company: 'Alibaba' },
  { value: 'qwen3-coder-480b-a35b-instruct', label: 'Qwen3 Coder 480B A35B Instruct', company: 'Alibaba' },
  
  // Deepseek
  { value: 'deepseek-v3.2-exp-thinking', label: 'Deepseek v3.2 Exp (Thinking)', company: 'Deepseek' },
  { value: 'deepseek-v3.2-exp', label: 'Deepseek v3.2 Exp', company: 'Deepseek' },
  
  // X.AI
  { value: 'grok-4-fast', label: 'Grok 4 Fast', company: 'X.AI' },
  { value: 'grok-4-0709', label: 'Grok 4 0709', company: 'X.AI' },
];

// Group models by company for optgroup display
export const MODELS_BY_COMPANY = AI_MODELS.reduce((acc, model) => {
  if (!acc[model.company]) {
    acc[model.company] = [];
  }
  acc[model.company].push(model);
  return acc;
}, {} as Record<string, ModelInfo[]>);

// Get display label with company
export function getModelDisplayLabel(model: ModelInfo): string {
  return `${model.label} (${model.company})`;
}

