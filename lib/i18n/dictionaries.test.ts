import { describe, it, expect } from 'vitest';
import { getDictionary } from './dictionaries';

describe('getDictionary', () => {
  it('returns Vietnamese nav labels for locale "vi"', () => {
    expect(getDictionary('vi').nav.home).toBe('Trang chủ');
    expect(getDictionary('vi').nav.menu).toBe('Thực đơn');
  });

  it('returns English nav labels for locale "en"', () => {
    expect(getDictionary('en').nav.home).toBe('Home');
    expect(getDictionary('en').nav.menu).toBe('Menu');
  });

  it('has the same set of "common" keys in both locales', () => {
    const viKeys = Object.keys(getDictionary('vi').common).sort();
    const enKeys = Object.keys(getDictionary('en').common).sort();
    expect(enKeys).toEqual(viKeys);
  });
});
