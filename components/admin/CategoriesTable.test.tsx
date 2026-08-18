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
    render(<CategoriesTable categories={categories} />);
    expect(screen.getByText('Khai vị')).toBeInTheDocument();
    expect(screen.getByText('Súp')).toBeInTheDocument();
  });

  it('opens the confirm dialog with the right item name when Xoá is clicked', () => {
    render(<CategoriesTable categories={categories} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    expect(screen.getByText('Xoá "Khai vị"?')).toBeInTheDocument();
  });

  it('calls deleteCategory and refreshes on confirm', async () => {
    deleteCategoryMock.mockResolvedValue({ success: true });
    render(<CategoriesTable categories={categories} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deleteCategoryMock).toHaveBeenCalledWith('1');
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
