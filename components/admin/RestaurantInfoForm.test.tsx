import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RestaurantInfoForm } from './RestaurantInfoForm';

const refreshMock = vi.fn();
const updateRestaurantInfoMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/app/actions/restaurant-info', () => ({
  updateRestaurantInfo: (...args: unknown[]) => updateRestaurantInfoMock(...args),
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

const info = {
  id: 1,
  name_vi: 'Hương Việt',
  name_en: 'Huong Viet Fine Dining',
  tagline_vi: '',
  tagline_en: '',
  description_vi: '',
  description_en: '',
  address: '',
  phone: '',
  email: '',
  opening_hours: '',
  map_embed_url: '',
  facebook_url: '',
  instagram_url: '',
  logo_url: '',
  hero_image_url: '',
};

describe('RestaurantInfoForm', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    updateRestaurantInfoMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('pre-fills the form with the existing restaurant info', () => {
    render(<RestaurantInfoForm info={info} />);
    expect(screen.getByLabelText('Tên (Tiếng Việt)')).toHaveValue('Hương Việt');
  });

  it('shows a validation error for an invalid map embed URL', async () => {
    render(<RestaurantInfoForm info={info} />);
    fireEvent.change(screen.getByLabelText('URL nhúng Google Maps'), { target: { value: 'not-a-url' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.getByText('URL không hợp lệ')).toBeInTheDocument();
    });
    expect(updateRestaurantInfoMock).not.toHaveBeenCalled();
  });

  it('calls updateRestaurantInfo and shows a success toast', async () => {
    updateRestaurantInfoMock.mockResolvedValue({ success: true });
    render(<RestaurantInfoForm info={info} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateRestaurantInfoMock).toHaveBeenCalledWith(expect.any(FormData));
    });
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it('shows a toast error when the action fails', async () => {
    updateRestaurantInfoMock.mockResolvedValue({ success: false, error: 'Lỗi lưu dữ liệu.' });
    render(<RestaurantInfoForm info={info} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Lỗi lưu dữ liệu.');
    });
  });
});
