import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';
import type { AuthPort } from '@/src/domain/ports/AuthPort';
import { User } from '@/src/domain/entities/User';

export class FirebaseAuthAdapter implements AuthPort {
  private readonly googleProvider = new GoogleAuthProvider();

  constructor(private readonly auth: Auth) {}

  async signUpWithEmail(email: string, password: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      return this.mapFirebaseUser(credential.user, 'email');
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.mapFirebaseUser(credential.user, 'email');
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const credential = await signInWithPopup(this.auth, this.googleProvider);
      return this.mapFirebaseUser(credential.user, 'google');
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  getCurrentUser(): User | null {
    const fbUser = this.auth.currentUser;
    if (!fbUser) return null;
    const provider = fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email';
    return this.mapFirebaseUser(fbUser, provider);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, (fbUser) => {
      if (fbUser) {
        const provider = fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email';
        callback(this.mapFirebaseUser(fbUser, provider));
      } else {
        callback(null);
      }
    });
  }

  private mapFirebaseUser(
    fbUser: {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL: string | null;
      metadata: { creationTime?: string };
    },
    provider: 'email' | 'google'
  ): User {
    return new User({
      id: fbUser.uid,
      email: fbUser.email ?? '',
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      provider,
      createdAt: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime) : new Date(),
    });
  }

  private mapError(error: unknown): Error {
    const firebaseError = error as { code?: string; message?: string };
    const messages: Record<string, string> = {
      'auth/email-already-in-use': '이미 등록된 이메일입니다.',
      'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
      'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
      'auth/user-not-found': '등록되지 않은 이메일입니다.',
      'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
      'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
      'auth/popup-closed-by-user': '로그인 팝업이 닫혔습니다.',
      'auth/too-many-requests': '너무 많은 시도입니다. 잠시 후 다시 시도하세요.',
    };
    return new Error(messages[firebaseError.code ?? ''] ?? firebaseError.message ?? 'Authentication failed');
  }
}
