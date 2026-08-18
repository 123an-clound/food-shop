import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryForm } from './CategoryForm';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const createCategoryMock = vi.fn();
const updateCategoryMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/app/actions/categories', () => ({
  createCategory: (...args: unknown[]) => createCategoryMock(...args),
  updateCategory: (...args: unknown[]) => updateCategoryMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe('CategoryForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createCategoryMock.mockReset();
    updateCategoryMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('shows a validation error when the Vietnamese name is empty', async () => {
    render(<CategoryForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.getByText('Tên tiếng Việt là bắt buộc')).toBeInTheDocument();
    });
    expect(createCategoryMock).not.toHaveBeenCalled();
  });

  it('calls createCategory and redirects on success when adding a new category', async () => {
    createCategoryMock.mockResolvedValue({ success: true });
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Khai vị' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Appetizers' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(createCategoryMock).toHaveBeenCalledTimes(1);
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/categories');
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it('calls updateCategory instead of createCategory when a category is passed in', async () => {
    updateCategoryMock.mockResolvedValue({ success: true });
    render(
      <CategoryForm
        category={{
          id: 'cat-1',
          name_vi: 'Khai vị',
          name_en: 'Appetizers',
          slug: 'khai-vi',
          description_vi: '',
          description_en: '',
          display_order: 1,
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateCategoryMock).toHaveBeenCalledWith('cat-1', expect.any(FormData));
    });
    expect(createCategoryMock).not.toHaveBeenCalled();
  });

  it('shows a toast error and does not redirect when the action fails', async () => {
    createCategoryMock.mockResolvedValue({ success: false, error: 'Slug đã tồn tại.' });
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Việt)'), { target: { value: 'Khai vị' } });
    fireEvent.change(screen.getByLabelText('Tên (Tiếng Anh)'), { target: { value: 'Appetizers' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Slug đã tồn tại.');
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
