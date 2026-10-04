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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">Ẩm thực Việt</p><h1 className="mt-2 font-heading text-3xl sm:text-4xl">Món ăn</h1></div>
        <Button asChild>
          <Link href="/admin/menu-items/new">Thêm món ăn</Link>
        </Button>
      </div>
      <MenuItemsTable items={items} categories={categories} />
    </div>
  );
}
