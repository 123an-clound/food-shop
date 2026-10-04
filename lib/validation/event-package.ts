import { z } from 'zod';
import { isSupportedImageUrl } from '@/lib/security/external-url';

export const eventPackageSchema = z.object({
  name_vi: z.string().trim().min(2, 'Tên gói tiệc là bắt buộc').max(120),
  name_en: z.string().trim().max(120).default(''),
  description_vi: z.string().trim().max(2000).default(''),
  description_en: z.string().trim().max(2000).default(''),
  image_url: z.string().trim().refine((value) => !value || isSupportedImageUrl(value), 'Dùng ảnh có sẵn hoặc ảnh đã tải lên Supabase'),
  starting_price: z.union([z.literal(''), z.coerce.number().int().min(0).max(999999999999)]).transform((value) => value === '' ? null : value),
  inclusions_vi: z.array(z.string().trim().min(1).max(180)).max(15),
  inclusions_en: z.array(z.string().trim().min(1).max(180)).max(15),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  display_order: z.coerce.number().int().min(0).max(9999),
});
