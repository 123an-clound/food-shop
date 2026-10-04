'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/require-admin';
import { testimonialSchema } from '@/lib/validation/testimonial';
import type { ActionResult } from '@/lib/actions/types';

function refreshTestimonials() {
  updateTag('testimonials');
  revalidatePath('/');
  revalidatePath('/admin/testimonials');
}

export async function saveTestimonial(id: string | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;
  const parsed = testimonialSchema.safeParse({
    customer_name: formData.get('customer_name'),
    event_label: formData.get('event_label') ?? '',
    quote_vi: formData.get('quote_vi'),
    quote_en: formData.get('quote_en') ?? '',
    rating: formData.get('rating'),
    is_published: formData.get('is_published') === 'on',
    display_order: formData.get('display_order') ?? '0',
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const result = id
    ? await supabase.from('testimonials').update(parsed.data).eq('id', id)
    : await supabase.from('testimonials').insert(parsed.data);
  if (result.error) return { success: false, error: result.error.message };
  refreshTestimonials();
  return { success: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  refreshTestimonials();
  return { success: true };
}
