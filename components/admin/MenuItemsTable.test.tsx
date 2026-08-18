import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MenuItemsTable } from './MenuItemsTable';

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
});
