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
import type { AIAssistantPort } from '@/src/domain/ports/AIAssistantPort';
import { OpenAIAssistantAdapter } from '@/src/infrastructure/adapters/OpenAIAssistantAdapter';
import type { AuthPort } from '@/src/domain/ports/AuthPort';
import type { RealtimeMeetingPort } from '@/src/domain/ports/RealtimeMeetingPort';
import { User } from '@/src/domain/entities/User';

// Guest user for when Firebase is not configured
const guestUser = new User({
  id: 'guest',
  email: 'guest@local',
  displayName: 'Guest',
  photoURL: null,
  provider: 'email',
  createdAt: new Date(),
});

// Stub adapters for when Firebase is not configured
const stubAuthAdapter: AuthPort = {
  signUpWithEmail: async () => guestUser,
  signInWithEmail: async () => guestUser,
  signInWithGoogle: async () => guestUser,
  signOut: async () => {},
  getCurrentUser: () => guestUser,
  onAuthStateChanged: (cb) => { cb(guestUser); return () => {}; },
};

const stubRealtimeAdapter: RealtimeMeetingPort = {
  createRoom: async () => {},
  joinRoom: async () => null,
  leaveRoom: async () => {},
  findRoomByCode: async () => null,
  pushTranscript: async () => {},
  onTranscriptsChanged: () => () => {},
  onParticipantsChanged: () => () => {},
  updateMeetingStatus: async () => {},
  onMeetingStatusChanged: () => () => {},
};

export interface AppDependencies {
  meetingService: MeetingService;
  authService: AuthService;
  realtimeMeetingService: RealtimeMeetingService;
  speechRecognition: SpeechRecognitionPort;
  translationPort: TranslationPort;
  summarizationPort: SummarizationPort;
  aiAssistant: AIAssistantPort;
}

export function createDependencies(): AppDependencies {
  const meetingRepo = new IndexedDBMeetingRepository();
  const meetingService = new MeetingService(meetingRepo);
  const speechRecognition = new WebSpeechRecognitionAdapter();
  const translationPort = new MyMemoryTranslationAdapter();
  const summarizationPort = new LocalSummarizationAdapter();
  const aiAssistant = new OpenAIAssistantAdapter();

  const firebaseAuth = getFirebaseAuth();
  const authAdapter = firebaseAuth ? new FirebaseAuthAdapter(firebaseAuth) : stubAuthAdapter;
  const authService = new AuthService(authAdapter);

  const firestore = getFirebaseFirestore();
  const realtimeAdapter = firestore ? new FirestoreMeetingAdapter(firestore) : stubRealtimeAdapter;
  const realtimeMeetingService = new RealtimeMeetingService(meetingRepo, realtimeAdapter);

  return {
    meetingService,
    authService,
    realtimeMeetingService,
    speechRecognition,
    translationPort,
    summarizationPort,
    aiAssistant,
  };
}
