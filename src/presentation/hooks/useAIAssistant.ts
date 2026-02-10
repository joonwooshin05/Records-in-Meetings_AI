'use client';

import { useState, useCallback, useRef } from 'react';
import { useDependencies } from '@/src/presentation/providers/DependencyProvider';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useAIAssistant() {
  const { aiAssistant } = useDependencies();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback((language: string = 'ko-KR') => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.addEventListener('result', (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (finalText) {
        setInterimText(finalText);
      } else {
        setInterimText(interim);
      }
    });

    recognition.addEventListener('end', () => {
      setIsListening(false);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.addEventListener('error', (event: any) => {
      if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    });

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setInterimText('');
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const sendQuestion = useCallback(
    async (question: string, context?: string) => {
      if (!question.trim()) return;

      setError(null);
      setMessages((prev) => [...prev, { role: 'user', content: question }]);
      setIsLoading(true);

      try {
        const answer = await aiAssistant.askQuestion(question, context);
        setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get AI response';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [aiAssistant]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
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
  };
}
