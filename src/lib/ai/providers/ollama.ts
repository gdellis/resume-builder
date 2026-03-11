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

export class OllamaProvider implements AIProviderInterface {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://ollama.com',
      timeout: config.timeout || 30000,
    };
  }

  validateConfig(): boolean {
    return !!this.config.baseUrl && !!this.config.model;
  }

  getProviderName(): AIProvider {
    return 'ollama';
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.validateConfig()) {
      throw new AIProviderError(
        'Ollama configuration is invalid',
        'ollama',
        undefined,
        false
      );
    }

    const messages = [
      { role: 'system', content: createSystemPrompt(request.resumeContext) },
      ...request.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: false,
          options: {
            temperature: request.temperature ?? 0.7,
            num_predict: request.maxTokens ?? 2048,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIProviderError(
          `Ollama API error: ${errorText}`,
          'ollama',
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();
      
      return {
        content: data.message?.content || '',
        model: this.config.model,
        provider: 'ollama',
        usage: data.eval_count
          ? {
              promptTokens: data.prompt_eval_count || 0,
              completionTokens: data.eval_count || 0,
            }
          : undefined,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof AIProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIProviderError(
          'Ollama request timed out',
          'ollama',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ollama',
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
        'Ollama configuration is invalid',
        'ollama',
        undefined,
        false
      );
    }

    const messages = [
      { role: 'system', content: createSystemPrompt(request.resumeContext) },
      ...request.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: true,
          options: {
            temperature: request.temperature ?? 0.7,
            num_predict: request.maxTokens ?? 2048,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const errorText = await response.text();
        throw new AIProviderError(
          `Ollama API error: ${errorText}`,
          'ollama',
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        clearTimeout(timeoutId);
        throw new AIProviderError(
          'Failed to get response stream',
          'ollama',
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
            if (!line.trim()) continue;
            
            try {
              const data = JSON.parse(line);
              
              if (data.error) {
                throw new AIProviderError(
                  `Ollama stream error: ${data.error}`,
                  'ollama',
                  undefined,
                  true
                );
              }

              yield {
                content: data.message?.content || '',
                done: data.done || false,
                model: this.config.model,
                provider: 'ollama',
              };

              if (data.done) {
                clearTimeout(timeoutId);
                return;
              }
            } catch (parseError) {
              // Skip malformed JSON lines
              continue;
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            yield {
              content: data.message?.content || '',
              done: true,
              model: this.config.model,
              provider: 'ollama',
            };
          } catch {
            // Ignore malformed final chunk
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
          'Ollama request timed out',
          'ollama',
          undefined,
          true
        );
      }
      throw new AIProviderError(
        `Ollama stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ollama',
        undefined,
        true
      );
    }
  }
}
