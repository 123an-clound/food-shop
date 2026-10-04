import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, GalleryImage, MenuItem, RestaurantInfo } from '@/lib/types';
import type { EventPackage, Testimonial } from '@/lib/events/content';

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getMenuItems(supabase: SupabaseClient): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MenuItem[];
}

export async function getFeaturedMenuItems(
  supabase: SupabaseClient,
  limit = 6
): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as MenuItem[];
}

export async function getRestaurantInfo(supabase: SupabaseClient): Promise<RestaurantInfo> {
  const { data, error } = await supabase
    .from('restaurant_info')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data as RestaurantInfo;
}

export async function getGalleryImages(
  supabase: SupabaseClient,
  limit?: number
): Promise<GalleryImage[]> {
  const base = supabase
    .from('gallery_images')
    .select('*')
    .order('display_order', { ascending: true });
  const query = limit !== undefined ? base.limit(limit) : base;
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GalleryImage[];
}

export async function getEventPackages(supabase: SupabaseClient, admin = false): Promise<EventPackage[]> {
  let query = supabase.from('event_packages').select('*').order('display_order', { ascending: true });
  if (!admin) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as EventPackage[];
}

export async function getTestimonials(supabase: SupabaseClient, admin = false): Promise<Testimonial[]> {
  let query = supabase.from('testimonials').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false });
  if (!admin) query = query.eq('is_published', true).limit(8);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}
