import { describe, it, expect } from 'vitest';
import { categorySchema } from './category';

describe('categorySchema', () => {
  it('accepts a valid category', () => {
    const result = categorySchema.safeParse({
      name_vi: 'Khai vị',
      name_en: 'Appetizers',
      description_vi: '',
      description_en: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing Vietnamese name', () => {
    const result = categorySchema.safeParse({
      name_vi: '',
      name_en: 'Appetizers',
      description_vi: '',
      description_en: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing English name', () => {
    const result = categorySchema.safeParse({
      name_vi: 'Khai vị',
      name_en: '',
      description_vi: '',
      description_en: '',
    });
    expect(result.success).toBe(false);
  });

  it('defaults description fields to empty strings when omitted', () => {
    const result = categorySchema.safeParse({ name_vi: 'Khai vị', name_en: 'Appetizers' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description_vi).toBe('');
      expect(result.data.description_en).toBe('');
    }
  });
});
