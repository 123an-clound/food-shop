import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories, getMenuItems } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { MenuItemsTable } from '@/components/admin/MenuItemsTable';

export default async function MenuItemsPage() {
  const supabase = await createServerSupabaseClient();
  const [categories, items] = await Promise.all([getCategories(supabase), getMenuItems(supabase)]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Món ăn</h1>
        <Button asChild>
          <Link href="/admin/menu-items/new">Thêm món ăn</Link>
        </Button>
      </div>
      <MenuItemsTable items={items} categories={categories} />
    </div>
  );
}
