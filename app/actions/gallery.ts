'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/require-admin';
import { galleryImageSchema } from '@/lib/validation/gallery-image';
import type { ActionResult } from '@/lib/actions/types';

export async function createGalleryImage(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const parsed = galleryImageSchema.safeParse({
    image_url: formData.get('image_url'),
    caption_vi: formData.get('caption_vi') ?? '',
    caption_en: formData.get('caption_en') ?? '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { count } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });

  const { error } = await supabase.from('gallery_images').insert({
    ...parsed.data,
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  updateTag('gallery-images');
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
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const parsed = galleryImageSchema.pick({ caption_vi: true, caption_en: true }).safeParse({
    caption_vi: captionVi,
    caption_en: captionEn,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from('gallery_images')
    .update(parsed.data)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  updateTag('gallery-images');
  revalidatePath('/gallery');
  return { success: true };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const { error } = await supabase.from('gallery_images').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  updateTag('gallery-images');
  revalidatePath('/gallery');
  revalidatePath('/');
  return { success: true };
}

export async function reorderGalleryImages(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('gallery_images').update({ display_order: index + 1 }).eq('id', id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  updateTag('gallery-images');
  revalidatePath('/gallery');
  return { success: true };
}
