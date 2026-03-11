import {
  AIProviderConfig,
  AIProviderInterface,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChatCompletionResponse,
  AIProviderError,
  AIProvider,
  createSystemPrompt,
} from '../types';

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MistralStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export class MistralProvider implements AIProviderInterface {
  private config: AIProviderConfig;
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 30000,
    };
    this.baseUrl = config.baseUrl || 'https://api.mistral.ai/v1';
  }

  validateConfig(): boolean {
    return !!this.config.apiKey && !!this.config.model;
  }

  getProviderName(): AIProvider {
    return 'mistral';
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.validateConfig()) {
      throw new AIProviderError(
        'Mistral configuration is invalid - API key required',
        'mistral',
        undefined,
        false
      );
    }

    const messages = [
      { role: 'system', content: createSystemPrompt(request.resumeContext) },
      ...request.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        throw new AIProviderError(
          `Mistral API error: ${errorMessage}`,
          'mistral',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data: MistralResponse = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        model: data.model || this.config.model,
        provider: 'mistral',
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
            }
          : undefined,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof AIProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIProviderError(
          'Mistral request timed out',
          'mistral',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `Mistral request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'mistral',
        undefined,
        true
      );
    }
  }

  async *streamChat(
    request: ChatCompletionRequest
  ): AsyncIterable<StreamingChatCompletionResponse> {
    if (!this.validateConfig()) {
      throw new AIProviderError(
        'Mistral configuration is invalid - API key required',
        'mistral',
        undefined,
        false
      );
    }

    const messages = [
      { role: 'system', content: createSystemPrompt(request.resumeContext) },
      ...request.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        throw new AIProviderError(
          `Mistral API error: ${errorMessage}`,
          'mistral',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        clearTimeout(timeoutId);
        throw new AIProviderError(
          'Failed to get response stream',
          'mistral',
          undefined,
          false
        );
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.startsWith(':')) continue;
            
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              
              if (dataStr === '[DONE]') {
                clearTimeout(timeoutId);
                yield {
                  content: '',
                  done: true,
                  model: this.config.model,
                  provider: 'mistral',
                };
                return;
              }
              
              try {
                const data: MistralStreamChunk = JSON.parse(dataStr);
                
                if (data.choices && data.choices[0]) {
                  const choice = data.choices[0];
                  
                  if (choice.finish_reason) {
                    clearTimeout(timeoutId);
                    yield {
                      content: '',
                      done: true,
                      model: data.model || this.config.model,
                      provider: 'mistral',
                    };
                    return;
                  }

                  if (choice.delta?.content !== undefined) {
                    yield {
                      content: choice.delta.content,
                      done: false,
                      model: data.model || this.config.model,
                      provider: 'mistral',
                    };
                  }
                }
              } catch (parseError) {
                // Skip malformed JSON lines
                continue;
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim() && !buffer.includes('[DONE]')) {
          if (buffer.startsWith('data: ')) {
            const dataStr = buffer.slice(6).trim();
            try {
              const data: MistralStreamChunk = JSON.parse(dataStr);
              if (data.choices?.[0]?.delta?.content) {
                yield {
                  content: data.choices[0].delta.content,
                  done: true,
                  model: data.model || this.config.model,
                  provider: 'mistral',
                };
              }
            } catch {
              // Ignore malformed final chunk
            }
          }
        }
      } finally {
        reader.releaseLock();
        clearTimeout(timeoutId);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof AIProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIProviderError(
          'Mistral request timed out',
          'mistral',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `Mistral stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'mistral',
        undefined,
        true
      );
    }
  }
}
