import { CategoryForm } from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thêm danh mục</h1>
      <CategoryForm />
    </div>
  );
}
