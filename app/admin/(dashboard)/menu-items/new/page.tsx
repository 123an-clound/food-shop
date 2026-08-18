import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/supabase/queries';
import { MenuItemForm } from '@/components/admin/MenuItemForm';

export default async function NewMenuItemPage() {
  const supabase = await createServerSupabaseClient();
  const categories = await getCategories(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thêm món ăn</h1>
      <MenuItemForm categories={categories} />
    </div>
  );
}
