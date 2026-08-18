import { describe, it, expect } from 'vitest';
import { menuItemSchema } from './menu-item';

const validInput = {
  category_id: 'cat-1',
  name_vi: 'Phở bò Wagyu',
  name_en: 'Wagyu Beef Pho',
  description_vi: '',
  description_en: '',
  price: 285000,
  image_url: '',
  is_available: true,
  is_featured: false,
};

describe('menuItemSchema', () => {
  it('accepts a valid menu item', () => {
    expect(menuItemSchema.safeParse(validInput).success).toBe(true);
  });

  it('requires a category', () => {
    expect(menuItemSchema.safeParse({ ...validInput, category_id: '' }).success).toBe(false);
  });

  it('requires a Vietnamese name', () => {
    expect(menuItemSchema.safeParse({ ...validInput, name_vi: '' }).success).toBe(false);
  });

  it('requires an English name', () => {
    expect(menuItemSchema.safeParse({ ...validInput, name_en: '' }).success).toBe(false);
  });

  it('rejects a zero or negative price', () => {
    expect(menuItemSchema.safeParse({ ...validInput, price: 0 }).success).toBe(false);
    expect(menuItemSchema.safeParse({ ...validInput, price: -10 }).success).toBe(false);
  });

  it('coerces a numeric string price', () => {
    const result = menuItemSchema.safeParse({ ...validInput, price: '285000' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(285000);
    }
  });

  it('rejects an image_url that is not empty and not a valid URL', () => {
    expect(menuItemSchema.safeParse({ ...validInput, image_url: 'not-a-url' }).success).toBe(false);
  });

  it('accepts a valid image_url', () => {
    const result = menuItemSchema.safeParse({
      ...validInput,
      image_url: 'https://x.supabase.co/storage/v1/object/public/dish-images/a.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('defaults is_available to true and is_featured to false when omitted', () => {
    const { is_available, is_featured, ...rest } = validInput;
    const result = menuItemSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_available).toBe(true);
      expect(result.data.is_featured).toBe(false);
    }
  });
});
