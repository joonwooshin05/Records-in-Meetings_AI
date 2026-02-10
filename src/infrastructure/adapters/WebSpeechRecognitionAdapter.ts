import type { Language } from '@/src/domain/entities/Language';
import { Transcript } from '@/src/domain/entities/Transcript';
import type { SpeechRecognitionPort } from '@/src/domain/ports/SpeechRecognitionPort';
import { v4 as uuidv4 } from 'uuid';

const LANGUAGE_TO_BCP47: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

export class WebSpeechRecognitionAdapter implements SpeechRecognitionPort {
  private recognition: any = null;
  private resultCallback: ((transcript: Transcript) => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private endCallback: (() => void) | null = null;
  private startTime = 0;
  private elapsedOffset = 0;

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  start(language: Language): void {
    // Accumulate elapsed time from previous segment (handles auto-restart)
    if (this.startTime > 0) {
      this.elapsedOffset += Date.now() - this.startTime;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = LANGUAGE_TO_BCP47[language];
    this.startTime = Date.now();

    this.recognition.addEventListener('result', (event: any) => {
      if (!this.resultCallback) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = new Transcript({
          id: uuidv4(),
          text: result[0].transcript.trim(),
          timestamp: this.elapsedOffset + (Date.now() - this.startTime),
          language,
          isFinal: result.isFinal,
        });
        this.resultCallback(transcript);
      }
    });

    this.recognition.addEventListener('error', (event: any) => {
      this.errorCallback?.(new Error(event.error));
    });

    this.recognition.addEventListener('end', () => {
      this.endCallback?.();
    });

    this.recognition.start();
  }

  stop(): void {
    // Accumulate elapsed time so next start() continues from here
    if (this.startTime > 0) {
      this.elapsedOffset += Date.now() - this.startTime;
      this.startTime = 0;
    }
    this.recognition?.stop();
  }

  resetTimer(): void {
    this.elapsedOffset = 0;
    this.startTime = 0;
  }

  setElapsedOffset(offset: number): void {
    this.elapsedOffset = offset;
    this.startTime = 0;
  }

  onResult(callback: (transcript: Transcript) => void): void {
    this.resultCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.endCallback = callback;
  }
}
