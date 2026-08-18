'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/require-admin';
import { restaurantInfoSchema } from '@/lib/validation/restaurant-info';
import type { ActionResult } from '@/lib/actions/types';

export async function updateRestaurantInfo(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);
  if (!admin.ok) return admin.result;

  const parsed = restaurantInfoSchema.safeParse({
    name_vi: formData.get('name_vi'),
    name_en: formData.get('name_en'),
    tagline_vi: formData.get('tagline_vi') ?? '',
    tagline_en: formData.get('tagline_en') ?? '',
    description_vi: formData.get('description_vi') ?? '',
    description_en: formData.get('description_en') ?? '',
    address: formData.get('address') ?? '',
    phone: formData.get('phone') ?? '',
    email: formData.get('email') ?? '',
    opening_hours: formData.get('opening_hours') ?? '',
    map_embed_url: formData.get('map_embed_url') ?? '',
    facebook_url: formData.get('facebook_url') ?? '',
    instagram_url: formData.get('instagram_url') ?? '',
    logo_url: formData.get('logo_url') ?? '',
    hero_image_url: formData.get('hero_image_url') ?? '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('restaurant_info').update(parsed.data).eq('id', 1);

  if (error) {
    return { success: false, error: error.message };
  }

  // restaurant_info is read by app/(site)/layout.tsx, which wraps every public
  // page, so 'layout' here revalidates it everywhere at once rather than just
  // at '/'. In today's build this call is actually a no-op in practice: every
  // public route already calls cookies() (via getServerLocale() and
  // createServerSupabaseClient()), which forces fully dynamic rendering with
  // no cache to invalidate — confirmed during the public-site branch's final
  // review. It's kept here anyway because that's an implementation detail of
  // the current routes, not a guarantee; the moment any public route adopts
  // static/ISR caching, this call becomes load-bearing, and it costs nothing
  // to have it already correct.
  revalidatePath('/', 'layout');
  return { success: true };
}
