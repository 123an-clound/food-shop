import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { GalleryManager } from './GalleryManager';

const refreshMock = vi.fn();
const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();
const createGalleryImageMock = vi.fn();
const updateGalleryImageCaptionMock = vi.fn();
const deleteGalleryImageMock = vi.fn();
const reorderGalleryImagesMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    storage: {
      from: () => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }),
    },
  }),
}));

vi.mock('@/app/actions/gallery', () => ({
  createGalleryImage: (...args: unknown[]) => createGalleryImageMock(...args),
  updateGalleryImageCaption: (...args: unknown[]) => updateGalleryImageCaptionMock(...args),
  deleteGalleryImage: (...args: unknown[]) => deleteGalleryImageMock(...args),
  reorderGalleryImages: (...args: unknown[]) => reorderGalleryImagesMock(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

const images = [
  {
    id: 'img-1',
    image_url: 'https://x.supabase.co/a.jpg',
    caption_vi: 'Không gian chính',
    caption_en: 'Main space',
    display_order: 1,
  },
];

function makeFile(name: string, type: string, sizeBytes: number) {
  return new File(['x'.repeat(sizeBytes)], name, { type });
}

describe('GalleryManager', () => {
  beforeEach(() => {
    refreshMock.mockClear();
    uploadMock.mockReset();
    getPublicUrlMock.mockReset();
    createGalleryImageMock.mockReset();
    updateGalleryImageCaptionMock.mockReset();
    deleteGalleryImageMock.mockReset();
    reorderGalleryImagesMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it('renders existing images with their captions pre-filled', () => {
    render(<GalleryManager images={images} />);
    expect(screen.getByDisplayValue('Không gian chính')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Main space')).toBeInTheDocument();
  });

  it('uploads a selected file and creates a gallery image row for it', async () => {
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'https://x.supabase.co/new.jpg' } });
    createGalleryImageMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('new.jpg', 'image/jpeg', 1024)] } });
    await waitFor(() => {
      expect(createGalleryImageMock).toHaveBeenCalledWith(expect.any(FormData));
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it('saves an updated caption on blur', async () => {
    updateGalleryImageCaptionMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    const viInput = screen.getByDisplayValue('Không gian chính');
    fireEvent.change(viInput, { target: { value: 'Không gian mới' } });
    fireEvent.blur(viInput);
    await waitFor(() => {
      expect(updateGalleryImageCaptionMock).toHaveBeenCalledWith('img-1', 'Không gian mới', 'Main space');
    });
  });

  it('opens the confirm dialog and deletes on confirm', async () => {
    deleteGalleryImageMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deleteGalleryImageMock).toHaveBeenCalledWith('img-1');
    });
    expect(toastSuccessMock).toHaveBeenCalled();
  });
});
