'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteCategory, reorderCategories } from '@/app/actions/categories';
import { SortableList } from '@/components/admin/SortableList';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import type { Category } from '@/lib/types';

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [, startTransition] = useTransition();

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderCategories(orderedIds);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const result = await deleteCategory(pendingDelete.id);
    setPendingDelete(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Đã xoá danh mục.');
    router.refresh();
  }

  return (
    <>
      <SortableList
        items={categories}
        onReorder={handleReorder}
        renderItem={(category) => (
          <div className="flex items-center justify-between rounded-md border bg-card p-4">
            <div>
              <p className="font-medium">{category.name_vi}</p>
              <p className="text-sm text-muted-foreground">{category.name_en}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/categories/${category.id}/edit`}>Sửa</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setPendingDelete(category)}>
                Xoá
              </Button>
            </div>
          </div>
        )}
      />
      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={pendingDelete?.name_vi ?? ''}
      />
    </>
  );
}
