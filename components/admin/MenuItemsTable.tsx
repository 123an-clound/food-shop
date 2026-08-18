'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteMenuItem, reorderMenuItems } from '@/app/actions/menu-items';
import { SortableList } from '@/components/admin/SortableList';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatPrice } from '@/lib/format';
import type { Category, MenuItem } from '@/lib/types';

export function MenuItemsTable({ items, categories }: { items: MenuItem[]; categories: Category[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);
  const [, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        term === '' || item.name_vi.toLowerCase().includes(term) || item.name_en.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderMenuItems(orderedIds);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const result = await deleteMenuItem(pendingDelete.id);
    setPendingDelete(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Đã xoá món ăn.');
    router.refresh();
  }

  function renderRow(item: MenuItem) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-card p-4">
        <div>
          <p className="font-medium">
            {item.name_vi}
            {!item.is_available && (
              <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hết hàng</span>
            )}
            {item.is_featured && (
              <span className="ml-2 rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">Nổi bật</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.name_en} · {formatPrice(item.price)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/menu-items/${item.id}/edit`}>Sửa</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setPendingDelete(item)}>
            Xoá
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Tìm theo tên…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name_vi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryFilter === 'all' && (
        <p className="text-sm text-muted-foreground">
          Chọn một danh mục cụ thể để sắp xếp thứ tự bằng kéo-thả.
        </p>
      )}

      {categoryFilter === 'all' ? (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.id}>{renderRow(item)}</div>
          ))}
        </div>
      ) : (
        <SortableList items={filteredItems} onReorder={handleReorder} renderItem={renderRow} />
      )}

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={pendingDelete?.name_vi ?? ''}
      />
    </div>
  );
}
