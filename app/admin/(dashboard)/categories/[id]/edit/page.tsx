import { notFound } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: category } = await supabase.from('categories').select('*').eq('id', params.id).single();

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sửa danh mục</h1>
      <CategoryForm category={category} />
    </div>
  );
}
