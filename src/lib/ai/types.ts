export type AIProvider = 'ollama' | 'openai' | 'mistral' | 'anthropic';

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResumeContext {
  basics?: {
    name?: string;
    label?: string;
    summary?: string;
  };
  work?: { length: number };
  education?: { length: number };
  skills?: { names: string[] };
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  resumeContext?: ResumeContext;
}

export interface ChatCompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  model: string;
  provider: AIProvider;
}

export interface StreamingChatCompletionResponse {
  content: string;
  done: boolean;
  model: string;
  provider: AIProvider;
}

export interface AIProviderInterface {
  chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  streamChat(request: ChatCompletionRequest): AsyncIterable<StreamingChatCompletionResponse>;
  validateConfig(): boolean;
  getProviderName(): AIProvider;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  ollama: ['gpt-oss:120b-cloud', 'llama3.2', 'llama3.1', 'mistral', 'codellama'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
};

export const PROVIDER_DEFAULTS: Record<AIProvider, { model: string; baseUrl?: string }> = {
  ollama: { model: 'llama3.2', baseUrl: 'https://ollama.com' },
  openai: { model: 'gpt-4o-mini' },
  mistral: { model: 'mistral-small-latest' },
  anthropic: { model: 'claude-3-5-sonnet-20241022' },
};

export function getDefaultModel(provider: AIProvider): string {
  return PROVIDER_DEFAULTS[provider].model;
}

export function getDefaultBaseUrl(provider: AIProvider): string | undefined {
  return PROVIDER_DEFAULTS[provider].baseUrl;
}

export function getAvailableModels(provider: AIProvider): string[] {
  return PROVIDER_MODELS[provider];
}

export function validateProviderConfig(provider: AIProvider, apiKey?: string): boolean {
  switch (provider) {
    case 'ollama':
      // Ollama can work without API key for local instances
      return true;
    case 'openai':
    case 'mistral':
    case 'anthropic':
      // These providers require an API key
      return !!apiKey && apiKey.length > 0;
    default:
      return false;
  }
}

export function createSystemPrompt(resumeContext?: ResumeContext): string {
  const ctx = resumeContext;
  
  return `You are a professional resume writing assistant. Help the user improve their resume content.

${ctx ? `Current resume data:
- Name: ${ctx.basics?.name || 'Not provided'}
- Job Title: ${ctx.basics?.label || 'Not provided'}
- Summary: ${ctx.basics?.summary || 'Not provided'}
- Work Experience: ${ctx.work?.length || 0} entries
- Education: ${ctx.education?.length || 0} entries
- Skills: ${ctx.skills?.names?.join(', ') || 'None'}` : 'No resume data provided.'}

Guidelines:
1. Write professional, concise content
2. Use action verbs and quantify achievements where possible
3. Keep summaries to 2-4 sentences
4. Focus on relevant experience for the user's target role
5. Format responses with clear sections when needed`;
}
