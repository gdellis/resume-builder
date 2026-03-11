'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ResumeData } from '@/types/resume';
import { useResumeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Send, Loader2, Sparkles, Settings } from 'lucide-react';
import { AIProvider, getAvailableModels, PROVIDER_DEFAULTS } from '@/lib/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  onClose: () => void;
  resumeData: ResumeData;
}

export function AIAssistant({ onClose, resumeData }: AIAssistantProps) {
  const { aiConfig, setAIProvider, setAIModel, setAIStreaming, updateAIConfig } =
    useResumeStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI resume assistant. I can help you:\n\n• Write professional summaries\n• Generate achievement bullet points\n• Suggest skills based on your experience\n• Improve your job descriptions\n• Give feedback on your resume content\n\nWhat would you like help with?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleProviderChange = (provider: AIProvider) => {
    setAIProvider(provider);
    // Update model to default for new provider
    setAIModel(PROVIDER_DEFAULTS[provider].model);
  };

  const handleModelChange = (model: string | null) => {
    if (model) {
      setAIModel(model);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setStreamingContent('');

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          resumeData,
          provider: aiConfig.provider,
          model: aiConfig.model,
          temperature: aiConfig.temperature,
          maxTokens: aiConfig.maxTokens,
          stream: aiConfig.streaming,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (aiConfig.streaming && response.headers.get('content-type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data: '));

            for (const line of lines) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;

              try {
                const data = JSON.parse(dataStr);
                if (data.error) {
                  throw new Error(data.error);
                }
                if (data.content) {
                  accumulatedContent += data.content;
                  setStreamingContent(accumulatedContent);
                }
                if (data.done) {
                  break;
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Add complete message
        if (accumulatedContent) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: accumulatedContent },
          ]);
        }
      } else {
        // Handle non-streaming response
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${errorMessage}. Please check your AI provider configuration and try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const availableModels = getAvailableModels(aiConfig.provider);

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l shadow-xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="p-4 border-b bg-slate-50 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">AI Provider</label>
            <Select value={aiConfig.provider} onValueChange={(v) => handleProviderChange(v as AIProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">Ollama</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Model</label>
            <Select value={aiConfig.model} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600">Streaming</label>
            <Button
              variant={aiConfig.streaming ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAIStreaming(!aiConfig.streaming)}>
              {aiConfig.streaming ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && streamingContent && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3 max-w-[85%]">
                <p className="whitespace-pre-wrap text-sm">{streamingContent}</p>
              </div>
            </div>
          )}
          {isLoading && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for help..."
            disabled={isLoading}
          />
          {isLoading ? (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Using {aiConfig.provider} • {aiConfig.model}
          </span>
        </div>
      </form>
    </div>
  );
}
