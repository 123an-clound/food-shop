import { describe, it, expect } from 'vitest';
import { galleryImageSchema } from './gallery-image';

describe('galleryImageSchema', () => {
  it('accepts a valid gallery image', () => {
    const result = galleryImageSchema.safeParse({
      image_url: 'https://x.supabase.co/storage/v1/object/public/site-media/a.jpg',
      caption_vi: 'Không gian chính',
      caption_en: 'Main space',
    });
    expect(result.success).toBe(true);
  });

  it('requires an image_url', () => {
    expect(galleryImageSchema.safeParse({ image_url: '', caption_vi: '', caption_en: '' }).success).toBe(
      false
    );
  });

  it('rejects an image_url that is not a real URL', () => {
    expect(
      galleryImageSchema.safeParse({ image_url: 'not-a-url', caption_vi: '', caption_en: '' }).success
    ).toBe(false);
  });

  it('defaults captions to empty strings when omitted', () => {
    const result = galleryImageSchema.safeParse({ image_url: 'https://x.supabase.co/a.jpg' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.caption_vi).toBe('');
      expect(result.data.caption_en).toBe('');
    }
  });
});
