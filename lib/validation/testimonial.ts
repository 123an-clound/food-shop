import { z } from 'zod';

export const testimonialSchema = z.object({
  customer_name: z.string().trim().min(2, 'Tên khách hàng cần ít nhất 2 ký tự').max(120),
  event_label: z.string().trim().max(120),
  quote_vi: z.string().trim().min(20, 'Đánh giá cần ít nhất 20 ký tự').max(1200),
  quote_en: z.string().trim().max(1200),
  rating: z.coerce.number().int().min(1).max(5),
  is_published: z.boolean(),
  display_order: z.coerce.number().int().min(0).max(9999),
});
