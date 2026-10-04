'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/require-admin';
import { eventPackageSchema } from '@/lib/validation/event-package';
import type { ActionResult } from '@/lib/actions/types';

function parsePackage(formData: FormData) {
  const lines = (name: string) => String(formData.get(name) ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return eventPackageSchema.safeParse({
    name_vi: formData.get('name_vi'),
    name_en: formData.get('name_en') ?? '',
    description_vi: formData.get('description_vi') ?? '',
    description_en: formData.get('description_en') ?? '',
    image_url: formData.get('image_url') ?? '',
    starting_price: formData.get('starting_price') ?? '',
    inclusions_vi: lines('inclusions_vi'),
    inclusions_en: lines('inclusions_en'),
    is_featured: formData.get('is_featured') === 'on',
    is_active: formData.get('is_active') === 'on',
    display_order: formData.get('display_order') ?? '0',
  });
}

function refreshPackages() {
  updateTag('event-packages');
  revalidatePath('/');
  revalidatePath('/packages');
  revalidatePath('/admin/packages');
  revalidatePath('/admin');
}

export async function saveEventPackage(id: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;
  const parsed = parsePackage(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const result = id
    ? await supabase.from('event_packages').update(parsed.data).eq('id', id)
    : await supabase.from('event_packages').insert(parsed.data);
  if (result.error) return { success: false, error: result.error.message };
  refreshPackages();
  return { success: true };
}

export async function deleteEventPackage(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;
  const { error } = await supabase.from('event_packages').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  refreshPackages();
  return { success: true };
}
