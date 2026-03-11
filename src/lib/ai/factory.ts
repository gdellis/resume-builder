import {
  AIProvider,
  AIProviderConfig,
  AIProviderInterface,
  PROVIDER_DEFAULTS,
} from './types';
import { OllamaProvider, OpenAIProvider, MistralProvider, AnthropicProvider } from './providers';

export function createAIProvider(config: AIProviderConfig): AIProviderInterface {
  switch (config.provider) {
    case 'ollama':
      return new OllamaProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'mistral':
      return new MistralProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

export function getAIConfigFromEnv(
  provider?: AIProvider,
  model?: string
): AIProviderConfig {
  const selectedProvider = provider || (process.env.AI_PROVIDER as AIProvider) || 'ollama';

  // Get base configuration
  const config: AIProviderConfig = {
    provider: selectedProvider,
    model: model || process.env.AI_MODEL || PROVIDER_DEFAULTS[selectedProvider].model,
    baseUrl: process.env.AI_BASE_URL || PROVIDER_DEFAULTS[selectedProvider].baseUrl,
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
  };

  // Get API key based on provider
  switch (selectedProvider) {
    case 'ollama':
      config.apiKey = process.env.OLLAMA_API_KEY || process.env.AI_API_KEY;
      if (!config.baseUrl) {
        config.baseUrl = process.env.OLLAMA_CLOUD_URL || 'https://ollama.com';
      }
      break;
    case 'openai':
      config.apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
      break;
    case 'mistral':
      config.apiKey = process.env.MISTRAL_API_KEY || process.env.AI_API_KEY;
      break;
    case 'anthropic':
      config.apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
      break;
  }

  return config;
}

export function getProviderFromEnv(): AIProvider {
  return (process.env.AI_PROVIDER as AIProvider) || 'ollama';
}

export function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case 'ollama':
      // Ollama can work without API key for local
      return true;
    case 'openai':
      return !!process.env.OPENAI_API_KEY || !!process.env.AI_API_KEY;
    case 'mistral':
      return !!process.env.MISTRAL_API_KEY || !!process.env.AI_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY || !!process.env.AI_API_KEY;
    default:
      return false;
  }
}

export function getAvailableProviders(): AIProvider[] {
  const allProviders: AIProvider[] = ['ollama', 'openai', 'mistral', 'anthropic'];
  return allProviders.filter(isProviderAvailable);
}

export function getProviderDisplayName(provider: AIProvider): string {
  switch (provider) {
    case 'ollama':
      return 'Ollama';
    case 'openai':
      return 'OpenAI';
    case 'mistral':
      return 'Mistral AI';
    case 'anthropic':
      return 'Anthropic';
    default:
      return provider;
  }
}

export function getProviderDescription(provider: AIProvider): string {
  switch (provider) {
    case 'ollama':
      return 'Run models locally or use Ollama Cloud';
    case 'openai':
      return 'GPT-4 and GPT-3.5 models';
    case 'mistral':
      return 'Fast and efficient language models';
    case 'anthropic':
      return 'Claude models with strong reasoning';
    default:
      return '';
  }
}

export function validateProvider(provider: AIProvider, apiKey?: string): { valid: boolean; error?: string } {
  switch (provider) {
    case 'ollama':
      return { valid: true };
    case 'openai':
    case 'mistral':
    case 'anthropic':
      if (!apiKey && !process.env.AI_API_KEY) {
        return {
          valid: false,
          error: `${getProviderDisplayName(provider)} requires an API key. Please add it to your environment variables.`,
        };
      }
      return { valid: true };
    default:
      return { valid: false, error: 'Unknown provider' };
  }
}

export const ALL_PROVIDERS: AIProvider[] = ['ollama', 'openai', 'mistral', 'anthropic'];
