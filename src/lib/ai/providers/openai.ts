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

interface OpenAIResponse {
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

interface OpenAIStreamChunk {
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

export class OpenAIProvider implements AIProviderInterface {
  private config: AIProviderConfig;
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 30000,
    };
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  validateConfig(): boolean {
    return !!this.config.apiKey && !!this.config.model;
  }

  getProviderName(): AIProvider {
    return 'openai';
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.validateConfig()) {
      throw new AIProviderError(
        'OpenAI configuration is invalid - API key required',
        'openai',
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
          `OpenAI API error: ${errorMessage}`,
          'openai',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data: OpenAIResponse = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        model: data.model || this.config.model,
        provider: 'openai',
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
          'OpenAI request timed out',
          'openai',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `OpenAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'openai',
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
        'OpenAI configuration is invalid - API key required',
        'openai',
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
          `OpenAI API error: ${errorMessage}`,
          'openai',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        clearTimeout(timeoutId);
        throw new AIProviderError(
          'Failed to get response stream',
          'openai',
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
                  provider: 'openai',
                };
                return;
              }
              
              try {
                const data: OpenAIStreamChunk = JSON.parse(dataStr);
                
                if (data.choices && data.choices[0]) {
                  const choice = data.choices[0];
                  
                  if (choice.finish_reason) {
                    clearTimeout(timeoutId);
                    yield {
                      content: '',
                      done: true,
                      model: data.model || this.config.model,
                      provider: 'openai',
                    };
                    return;
                  }

                  if (choice.delta?.content !== undefined) {
                    yield {
                      content: choice.delta.content,
                      done: false,
                      model: data.model || this.config.model,
                      provider: 'openai',
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
              const data: OpenAIStreamChunk = JSON.parse(dataStr);
              if (data.choices?.[0]?.delta?.content) {
                yield {
                  content: data.choices[0].delta.content,
                  done: true,
                  model: data.model || this.config.model,
                  provider: 'openai',
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
          'OpenAI request timed out',
          'openai',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `OpenAI stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'openai',
        undefined,
        true
      );
    }
  }
}
