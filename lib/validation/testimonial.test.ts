import { describe, expect, it } from 'vitest';
import { testimonialSchema } from './testimonial';

const valid = {
  customer_name: 'Nguyễn An', event_label: 'Tiệc cưới', quote_vi: 'Buổi tiệc được tổ chức chu đáo và gia đình rất hài lòng.',
  quote_en: '', rating: '5', is_published: false, display_order: '1',
};

describe('testimonialSchema', () => {
  it('accepts an unpublished review and normalizes form values', () => {
    expect(testimonialSchema.parse(valid)).toMatchObject({ rating: 5, display_order: 1, is_published: false });
  });

  it('rejects an empty attribution and a very short quote', () => {
    expect(testimonialSchema.safeParse({ ...valid, customer_name: ' ', quote_vi: 'Tốt' }).success).toBe(false);
  });
});
