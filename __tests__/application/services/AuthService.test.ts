import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '@/src/application/services/AuthService';
import type { AuthPort } from '@/src/domain/ports/AuthPort';
import { User } from '@/src/domain/entities/User';

function createMockAuthPort(): AuthPort {
  const testUser = new User({
    id: 'uid-1',
    email: 'test@example.com',
    displayName: 'Test',
    photoURL: null,
    provider: 'email',
    createdAt: new Date(),
  });

  return {
    signUpWithEmail: vi.fn().mockResolvedValue(testUser),
    signInWithEmail: vi.fn().mockResolvedValue(testUser),
    signInWithGoogle: vi.fn().mockResolvedValue(testUser),
    signOut: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn().mockReturnValue(null),
    onAuthStateChanged: vi.fn().mockReturnValue(() => {}),
  };
}

describe('AuthService', () => {
  it('should sign up with valid email and password', async () => {
    const port = createMockAuthPort();
    const service = new AuthService(port);
    const user = await service.signUp('test@example.com', 'password123');
    expect(user.email).toBe('test@example.com');
    expect(port.signUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should throw if email is empty on sign up', async () => {
    const port = createMockAuthPort();
    const service = new AuthService(port);
    await expect(service.signUp('', 'password123')).rejects.toThrow('Email is required');
  });

  it('should throw if password is too short on sign up', async () => {
    const port = createMockAuthPort();
    const service = new AuthService(port);
    await expect(service.signUp('test@example.com', '12345')).rejects.toThrow('Password must be at least 6 characters');
  });

  it('should sign in with valid credentials', async () => {
    const port = createMockAuthPort();
    const service = new AuthService(port);
    await service.signIn('test@example.com', 'password');
    expect(port.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should throw if password is empty on sign in', async () => {
    const port = createMockAuthPort();
    const service = new AuthService(port);
    await expect(service.signIn('test@example.com', '')).rejects.toThrow('Password is required');
  });

  it('should sign in with Google', async () => {
    const port = createMockAuthPort();
    const service = new AuthService(port);
    await service.signInWithGoogle();
    expect(port.signInWithGoogle).toHaveBeenCalled();
  });

  it('should sign out', async () => {
    const port = createMockAuthPort();
    const service = new AuthService(port);
    await service.signOut();
    expect(port.signOut).toHaveBeenCalled();
  });
});
