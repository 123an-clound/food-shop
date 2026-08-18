import { z } from 'zod';

export const categorySchema = z.object({
  name_vi: z.string().min(1, 'Tên tiếng Việt là bắt buộc'),
  name_en: z.string().min(1, 'Tên tiếng Anh là bắt buộc'),
  description_vi: z.string().default(''),
  description_en: z.string().default(''),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
