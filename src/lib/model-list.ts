// List of top-tier AI models for easy selection
// Users can also enter custom model names

export interface ModelInfo {
  value: string;
  label: string;
  company: string;
}

export const UNSPECIFIED_MODEL: ModelInfo = {
  value: 'Unspecified',
  label: 'Unspecified',
  company: 'System'
};

export const AI_MODELS: ModelInfo[] = [
  // Google
  { value: 'gemini-3-pro', label: 'Gemini 3 Pro', company: 'Google' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', company: 'Google' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', company: 'Google' },
  { value: 'gemini-2.5-flash-preview-09-2025', label: 'Gemini 2.5 Flash Preview (09-2025)', company: 'Google' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', company: 'Google' },
  
  // X.AI
  { value: 'grok-4.1-thinking', label: 'Grok 4.1 Thinking', company: 'X.AI' },
  { value: 'grok-4.1', label: 'Grok 4.1', company: 'X.AI' },
  { value: 'grok-4-fast', label: 'Grok 4 Fast', company: 'X.AI' },
  { value: 'grok-4-0709', label: 'Grok 4 0709', company: 'X.AI' },
  { value: 'grok-3-preview-02-24', label: 'Grok 3 Preview (02-24)', company: 'X.AI' },
  
  // OpenAI
  { value: 'gpt-5.1-high', label: 'GPT-5.1 High', company: 'OpenAI' },
  { value: 'gpt-5-high', label: 'GPT-5 High', company: 'OpenAI' },
  { value: 'gpt-5.1', label: 'GPT-5.1', company: 'OpenAI' },
  { value: 'gpt-5-chat', label: 'GPT-5 Chat', company: 'OpenAI' },
  { value: 'gpt-4.5-preview-2025-02-27', label: 'GPT-4.5 Preview (2025-02-27)', company: 'OpenAI' },
  { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (2025-04-14)', company: 'OpenAI' },
  { value: 'chatgpt-4o-latest-20250326', label: 'ChatGPT-4o Latest (2025-03-26)', company: 'OpenAI' },
  { value: 'o3-2025-04-16', label: 'O3 (2025-04-16)', company: 'OpenAI' },
  
  // Anthropic
  { value: 'claude-sonnet-4-5-20250929-thinking-32k', label: 'Claude Sonnet 4.5 (Thinking 32K)', company: 'Anthropic' },
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', company: 'Anthropic' },
  { value: 'claude-opus-4-1-20250805-thinking-16k', label: 'Claude Opus 4.1 (Thinking 16K)', company: 'Anthropic' },
  { value: 'claude-opus-4-1-20250805', label: 'Claude Opus 4.1', company: 'Anthropic' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', company: 'Anthropic' },
  
  // Alibaba (Qwen)
  { value: 'qwen3-max-preview', label: 'Qwen3 Max Preview', company: 'Alibaba' },
  { value: 'qwen3-max-2025-09-23', label: 'Qwen3 Max', company: 'Alibaba' },
  { value: 'qwen3-235b-a22b-instruct-2507', label: 'Qwen3 235B A22B Instruct (2507)', company: 'Alibaba' },
  { value: 'qwen3-30b-a3b-instruct-2507', label: 'Qwen3 30B A3B Instruct (2507)', company: 'Alibaba' },
  { value: 'qwen3-coder-480b-a35b-instruct', label: 'Qwen3 Coder 480B A35B Instruct', company: 'Alibaba' },
  
  // Moonshot AI (Kimi)
  { value: 'kimi-k2-thinking-turbo', label: 'Kimi K2 Thinking Turbo', company: 'Moonshot AI' },
  { value: 'kimi-k2-0905-preview', label: 'Kimi K2 Preview (09-05)', company: 'Moonshot AI' },
  { value: 'kimi-k2-0711-preview', label: 'Kimi K2 Preview (07-11)', company: 'Moonshot AI' },
  
  // Deepseek
  { value: 'deepseek-v3.2-exp-thinking', label: 'Deepseek v3.2 Exp (Thinking)', company: 'Deepseek' },
  { value: 'deepseek-v3.2-exp', label: 'Deepseek v3.2 Exp', company: 'Deepseek' },
  { value: 'deepseek-v3.1-thinking', label: 'Deepseek v3.1 (Thinking)', company: 'Deepseek' },
  { value: 'deepseek-v3.1', label: 'Deepseek v3.1', company: 'Deepseek' },
  
  // Zhipu AI (GLM)
  { value: 'glm-4.6', label: 'GLM-4.6', company: 'Zhipu AI' },
  { value: 'glm-4.5', label: 'GLM-4.5', company: 'Zhipu AI' },
  
  // Mistral AI
  { value: 'mistral-medium-2508', label: 'Mistral Medium (2508)', company: 'Mistral AI' },
  { value: 'mistral-large-2407', label: 'Mistral Large (2407)', company: 'Mistral AI' },
  { value: 'mistral-small-2506', label: 'Mistral Small (2506)', company: 'Mistral AI' },
  
  // Meta
  { value: 'llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick 17B 128E Instruct', company: 'Meta' },
  { value: 'llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B 16E Instruct', company: 'Meta' },
  { value: 'llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct', company: 'Meta' },
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

