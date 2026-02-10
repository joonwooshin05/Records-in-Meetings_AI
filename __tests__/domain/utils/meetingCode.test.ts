import { describe, it, expect } from 'vitest';
import { generateMeetingCode } from '@/src/domain/utils/meetingCode';

describe('generateMeetingCode', () => {
  it('should generate a code in ABC-123 format', () => {
    const code = generateMeetingCode();
    expect(code).toMatch(/^[A-Z2-9]{3}-[A-Z2-9]{3}$/);
  });

  it('should not contain confusing characters (0, 1, I, O)', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateMeetingCode();
      expect(code).not.toMatch(/[01IO]/);
    }
  });

  it('should generate unique codes', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateMeetingCode()));
    expect(codes.size).toBeGreaterThan(40);
  });
});
