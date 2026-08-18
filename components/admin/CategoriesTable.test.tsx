import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CategoriesTable } from './CategoriesTable';

const refreshMock = vi.fn();
const deleteCategoryMock = vi.fn();
const reorderCategoriesMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/app/actions/categories', () => ({
  deleteCategory: (...args: unknown[]) => deleteCategoryMock(...args),
  reorderCategories: (...args: unknown[]) => reorderCategoriesMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

// SortableList uses real dnd-kit internals that are impractical to drive via
// synthetic pointer events in jsdom. Stub it with a simplified version that
// still renders every item and exposes a button to trigger `onReorder`
// directly with a fixed reordered id array, so we can test the *wiring*
// between this table and the reorder Server Action without simulating real
// drag physics.
vi.mock('@/components/admin/SortableList', () => ({
  SortableList: ({
    items,
    onReorder,
    renderItem,
  }: {
    items: { id: string }[];
    onReorder: (orderedIds: string[]) => void;
    renderItem: (item: { id: string }) => ReactNode;
  }) => (
    <div>
      {items.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
      <button
        type="button"
        onClick={() => onReorder([...items].reverse().map((item) => item.id))}
      >
        Simulate reorder
      </button>
    </div>
  ),
}));

const categories = [
  {
    id: '1',
    name_vi: 'Khai vị',
    name_en: 'Appetizers',
    slug: 'khai-vi',
    description_vi: '',
    description_en: '',
    display_order: 1,
  },
  {
    id: '2',
    name_vi: 'Súp',
    name_en: 'Soups',
    slug: 'sup',
    description_vi: '',
    description_en: '',
    display_order: 2,
  },
];

describe('CategoriesTable', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    deleteCategoryMock.mockReset();
    reorderCategoriesMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('renders every category', () => {
    render(<CategoriesTable categories={categories} items={[]} />);
    expect(screen.getByText('Khai vị')).toBeInTheDocument();
    expect(screen.getByText('Súp')).toBeInTheDocument();
  });

  it('opens the confirm dialog with the right item name when Xoá is clicked', () => {
    render(<CategoriesTable categories={categories} items={[]} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    expect(screen.getByText('Xoá "Khai vị"?')).toBeInTheDocument();
  });

  it('calls deleteCategory and refreshes on confirm', async () => {
    deleteCategoryMock.mockResolvedValue({ success: true });
    render(<CategoriesTable categories={categories} items={[]} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deleteCategoryMock).toHaveBeenCalledWith('1');
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it('warns about the number of menu items when deleting a category that has some', () => {
    const items = [
      { id: 'i1', category_id: '1', name_vi: 'A', name_en: 'A', description_vi: '', description_en: '', price: 1, image_url: '', is_available: true, is_featured: false, display_order: 1 },
      { id: 'i2', category_id: '1', name_vi: 'B', name_en: 'B', description_vi: '', description_en: '', price: 1, image_url: '', is_available: true, is_featured: false, display_order: 2 },
      { id: 'i3', category_id: '2', name_vi: 'C', name_en: 'C', description_vi: '', description_en: '', price: 1, image_url: '', is_available: true, is_featured: false, display_order: 1 },
    ];
    render(<CategoriesTable categories={categories} items={items} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    expect(
      screen.getByText('Danh mục này đang có 2 món ăn — các món này sẽ không còn hiển thị trên trang thực đơn.')
    ).toBeInTheDocument();
  });

  it('does not show the menu-item warning when the category has none', () => {
    render(<CategoriesTable categories={categories} items={[]} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    expect(screen.queryByText(/đang có/)).not.toBeInTheDocument();
  });

  it('calls reorderCategories with the full reordered id array and refreshes on success', async () => {
    reorderCategoriesMock.mockResolvedValue({ success: true });
    render(<CategoriesTable categories={categories} items={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Simulate reorder' }));
    await waitFor(() => {
      expect(reorderCategoriesMock).toHaveBeenCalledWith(['2', '1']);
    });
    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
