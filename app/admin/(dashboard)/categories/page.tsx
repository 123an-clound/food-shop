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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh mục</h1>
        <Button asChild>
          <Link href="/admin/categories/new">Thêm danh mục</Link>
        </Button>
      </div>
      <CategoriesTable categories={categories} items={items} />
    </div>
  );
}
