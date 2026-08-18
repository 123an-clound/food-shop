import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, GalleryImage, MenuItem, RestaurantInfo } from '@/lib/types';

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
  const query = limit ? base.limit(limit) : base;
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GalleryImage[];
}
