import { z } from 'zod';

export const galleryImageSchema = z.object({
  image_url: z.string().min(1, 'Ảnh là bắt buộc').url('URL ảnh không hợp lệ'),
  caption_vi: z.string().default(''),
  caption_en: z.string().default(''),
});

export type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;
