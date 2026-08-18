import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuItemForm } from './MenuItemForm';

// jsdom does not implement scrollIntoView, but Radix UI's Select calls it
// when scrolling the highlighted item into view as its dropdown opens.
// Stub it so the "select a category" interaction below doesn't throw.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}

const pushMock = vi.fn();
const refreshMock = vi.fn();
const createMenuItemMock = vi.fn();
const updateMenuItemMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/app/actions/menu-items', () => ({
  createMenuItem: (...args: unknown[]) => createMenuItemMock(...args),
  updateMenuItem: (...args: unknown[]) => updateMenuItemMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

vi.mock('@/components/admin/ImageUploader', () => ({
  ImageUploader: ({ label }: { label: string }) => <div>{label}</div>,
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
];

describe('MenuItemForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createMenuItemMock.mockReset();
    updateMenuItemMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('shows a validation error when the price is not positive', async () => {
    render(<MenuItemForm categories={categories} />);
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Phở bò' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Beef Pho' } });
    fireEvent.change(screen.getByLabelText('Giá (VNĐ)'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.getByText('Giá phải lớn hơn 0')).toBeInTheDocument();
    });
    expect(createMenuItemMock).not.toHaveBeenCalled();
  });

  it('calls updateMenuItem when an item is passed in', async () => {
    updateMenuItemMock.mockResolvedValue({ success: true });
    render(
      <MenuItemForm
        categories={categories}
        item={{
          id: 'item-1',
          category_id: 'cat-1',
          name_vi: 'Phở bò',
          name_en: 'Beef Pho',
          description_vi: '',
          description_en: '',
          price: 100000,
          image_url: '',
          is_available: true,
          is_featured: false,
          display_order: 1,
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateMenuItemMock).toHaveBeenCalledWith('item-1', expect.any(FormData));
    });
  });

  it('shows a toast error and does not redirect when the action fails', async () => {
    createMenuItemMock.mockResolvedValue({ success: false, error: 'Lỗi lưu dữ liệu.' });
    render(<MenuItemForm categories={categories} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    fireEvent.keyDown(await screen.findByRole('option', { name: 'Khai vị' }), { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Khai vị');
    });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Phở bò' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Beef Pho' } });
    fireEvent.change(screen.getByLabelText('Giá (VNĐ)'), { target: { value: '100000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Lỗi lưu dữ liệu.');
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
