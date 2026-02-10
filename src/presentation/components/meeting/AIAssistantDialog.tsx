'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Mic, MicOff, Send, Loader2, Trash2, Sparkles } from 'lucide-react';
import { useAIAssistant } from '@/src/presentation/hooks/useAIAssistant';
import type { Transcript } from '@/src/domain/entities/Transcript';

interface AIAssistantDialogProps {
  transcripts: Transcript[];
  sourceLanguage?: string;
}

const LANG_TO_BCP47: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

export function AIAssistantDialog({ transcripts, sourceLanguage = 'ko' }: AIAssistantDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isListening,
    interimText,
    setInterimText,
    error,
    startListening,
    stopListening,
    sendQuestion,
    clearMessages,
  } = useAIAssistant();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const buildContext = useCallback(() => {
    const finalTranscripts = transcripts.filter((t) => t.isFinal);
    if (finalTranscripts.length === 0) return undefined;
    return finalTranscripts
      .map((t) => `[${t.speaker ?? 'Unknown'}]: ${t.text}`)
      .join('\n');
  }, [transcripts]);

  const handleSend = useCallback(() => {
    const text = inputText.trim() || interimText.trim();
    if (!text) return;
    sendQuestion(text, buildContext());
    setInputText('');
    setInterimText('');
  }, [inputText, interimText, sendQuestion, buildContext, setInterimText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(LANG_TO_BCP47[sourceLanguage] ?? 'ko-KR');
    }
  };

  // When voice recognition finishes and produces text, put it in input
  useEffect(() => {
    if (!isListening && interimText) {
      setInputText(interimText);
      setInterimText('');
    }
  }, [isListening, interimText, setInterimText]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Ask AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </DialogTitle>
        </DialogHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-12 gap-3">
                <Bot className="h-12 w-12 opacity-30" />
                <p className="text-sm text-center">
                  Ask a question about the meeting<br />
                  using voice or text.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Error */}
        {error && (
          <div className="mx-6 bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs">
            {error}
          </div>
        )}

        {/* Listening indicator */}
        {isListening && (
          <div className="mx-6 flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse gap-1">
              <Mic className="h-3 w-3" />
              Listening...
            </Badge>
            {interimText && (
              <span className="text-sm text-muted-foreground truncate">{interimText}</span>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-2 border-t">
          <Button
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            onClick={handleMicToggle}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or use voice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || (!inputText.trim() && !interimText.trim())}
          >
            <Send className="h-4 w-4" />
          </Button>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
