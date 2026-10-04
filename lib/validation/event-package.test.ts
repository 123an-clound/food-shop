import { describe, expect, it } from 'vitest';
import { eventPackageSchema } from './event-package';

const valid = {
  name_vi: 'Tiệc cưới trang nhã', name_en: '', description_vi: '', description_en: '',
  image_url: '/images/wedding-hero.png', starting_price: '', inclusions_vi: ['Tư vấn thực đơn'], inclusions_en: [],
  is_featured: false, is_active: false, display_order: '1',
};

describe('event package validation', () => {
  it('keeps unpublished packages without a price', () => {
    expect(eventPackageSchema.parse(valid)).toMatchObject({ starting_price: null, is_active: false, display_order: 1 });
  });

  it('rejects URLs that the image optimizer cannot serve', () => {
    expect(eventPackageSchema.safeParse({ ...valid, image_url: 'https://example.com/photo.jpg' }).success).toBe(false);
    expect(eventPackageSchema.safeParse({ ...valid, image_url: 'javascript:alert(1)' }).success).toBe(false);
  });
});
