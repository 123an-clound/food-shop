import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MenuItemsTable } from './MenuItemsTable';

// jsdom does not implement scrollIntoView, but Radix UI's Select calls it
// when scrolling the highlighted item into view as its dropdown opens.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}

const refreshMock = vi.fn();
const deleteMenuItemMock = vi.fn();
const reorderMenuItemsMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/app/actions/menu-items', () => ({
  deleteMenuItem: (...args: unknown[]) => deleteMenuItemMock(...args),
  reorderMenuItems: (...args: unknown[]) => reorderMenuItemsMock(...args),
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
// drag physics. Its presence (or absence) in the rendered output also lets
// us assert whether drag-reorder is enabled for a given filter combination.
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
    <div data-testid="sortable-list">
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
    id: 'cat-1',
    name_vi: 'Khai vị',
    name_en: 'Appetizers',
    slug: 'khai-vi',
    description_vi: '',
    description_en: '',
    display_order: 1,
  },
  {
    id: 'cat-2',
    name_vi: 'Súp',
    name_en: 'Soups',
    slug: 'sup',
    description_vi: '',
    description_en: '',
    display_order: 2,
  },
];

const items = [
  {
    id: 'item-1',
    category_id: 'cat-1',
    name_vi: 'Gỏi cuốn',
    name_en: 'Spring Rolls',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: '',
    is_available: true,
    is_featured: false,
    display_order: 1,
  },
  {
    id: 'item-2',
    category_id: 'cat-2',
    name_vi: 'Súp măng cua',
    name_en: 'Crab Soup',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: '',
    is_available: false,
    is_featured: true,
    display_order: 2,
  },
];

describe('MenuItemsTable', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    deleteMenuItemMock.mockReset();
    reorderMenuItemsMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('renders every item by default', () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument();
    expect(screen.getByText('Súp măng cua')).toBeInTheDocument();
  });

  it('filters by search term', () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên…'), { target: { value: 'Gỏi' } });
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument();
    expect(screen.queryByText('Súp măng cua')).not.toBeInTheDocument();
  });

  it('shows the "Hết hàng" and "Nổi bật" badges correctly', () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    expect(screen.getByText('Nổi bật')).toBeInTheDocument();
  });

  it('opens the confirm dialog and calls deleteMenuItem on confirm', async () => {
    deleteMenuItemMock.mockResolvedValue({ success: true });
    render(<MenuItemsTable items={items} categories={categories} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deleteMenuItemMock).toHaveBeenCalledWith('item-1');
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it('renders the read-only list (not SortableList) when categoryFilter is "all"', () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    expect(screen.queryByTestId('sortable-list')).not.toBeInTheDocument();
  });

  it('renders the read-only list (not SortableList) when a category is selected AND search has text', async () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    fireEvent.keyDown(await screen.findByRole('option', { name: 'Khai vị' }), { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Khai vị');
    });
    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên…'), { target: { value: 'Gỏi' } });
    expect(screen.queryByTestId('sortable-list')).not.toBeInTheDocument();
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument();
    expect(
      screen.getByText('Xoá nội dung tìm kiếm để sắp xếp thứ tự bằng kéo-thả.')
    ).toBeInTheDocument();
  });

  it('renders SortableList (drag-enabled) when a specific category is selected and search is empty', async () => {
    render(<MenuItemsTable items={items} categories={categories} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    fireEvent.keyDown(await screen.findByRole('option', { name: 'Khai vị' }), { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Khai vị');
    });
    expect(screen.getByTestId('sortable-list')).toBeInTheDocument();
  });

  it('calls reorderMenuItems with the full reordered id array and refreshes on success', async () => {
    reorderMenuItemsMock.mockResolvedValue({ success: true });
    render(<MenuItemsTable items={items} categories={categories} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    fireEvent.keyDown(await screen.findByRole('option', { name: 'Khai vị' }), { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Khai vị');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simulate reorder' }));
    await waitFor(() => {
      expect(reorderMenuItemsMock).toHaveBeenCalledWith(['item-1']);
    });
    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
