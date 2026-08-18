'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { galleryImageSchema } from '@/lib/validation/gallery-image';
import type { ActionResult } from '@/lib/actions/types';

export async function createGalleryImage(formData: FormData): Promise<ActionResult> {
  const parsed = galleryImageSchema.safeParse({
    image_url: formData.get('image_url'),
    caption_vi: formData.get('caption_vi') ?? '',
    caption_en: formData.get('caption_en') ?? '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });

  const { error } = await supabase.from('gallery_images').insert({
    ...parsed.data,
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gallery');
  revalidatePath('/');
  return { success: true };
}

export async function updateGalleryImageCaption(
  id: string,
  captionVi: string,
  captionEn: string
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('gallery_images')
    .update({ caption_vi: captionVi, caption_en: captionEn })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gallery');
  return { success: true };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/gallery');
  revalidatePath('/');
  return { success: true };
}

export async function reorderGalleryImages(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('gallery_images').update({ display_order: index + 1 }).eq('id', id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidatePath('/gallery');
  return { success: true };
}
