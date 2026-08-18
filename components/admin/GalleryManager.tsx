'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import {
  createGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImageCaption,
} from '@/app/actions/gallery';
import { SortableList } from '@/components/admin/SortableList';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GalleryImage } from '@/lib/types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function GalleryManager({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GalleryImage | null>(null);
  const [, startTransition] = useTransition();

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);
    const supabase = createBrowserSupabaseClient();

    try {
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setUploadError(`"${file.name}": chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setUploadError(`"${file.name}": dung lượng tối đa là 5MB.`);
          continue;
        }

        try {
          const extension = file.name.split('.').pop();
          const path = `${crypto.randomUUID()}.${extension}`;
          const { error: uploadErr } = await supabase.storage.from('site-media').upload(path, file);
          if (uploadErr) {
            setUploadError(`Upload "${file.name}" thất bại.`);
            continue;
          }

          const { data } = supabase.storage.from('site-media').getPublicUrl(path);
          const formData = new FormData();
          formData.set('image_url', data.publicUrl);
          formData.set('caption_vi', '');
          formData.set('caption_en', '');
          const result = await createGalleryImage(formData);
          if (!result.success) {
            setUploadError(result.error);
          }
        } catch {
          // A thrown exception (e.g. a network-level failure) is reported the
          // same way as an explicit `{ error }` result, so it doesn't abort
          // the rest of the batch — the loop moves on to the next file.
          setUploadError(`Upload "${file.name}" thất bại.`);
        }
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    }
  }

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderGalleryImages(orderedIds);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  async function handleCaptionBlur(image: GalleryImage, field: 'caption_vi' | 'caption_en', value: string) {
    if (value === image[field]) return;

    const result = await updateGalleryImageCaption(
      image.id,
      field === 'caption_vi' ? value : image.caption_vi,
      field === 'caption_en' ? value : image.caption_en
    );
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    // Refresh so the `images` prop reflects the just-saved value — otherwise
    // a second blur on the sibling caption field of the same row would read
    // the other field from this stale, closure-captured `image` and revert it.
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const result = await deleteGalleryImage(pendingDelete.id);
    setPendingDelete(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Đã xoá ảnh.');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFilesSelected}
          className="hidden"
        />
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
          {isUploading ? 'Đang tải lên…' : 'Tải ảnh lên'}
        </Button>
        {uploadError && (
          <p role="alert" className="mt-2 text-sm font-medium text-destructive">
            {uploadError}
          </p>
        )}
      </div>

      <SortableList
        items={images}
        onReorder={handleReorder}
        renderItem={(image) => (
          <div className="flex items-center gap-4 rounded-md border bg-card p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
              <Image
                src={image.image_url}
                alt={image.caption_vi || 'Ảnh gallery'}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Chú thích (Tiếng Việt)"
                defaultValue={image.caption_vi}
                onBlur={(event) => handleCaptionBlur(image, 'caption_vi', event.target.value)}
              />
              <Input
                placeholder="Chú thích (Tiếng Anh)"
                defaultValue={image.caption_en}
                onBlur={(event) => handleCaptionBlur(image, 'caption_en', event.target.value)}
              />
            </div>
            <Button variant="destructive" size="sm" onClick={() => setPendingDelete(image)}>
              Xoá
            </Button>
          </div>
        )}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={pendingDelete?.caption_vi || 'ảnh này'}
      />
    </div>
  );
}
