import { z } from 'zod';

const eventDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ').refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Ngày không hợp lệ');

export const eventInquirySchema = z.object({
  name: z.string().trim().min(2, 'Vui lòng nhập họ tên').max(120),
  phone: z.string().trim().regex(/^[0-9+().\s-]{9,18}$/, 'Số điện thoại không hợp lệ')
    .refine((value) => value.replace(/\D/g, '').length >= 9, 'Số điện thoại không hợp lệ'),
  email: z.string().trim().email('Email không hợp lệ').max(254),
  event_type: z.enum(['wedding', 'corporate', 'private', 'other']),
  event_date: eventDate,
  guests: z.coerce.number().int().min(1, 'Cần ít nhất một khách').max(5000, 'Số khách vượt giới hạn'),
  budget: z.string().trim().max(120).default(''),
  message: z.string().trim().max(2000).default(''),
});

export const eventInquiryStatuses = ['new', 'contacted', 'quoted', 'confirmed', 'closed'] as const;
export const inquiryUpdateSchema = z.object({
  status: z.enum(eventInquiryStatuses),
  staff_note: z.string().trim().max(2000),
});
