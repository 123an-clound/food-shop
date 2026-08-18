import type { ReactNode } from 'react';
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

  it('refreshes after each successful caption save so a stale closure cannot revert the sibling field', async () => {
    // Regression test: handleCaptionBlur reads its "other" caption value from
    // the closure-captured `image` prop. Without a refresh after each save,
    // editing VI then EN on the same row would silently revert VI to its old
    // value on the second blur, because the component keeps no local state
    // mirroring saved edits. Calling router.refresh() after each successful
    // save is what lets the next render pick up the freshly saved value.
    updateGalleryImageCaptionMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    const viInput = screen.getByDisplayValue('Không gian chính');
    const enInput = screen.getByDisplayValue('Main space');

    fireEvent.change(viInput, { target: { value: 'Không gian mới' } });
    fireEvent.blur(viInput);
    await waitFor(() => {
      expect(updateGalleryImageCaptionMock).toHaveBeenCalledTimes(1);
    });
    expect(refreshMock).toHaveBeenCalledTimes(1);

    fireEvent.change(enInput, { target: { value: 'New main space' } });
    fireEvent.blur(enInput);
    await waitFor(() => {
      expect(updateGalleryImageCaptionMock).toHaveBeenCalledTimes(2);
    });
    expect(refreshMock).toHaveBeenCalledTimes(2);
  });

  it('continues to the next file when one upload throws instead of returning an error', async () => {
    // Regression test: a thrown exception (e.g. a network-level failure) from
    // storage.upload used to escape the for-loop entirely, leaving the button
    // stuck on "Đang tải lên…" and silently skipping every remaining file.
    uploadMock.mockRejectedValueOnce(new Error('network fail')).mockResolvedValueOnce({ error: null });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'https://x.supabase.co/good.jpg' } });
    createGalleryImageMock.mockResolvedValue({ success: true });
    render(<GalleryManager images={images} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        files: [makeFile('bad.jpg', 'image/jpeg', 1024), makeFile('good.jpg', 'image/jpeg', 1024)],
      },
    });

    await waitFor(() => {
      expect(createGalleryImageMock).toHaveBeenCalledTimes(1);
    });
    expect(uploadMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('alert')).toHaveTextContent('Upload "bad.jpg" thất bại.');

    // The upload button must not be left stuck on "Đang tải lên…".
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Tải ảnh lên' })).toBeInTheDocument();
    });
    expect(refreshMock).toHaveBeenCalled();
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

  it('calls reorderGalleryImages with the full reordered id array and refreshes on success', async () => {
    reorderGalleryImagesMock.mockResolvedValue({ success: true });
    const twoImages = [
      ...images,
      { id: 'img-2', image_url: 'https://x.supabase.co/b.jpg', caption_vi: 'Sảnh', caption_en: 'Hall', display_order: 2 },
    ];
    render(<GalleryManager images={twoImages} />);
    fireEvent.click(screen.getByRole('button', { name: 'Simulate reorder' }));
    await waitFor(() => {
      expect(reorderGalleryImagesMock).toHaveBeenCalledWith(['img-2', 'img-1']);
    });
    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
