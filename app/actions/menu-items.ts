'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/require-admin';
import { menuItemSchema } from '@/lib/validation/menu-item';
import type { ActionResult } from '@/lib/actions/types';

function parseFormData(formData: FormData) {
  return menuItemSchema.safeParse({
    category_id: formData.get('category_id'),
    name_vi: formData.get('name_vi'),
    name_en: formData.get('name_en'),
    description_vi: formData.get('description_vi') ?? '',
    description_en: formData.get('description_en') ?? '',
    price: formData.get('price'),
    image_url: formData.get('image_url') ?? '',
    is_available: formData.get('is_available') === 'true',
    is_featured: formData.get('is_featured') === 'true',
  });
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { count } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', parsed.data.category_id);

  const { error } = await supabase.from('menu_items').insert({
    ...parsed.data,
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('menu_items').update(parsed.data).eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const { error } = await supabase.from('menu_items').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function reorderMenuItems(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('menu_items').update({ display_order: index + 1 }).eq('id', id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}
