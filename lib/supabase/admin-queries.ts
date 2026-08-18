import type { SupabaseClient } from '@supabase/supabase-js';

export type DashboardCounts = {
  menuItemCount: number;
  unavailableMenuItemCount: number;
  categoryCount: number;
  galleryImageCount: number;
};

export async function getDashboardCounts(supabase: SupabaseClient): Promise<DashboardCounts> {
  const [menuItems, unavailable, categories, gallery] = await Promise.all([
    supabase.from('menu_items').select('*', { count: 'exact', head: true }),
    supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('is_available', false),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
  ]);

  for (const result of [menuItems, unavailable, categories, gallery]) {
    if (result.error) throw result.error;
  }

  return {
    menuItemCount: menuItems.count ?? 0,
    unavailableMenuItemCount: unavailable.count ?? 0,
    categoryCount: categories.count ?? 0,
    galleryImageCount: gallery.count ?? 0,
  };
}
