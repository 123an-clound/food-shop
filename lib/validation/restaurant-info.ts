import { z } from 'zod';
import { isHttpsUrl } from '@/lib/security/external-url';

const urlOrEmpty = z.union([z.literal(''), z.string().url('URL không hợp lệ').refine(isHttpsUrl, 'URL phải dùng HTTPS')]);
const emailOrEmpty = z.union([z.literal(''), z.string().email('Email không hợp lệ')]);

export const restaurantInfoSchema = z.object({
  name_vi: z.string().min(1, 'Tên tiếng Việt là bắt buộc'),
  name_en: z.string().min(1, 'Tên tiếng Anh là bắt buộc'),
  tagline_vi: z.string().default(''),
  tagline_en: z.string().default(''),
  description_vi: z.string().default(''),
  description_en: z.string().default(''),
  address: z.string().default(''),
  phone: z.string().default(''),
  email: emailOrEmpty.default(''),
  opening_hours: z.string().default(''),
  map_embed_url: urlOrEmpty.default(''),
  facebook_url: urlOrEmpty.default(''),
  instagram_url: urlOrEmpty.default(''),
  logo_url: urlOrEmpty.default(''),
  hero_image_url: urlOrEmpty.default(''),
});

export type RestaurantInfoFormValues = z.infer<typeof restaurantInfoSchema>;
