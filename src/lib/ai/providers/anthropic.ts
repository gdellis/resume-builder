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

interface AnthropicContent {
  type: 'text' | 'tool_use' | 'thinking';
  text?: string;
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicContent[];
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicStreamEvent {
  type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop';
  message?: AnthropicResponse;
  index?: number;
  content_block?: AnthropicContent;
  delta?: {
    type?: string;
    text?: string;
    stop_reason?: string;
    usage?: {
      output_tokens?: number;
    };
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider implements AIProviderInterface {
  private config: AIProviderConfig;
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 30000,
    };
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  validateConfig(): boolean {
    return !!this.config.apiKey && !!this.config.model;
  }

  getProviderName(): AIProvider {
    return 'anthropic';
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.validateConfig()) {
      throw new AIProviderError(
        'Anthropic configuration is invalid - API key required',
        'anthropic',
        undefined,
        false
      );
    }

    const systemContent = createSystemPrompt(request.resumeContext);
    const messages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
          system: systemContent,
          messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        throw new AIProviderError(
          `Anthropic API error: ${errorMessage}`,
          'anthropic',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data: AnthropicResponse = await response.json();
      const textContent = data.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('');
      
      return {
        content: textContent,
        model: data.model,
        provider: 'anthropic',
        usage: data.usage
          ? {
              promptTokens: data.usage.input_tokens,
              completionTokens: data.usage.output_tokens,
            }
          : undefined,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof AIProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIProviderError(
          'Anthropic request timed out',
          'anthropic',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `Anthropic request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'anthropic',
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
        'Anthropic configuration is invalid - API key required',
        'anthropic',
        undefined,
        false
      );
    }

    const systemContent = createSystemPrompt(request.resumeContext);
    const messages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
          system: systemContent,
          messages,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        throw new AIProviderError(
          `Anthropic API error: ${errorMessage}`,
          'anthropic',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        clearTimeout(timeoutId);
        throw new AIProviderError(
          'Failed to get response stream',
          'anthropic',
          undefined,
          false
        );
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentModel = this.config.model;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              
              if (dataStr === '[DONE]') {
                clearTimeout(timeoutId);
                yield {
                  content: '',
                  done: true,
                  model: currentModel,
                  provider: 'anthropic',
                };
                return;
              }
              
              try {
                const event: AnthropicStreamEvent = JSON.parse(dataStr);
                
                if (event.type === 'message_start' && event.message) {
                  currentModel = event.message.model;
                  continue;
                }
                
                if (event.type === 'content_block_delta' && event.delta?.text) {
                  yield {
                    content: event.delta.text,
                    done: false,
                    model: currentModel,
                    provider: 'anthropic',
                  };
                }
                
                if (event.type === 'message_stop') {
                  clearTimeout(timeoutId);
                  yield {
                    content: '',
                    done: true,
                    model: currentModel,
                    provider: 'anthropic',
                  };
                  return;
                }
              } catch (parseError) {
                // Skip malformed JSON lines
                continue;
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim()) {
          if (buffer.startsWith('data: ')) {
            const dataStr = buffer.slice(6).trim();
            try {
              const event: AnthropicStreamEvent = JSON.parse(dataStr);
              if (event.type === 'content_block_delta' && event.delta?.text) {
                yield {
                  content: event.delta.text,
                  done: true,
                  model: currentModel,
                  provider: 'anthropic',
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
          'Anthropic request timed out',
          'anthropic',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `Anthropic stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'anthropic',
        undefined,
        true
      );
    }
  }
}
