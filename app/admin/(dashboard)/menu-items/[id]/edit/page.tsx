import { notFound } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/supabase/queries';
import { MenuItemForm } from '@/components/admin/MenuItemForm';

export default async function EditMenuItemPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const [categories, { data: item }] = await Promise.all([
    getCategories(supabase),
    supabase.from('menu_items').select('*').eq('id', params.id).single(),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sửa món ăn</h1>
      <MenuItemForm categories={categories} item={item} />
    </div>
  );
}
