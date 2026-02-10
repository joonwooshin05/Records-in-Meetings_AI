import type { Meeting } from '../entities/Meeting';
import type { SpeechRecognitionPort } from '../ports/SpeechRecognitionPort';

export class StopTranscription {
  constructor(private readonly speechRecognition: SpeechRecognitionPort) {}

  async execute(meeting: Meeting): Promise<Meeting> {
    this.speechRecognition.stop();
    return meeting.complete();
  }
}
