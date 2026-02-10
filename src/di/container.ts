import { MeetingService } from '@/src/application/services/MeetingService';
import { AuthService } from '@/src/application/services/AuthService';
import { RealtimeMeetingService } from '@/src/application/services/RealtimeMeetingService';
import { IndexedDBMeetingRepository } from '@/src/infrastructure/repositories/IndexedDBMeetingRepository';
import { WebSpeechRecognitionAdapter } from '@/src/infrastructure/adapters/WebSpeechRecognitionAdapter';
import { MyMemoryTranslationAdapter } from '@/src/infrastructure/adapters/MyMemoryTranslationAdapter';
import { LocalSummarizationAdapter } from '@/src/infrastructure/adapters/LocalSummarizationAdapter';
import { FirebaseAuthAdapter } from '@/src/infrastructure/adapters/FirebaseAuthAdapter';
import { FirestoreMeetingAdapter } from '@/src/infrastructure/adapters/FirestoreMeetingAdapter';
import { getFirebaseAuth, getFirebaseFirestore } from '@/src/infrastructure/config/firebase';
import type { SpeechRecognitionPort } from '@/src/domain/ports/SpeechRecognitionPort';
import type { TranslationPort } from '@/src/domain/ports/TranslationPort';
import type { SummarizationPort } from '@/src/domain/ports/SummarizationPort';

export interface AppDependencies {
  meetingService: MeetingService;
  authService: AuthService;
  realtimeMeetingService: RealtimeMeetingService;
  speechRecognition: SpeechRecognitionPort;
  translationPort: TranslationPort;
  summarizationPort: SummarizationPort;
}

export function createDependencies(): AppDependencies {
  const meetingRepo = new IndexedDBMeetingRepository();
  const meetingService = new MeetingService(meetingRepo);
  const speechRecognition = new WebSpeechRecognitionAdapter();
  const translationPort = new MyMemoryTranslationAdapter();
  const summarizationPort = new LocalSummarizationAdapter();

  const firebaseAuth = getFirebaseAuth();
  const authAdapter = new FirebaseAuthAdapter(firebaseAuth);
  const authService = new AuthService(authAdapter);

  const firestore = getFirebaseFirestore();
  const realtimeAdapter = new FirestoreMeetingAdapter(firestore);
  const realtimeMeetingService = new RealtimeMeetingService(meetingRepo, realtimeAdapter);

  return {
    meetingService,
    authService,
    realtimeMeetingService,
    speechRecognition,
    translationPort,
    summarizationPort,
  };
}
