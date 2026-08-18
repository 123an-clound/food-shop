import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RestaurantInfoForm } from './RestaurantInfoForm';

const refreshMock = vi.fn();
const updateRestaurantInfoMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
const removeMock = vi.fn();

const NEW_LOGO_URL = 'https://x.supabase.co/storage/v1/object/public/site-media/new-logo.jpg';
const NEW_HERO_URL = 'https://x.supabase.co/storage/v1/object/public/site-media/new-hero.jpg';

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

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    storage: {
      from: () => ({ remove: removeMock }),
    },
  }),
}));

// A minimal stub that still exposes `onUploaded` so tests can simulate a
// replaced image without exercising the real upload flow (covered by
// ImageUploader.test.tsx). The button text distinguishes the logo vs. hero
// uploader by label, and each triggers a different fixed replacement URL.
vi.mock('@/components/admin/ImageUploader', () => ({
  ImageUploader: ({ label, onUploaded }: { label: string; onUploaded: (url: string) => void }) => (
    <div>
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onUploaded(label === 'Logo' ? NEW_LOGO_URL : NEW_HERO_URL)}
      >
        {`Đổi ảnh: ${label}`}
      </button>
    </div>
  ),
  // Re-exported with its real implementation since RestaurantInfoForm
  // imports and calls it directly.
  extractStoragePath: (url: string, bucket: string) => {
    const marker = `/object/public/${bucket}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return url.slice(index + marker.length);
  },
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
    removeMock.mockReset().mockResolvedValue({ error: null });
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

  it('deletes the old logo and hero image from storage after a successful save when both were replaced', async () => {
    updateRestaurantInfoMock.mockResolvedValue({ success: true });
    const infoWithImages = {
      ...info,
      logo_url: 'https://x.supabase.co/storage/v1/object/public/site-media/old-logo.jpg',
      hero_image_url: 'https://x.supabase.co/storage/v1/object/public/site-media/old-hero.jpg',
    };
    render(<RestaurantInfoForm info={infoWithImages} />);
    fireEvent.click(screen.getByRole('button', { name: 'Đổi ảnh: Logo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đổi ảnh: Ảnh hero trang chủ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateRestaurantInfoMock).toHaveBeenCalledWith(expect.any(FormData));
    });
    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith(['old-logo.jpg']);
      expect(removeMock).toHaveBeenCalledWith(['old-hero.jpg']);
    });
    expect(removeMock).toHaveBeenCalledTimes(2);
  });

  it('does not delete anything when neither image was replaced', async () => {
    updateRestaurantInfoMock.mockResolvedValue({ success: true });
    const infoWithImages = {
      ...info,
      logo_url: 'https://x.supabase.co/storage/v1/object/public/site-media/old-logo.jpg',
      hero_image_url: 'https://x.supabase.co/storage/v1/object/public/site-media/old-hero.jpg',
    };
    render(<RestaurantInfoForm info={infoWithImages} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(updateRestaurantInfoMock).toHaveBeenCalledWith(expect.any(FormData));
    });
    expect(removeMock).not.toHaveBeenCalled();
  });
});
