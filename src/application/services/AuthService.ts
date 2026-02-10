import type { AuthPort } from '@/src/domain/ports/AuthPort';
import type { User } from '@/src/domain/entities/User';

export class AuthService {
  constructor(private readonly authPort: AuthPort) {}

  async signUp(email: string, password: string): Promise<User> {
    if (!email.trim()) throw new Error('Email is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    return this.authPort.signUpWithEmail(email.trim(), password);
  }

  async signIn(email: string, password: string): Promise<User> {
    if (!email.trim()) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    return this.authPort.signInWithEmail(email.trim(), password);
  }

  async signInWithGoogle(): Promise<User> {
    return this.authPort.signInWithGoogle();
  }

  async signOut(): Promise<void> {
    return this.authPort.signOut();
  }

  getCurrentUser(): User | null {
    return this.authPort.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.authPort.onAuthStateChanged(callback);
  }
}
