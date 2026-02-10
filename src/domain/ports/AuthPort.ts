import type { User } from '../entities/User';

export interface AuthPort {
  signUpWithEmail(email: string, password: string): Promise<User>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
