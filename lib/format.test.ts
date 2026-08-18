import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats a price with thousands separators and a đ suffix', () => {
    expect(formatPrice(165000)).toBe('165.000đ');
  });

  it('formats a large price correctly', () => {
    expect(formatPrice(1200000)).toBe('1.200.000đ');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0đ');
  });
});
