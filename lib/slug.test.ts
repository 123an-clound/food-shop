import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and strips Vietnamese diacritics', () => {
    expect(slugify('Khai vị')).toBe('khai-vi');
  });

  it('handles the standalone đ/Đ letter, which NFD normalization does not decompose', () => {
    expect(slugify('Đồ uống')).toBe('do-uong');
  });

  it('collapses punctuation and multiple spaces into single hyphens', () => {
    expect(slugify('Cơm & Mì, Bún')).toBe('com-mi-bun');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  Tráng miệng!  ')).toBe('trang-mieng');
  });
});
