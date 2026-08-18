import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from './ImageUploader';

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();
const removeMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    storage: {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
        remove: removeMock,
      }),
    },
  }),
}));

function makeFile(name: string, type: string, sizeBytes: number) {
  return new File(['x'.repeat(sizeBytes)], name, { type });
}

describe('ImageUploader', () => {
  beforeEach(() => {
    uploadMock.mockReset();
    getPublicUrlMock.mockReset();
    removeMock.mockReset().mockResolvedValue({ error: null });
  });

  it('rejects a file with a disallowed type', async () => {
    render(<ImageUploader bucket="dish-images" label="Ảnh món ăn" onUploaded={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('a.gif', 'image/gif', 100)] } });
    expect(await screen.findByText('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.')).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('rejects a file larger than 5MB', async () => {
    render(<ImageUploader bucket="dish-images" label="Ảnh món ăn" onUploaded={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024)] } });
    expect(await screen.findByText('Dung lượng ảnh tối đa là 5MB.')).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('uploads a valid file and calls onUploaded with the public URL', async () => {
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: 'https://x.supabase.co/storage/v1/object/public/dish-images/abc.jpg' },
    });
    const onUploaded = vi.fn();
    render(<ImageUploader bucket="dish-images" label="Ảnh món ăn" onUploaded={onUploaded} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('dish.jpg', 'image/jpeg', 1024)] } });
    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith(
        'https://x.supabase.co/storage/v1/object/public/dish-images/abc.jpg'
      );
    });
    expect(removeMock).not.toHaveBeenCalled();
  });

  it('does not delete the previous file itself when an existing image is replaced', async () => {
    // Deleting the replaced file is now the parent form's responsibility,
    // done only after the Server Action successfully saves the new URL (see
    // MenuItemForm.test.tsx / RestaurantInfoForm.test.tsx). ImageUploader
    // itself must never touch the old file.
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: 'https://x.supabase.co/storage/v1/object/public/dish-images/new.jpg' },
    });
    const onUploaded = vi.fn();
    render(
      <ImageUploader
        bucket="dish-images"
        label="Ảnh món ăn"
        existingUrl="https://x.supabase.co/storage/v1/object/public/dish-images/old.jpg"
        onUploaded={onUploaded}
      />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('new.jpg', 'image/jpeg', 1024)] } });
    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith(
        'https://x.supabase.co/storage/v1/object/public/dish-images/new.jpg'
      );
    });
    expect(removeMock).not.toHaveBeenCalled();
  });

  it('clears the file input value after a validation failure so re-picking the same file fires a change event', async () => {
    render(<ImageUploader bucket="dish-images" label="Ảnh món ăn" onUploaded={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('a.gif', 'image/gif', 100)] } });
    await screen.findByText('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
    expect(input.value).toBe('');
  });
});
