import { z } from 'zod';

export const menuItemSchema = z.object({
  category_id: z.string().min(1, 'Danh mục là bắt buộc'),
  name_vi: z.string().min(1, 'Tên tiếng Việt là bắt buộc'),
  name_en: z.string().min(1, 'Tên tiếng Anh là bắt buộc'),
  description_vi: z.string().default(''),
  description_en: z.string().default(''),
  price: z.coerce.number().positive('Giá phải lớn hơn 0'),
  image_url: z.string().default(''),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
