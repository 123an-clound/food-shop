'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { categorySchema } from '@/lib/validation/category';
import { slugify } from '@/lib/slug';
import type { ActionResult } from '@/lib/actions/types';

function parseFormData(formData: FormData) {
  return categorySchema.safeParse({
    name_vi: formData.get('name_vi'),
    name_en: formData.get('name_en'),
    description_vi: formData.get('description_vi') ?? '',
    description_en: formData.get('description_en') ?? '',
  });
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });

  const { error } = await supabase.from('categories').insert({
    ...parsed.data,
    slug: slugify(parsed.data.name_vi),
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('categories')
    .update({ ...parsed.data, slug: slugify(parsed.data.name_vi) })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/menu');
  revalidatePath('/');
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('categories').update({ display_order: index + 1 }).eq('id', id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidatePath('/menu');
  return { success: true };
}
