import type { Language } from '../entities/Language';
import type { Transcript } from '../entities/Transcript';

export interface SpeechRecognitionPort {
  start(language: Language): void;
  stop(): void;
  onResult(callback: (transcript: Transcript) => void): void;
  onError(callback: (error: Error) => void): void;
  onEnd(callback: () => void): void;
  isSupported(): boolean;
}
