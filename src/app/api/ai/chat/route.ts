import { NextRequest, NextResponse } from 'next/server';
import {
  AIProvider,
  ChatMessage,
  ResumeContext,
  AIProviderError,
} from '@/lib/ai/types';
import {
  createAIProvider,
  getAIConfigFromEnv,
  validateProvider,
  getProviderDisplayName,
} from '@/lib/ai/factory';

interface ChatRequest {
  message: string;
  resumeData: unknown;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

function extractResumeContext(resumeData: unknown): ResumeContext {
  if (!resumeData || typeof resumeData !== 'object') {
    return {};
  }

  const data = resumeData as Record<string, unknown>;

  return {
    basics: {
      name: typeof data.basics === 'object' && data.basics ? 
        String((data.basics as Record<string, unknown>).name || '') : '',
      label: typeof data.basics === 'object' && data.basics ? 
        String((data.basics as Record<string, unknown>).label || '') : '',
      summary: typeof data.basics === 'object' && data.basics ? 
        String((data.basics as Record<string, unknown>).summary || '') : '',
    },
    work: { length: Array.isArray(data.work) ? data.work.length : 0 },
    education: { length: Array.isArray(data.education) ? data.education.length : 0 },
    skills: {
      names: Array.isArray(data.skills)
        ? data.skills
            .map((s) => (typeof s === 'object' && s ? (s as Record<string, unknown>).name : ''))
            .filter((name): name is string => typeof name === 'string' && name.length > 0)
        : [],
    },
  };
}

function createChatMessages(userMessage: string): ChatMessage[] {
  return [{ role: 'user', content: userMessage }];
}

async function* streamToIterable(
  stream: ReadableStream<Uint8Array>
): AsyncIterable<Uint8Array> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, resumeData, provider, model, temperature, maxTokens, stream = false } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate provider
    const selectedProvider = provider || 'ollama';
    const validation = validateProvider(selectedProvider);
    
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: validation.error,
          provider: selectedProvider,
          providerName: getProviderDisplayName(selectedProvider),
        },
        { status: 400 }
      );
    }

    // Create provider instance
    const config = getAIConfigFromEnv(selectedProvider, model);
    const aiProvider = createAIProvider(config);

    // Validate provider configuration
    if (!aiProvider.validateConfig()) {
      return NextResponse.json(
        { 
          error: `Invalid configuration for ${getProviderDisplayName(selectedProvider)}. Please check your environment variables.`,
          provider: selectedProvider,
        },
        { status: 400 }
      );
    }

    const messages = createChatMessages(message.trim());
    const resumeContext = extractResumeContext(resumeData);

    if (stream) {
      // Streaming response
      const encoder = new TextEncoder();
      let streamError: Error | null = null;

      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            const streamIterator = aiProvider.streamChat({
              messages,
              resumeContext,
              temperature,
              maxTokens,
              stream: true,
            });

            for await (const chunk of streamIterator) {
              const data = JSON.stringify({
                content: chunk.content,
                done: chunk.done,
                model: chunk.model,
                provider: chunk.provider,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));

              if (chunk.done) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                return;
              }
            }
          } catch (error) {
            streamError = error instanceof Error ? error : new Error('Unknown error');
            const errorData = JSON.stringify({
              error: streamError.message,
              provider: selectedProvider,
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new NextResponse(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      try {
        const response = await aiProvider.chat({
          messages,
          resumeContext,
          temperature,
          maxTokens,
          stream: false,
        });

        return NextResponse.json({
          message: response.content,
          model: response.model,
          provider: response.provider,
          usage: response.usage,
        });
      } catch (error) {
        if (error instanceof AIProviderError) {
          return NextResponse.json(
            {
              error: error.message,
              provider: error.provider,
              statusCode: error.statusCode,
              isRetryable: error.isRetryable,
            },
            { status: error.statusCode || 500 }
          );
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { error: `AI request failed: ${message}` },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 }
    );
  }
}
