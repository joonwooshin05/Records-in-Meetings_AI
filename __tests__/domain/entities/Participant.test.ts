import { describe, it, expect } from 'vitest';
import { Participant } from '@/src/domain/entities/Participant';

describe('Participant', () => {
  it('should create a participant with valid props', () => {
    const p = new Participant({
      userId: 'u-1',
      displayName: 'Alice',
      role: 'host',
      joinedAt: new Date(),
      targetLanguage: 'ko',
    });
    expect(p.userId).toBe('u-1');
    expect(p.displayName).toBe('Alice');
    expect(p.role).toBe('host');
    expect(p.targetLanguage).toBe('ko');
  });

  it('should throw if userId is empty', () => {
    expect(() => new Participant({
      userId: '',
      displayName: 'Alice',
      role: 'host',
      joinedAt: new Date(),
      targetLanguage: 'ko',
    })).toThrow('Participant userId cannot be empty');
  });

  it('should return true for isHost when role is host', () => {
    const p = new Participant({
      userId: 'u-1',
      displayName: 'Alice',
      role: 'host',
      joinedAt: new Date(),
      targetLanguage: 'ko',
    });
    expect(p.isHost).toBe(true);
  });

  it('should return false for isHost when role is participant', () => {
    const p = new Participant({
      userId: 'u-2',
      displayName: 'Bob',
      role: 'participant',
      joinedAt: new Date(),
      targetLanguage: 'en',
    });
    expect(p.isHost).toBe(false);
  });
});
