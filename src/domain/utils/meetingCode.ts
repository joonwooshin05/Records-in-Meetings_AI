const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateMeetingCode(): string {
  const part = (len: number) =>
    Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  return `${part(3)}-${part(3)}`;
}
