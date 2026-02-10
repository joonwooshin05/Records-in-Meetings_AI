import type { Language } from '../entities/Language';
import type { Meeting } from '../entities/Meeting';
import type { SpeechRecognitionPort } from '../ports/SpeechRecognitionPort';

interface StartTranscriptionInput {
  meeting: Meeting;
  language: Language;
}

export class StartTranscription {
  constructor(private readonly speechRecognition: SpeechRecognitionPort) {}

  async execute(input: StartTranscriptionInput): Promise<Meeting> {
    if (!this.speechRecognition.isSupported()) {
      throw new Error('Speech recognition is not supported');
    }

    this.speechRecognition.start(input.language);
    return input.meeting.start();
  }
}
