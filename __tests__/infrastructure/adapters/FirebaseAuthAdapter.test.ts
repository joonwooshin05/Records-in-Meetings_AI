import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseAuthAdapter } from '@/src/infrastructure/adapters/FirebaseAuthAdapter';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const mockAuth = { currentUser: null } as any;

function createMockFirebaseUser(overrides?: Partial<any>) {
  return {
    uid: 'uid-1',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    providerData: [{ providerId: 'password' }],
    metadata: { creationTime: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  };
}

describe('FirebaseAuthAdapter', () => {
  let adapter: FirebaseAuthAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirebaseAuthAdapter(mockAuth);
  });

  it('should sign up with email and return a User', async () => {
    const mockUser = createMockFirebaseUser();
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

    const user = await adapter.signUpWithEmail('test@example.com', 'password123');
    expect(user.id).toBe('uid-1');
    expect(user.email).toBe('test@example.com');
    expect(user.provider).toBe('email');
  });

  it('should sign in with email and return a User', async () => {
    const mockUser = createMockFirebaseUser();
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

    const user = await adapter.signInWithEmail('test@example.com', 'password123');
    expect(user.id).toBe('uid-1');
    expect(user.provider).toBe('email');
  });

  it('should sign in with Google and return a User', async () => {
    const mockUser = createMockFirebaseUser({
      providerData: [{ providerId: 'google.com' }],
    });
    vi.mocked(signInWithPopup).mockResolvedValue({ user: mockUser } as any);

    const user = await adapter.signInWithGoogle();
    expect(user.provider).toBe('google');
  });

  it('should map auth/email-already-in-use error', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: 'auth/email-already-in-use',
      message: 'Email in use',
    });

    await expect(adapter.signUpWithEmail('test@example.com', 'pw')).rejects.toThrow(
      '이미 등록된 이메일입니다.'
    );
  });

  it('should call signOut on the auth instance', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    await adapter.signOut();
    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  it('should subscribe to auth state changes', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe);

    const callback = vi.fn();
    const unsub = adapter.onAuthStateChanged(callback);

    expect(onAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
    expect(unsub).toBe(unsubscribe);
  });
});
