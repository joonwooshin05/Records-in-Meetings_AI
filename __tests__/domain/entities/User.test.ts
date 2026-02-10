import { describe, it, expect } from 'vitest';
import { User } from '@/src/domain/entities/User';

function createTestUser(overrides?: Partial<ConstructorParameters<typeof User>[0]>) {
  return new User({
    id: 'uid-1',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    provider: 'email',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  });
}

describe('User', () => {
  it('should create a user with valid props', () => {
    const u = createTestUser();
    expect(u.id).toBe('uid-1');
    expect(u.email).toBe('test@example.com');
    expect(u.displayName).toBe('Test User');
    expect(u.provider).toBe('email');
  });

  it('should throw if id is empty', () => {
    expect(() => createTestUser({ id: '' })).toThrow('User id cannot be empty');
  });

  it('should throw if email is empty', () => {
    expect(() => createTestUser({ email: '' })).toThrow('User email cannot be empty');
  });

  it('should compute initials from display name', () => {
    const u = createTestUser({ displayName: 'John Doe' });
    expect(u.initials).toBe('JD');
  });

  it('should compute initials from email when no display name', () => {
    const u = createTestUser({ displayName: null });
    expect(u.initials).toBe('T');
  });

  it('should serialize to props and back', () => {
    const u = createTestUser();
    const props = u.toProps();
    const u2 = new User(props);
    expect(u2.id).toBe(u.id);
    expect(u2.email).toBe(u.email);
  });
});
