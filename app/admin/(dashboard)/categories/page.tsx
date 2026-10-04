import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCategories, getMenuItems } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { CategoriesTable } from '@/components/admin/CategoriesTable';

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient();
  const [categories, items] = await Promise.all([getCategories(supabase), getMenuItems(supabase)]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-[var(--brand-accent)]">Ẩm thực Việt</p><h1 className="mt-2 font-heading text-3xl sm:text-4xl">Danh mục món</h1></div>
        <Button asChild>
          <Link href="/admin/categories/new">Thêm danh mục</Link>
        </Button>
      </div>
      <CategoriesTable categories={categories} items={items} />
    </div>
  );
}
