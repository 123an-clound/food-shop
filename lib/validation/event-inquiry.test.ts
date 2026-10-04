import { describe, expect, it } from 'vitest';
import { eventInquirySchema, inquiryUpdateSchema } from './event-inquiry';

const valid = {
  name: 'Nguyễn Văn An', phone: '090 123 4567', email: 'an@example.com',
  event_type: 'wedding', event_date: '2027-05-20', guests: '150', budget: '', message: '',
};

describe('event inquiry validation', () => {
  it('accepts a Vietnamese wedding enquiry', () => {
    expect(eventInquirySchema.parse(valid)).toMatchObject({ guests: 150, event_type: 'wedding' });
  });

  it('rejects impossible dates and invalid contact details', () => {
    expect(eventInquirySchema.safeParse({ ...valid, event_date: '2027-02-30' }).success).toBe(false);
    expect(eventInquirySchema.safeParse({ ...valid, phone: 'abc123' }).success).toBe(false);
    expect(eventInquirySchema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false);
  });

  it('rejects an excessive guest count and invalid admin status', () => {
    expect(eventInquirySchema.safeParse({ ...valid, guests: '5001' }).success).toBe(false);
    expect(inquiryUpdateSchema.safeParse({ status: 'deleted', staff_note: '' }).success).toBe(false);
  });
});
