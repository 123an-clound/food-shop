import { describe, it, expect } from 'vitest';
import { localize } from './localize';

describe('localize', () => {
  it('returns the Vietnamese value when locale is vi', () => {
    expect(localize('Xin chào', 'Hello', 'vi')).toBe('Xin chào');
  });

  it('returns the English value when locale is en', () => {
    expect(localize('Xin chào', 'Hello', 'en')).toBe('Hello');
  });

  it('falls back to Vietnamese when locale is en but the English value is empty', () => {
    expect(localize('Xin chào', '', 'en')).toBe('Xin chào');
  });

  it('falls back to Vietnamese when the English value is only whitespace', () => {
    expect(localize('Xin chào', '   ', 'en')).toBe('Xin chào');
  });
});
