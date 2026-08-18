import { describe, it, expect } from 'vitest';
import { restaurantInfoSchema } from './restaurant-info';

const validInput = {
  name_vi: 'Hương Việt',
  name_en: 'Huong Viet Fine Dining',
  tagline_vi: '',
  tagline_en: '',
  description_vi: '',
  description_en: '',
  address: '',
  phone: '',
  email: '',
  opening_hours: '',
  map_embed_url: '',
  facebook_url: '',
  instagram_url: '',
  logo_url: '',
  hero_image_url: '',
};

describe('restaurantInfoSchema', () => {
  it('accepts a valid restaurant info with every optional field blank', () => {
    expect(restaurantInfoSchema.safeParse(validInput).success).toBe(true);
  });

  it('requires a Vietnamese name', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, name_vi: '' }).success).toBe(false);
  });

  it('requires an English name', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, name_en: '' }).success).toBe(false);
  });

  it('rejects a map_embed_url that is not a real URL', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, map_embed_url: 'not-a-url' }).success).toBe(false);
  });

  it('accepts a valid https map_embed_url', () => {
    const result = restaurantInfoSchema.safeParse({
      ...validInput,
      map_embed_url: 'https://www.google.com/maps/embed?pb=123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email but accepts a blank one', () => {
    expect(restaurantInfoSchema.safeParse({ ...validInput, email: 'not-an-email' }).success).toBe(false);
    expect(restaurantInfoSchema.safeParse({ ...validInput, email: '' }).success).toBe(true);
  });
});
