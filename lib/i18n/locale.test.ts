import { describe, it, expect } from 'vitest';
import { normalizeLocale } from './locale';

describe('normalizeLocale', () => {
  it('returns "en" when the value is exactly "en"', () => {
    expect(normalizeLocale('en')).toBe('en');
  });

  it('returns "vi" when the value is "vi"', () => {
    expect(normalizeLocale('vi')).toBe('vi');
  });

  it('defaults to "vi" for undefined', () => {
    expect(normalizeLocale(undefined)).toBe('vi');
  });

  it('defaults to "vi" for null', () => {
    expect(normalizeLocale(null)).toBe('vi');
  });

  it('defaults to "vi" for any unexpected value', () => {
    expect(normalizeLocale('fr')).toBe('vi');
    expect(normalizeLocale('')).toBe('vi');
  });
});
