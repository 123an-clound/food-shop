'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export function ImageUploader({
  bucket,
  existingUrl,
  onUploaded,
  label,
}: {
  bucket: 'dish-images' | 'site-media';
  existingUrl?: string;
  onUploaded: (url: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(existingUrl);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    const supabase = createBrowserSupabaseClient();
    const extension = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
    setIsUploading(false);

    if (uploadError) {
      setError('Upload ảnh thất bại. Vui lòng thử lại.');
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    // Spec §6: once the new file is safely uploaded, delete the file it
    // replaces so Storage doesn't accumulate orphaned images. This reads
    // `previewUrl` (the *current* state, which already reflects any earlier
    // replacement made in this same session) rather than the `existingUrl`
    // prop, so a second replace-in-a-row cleans up the first replacement's
    // file, not the original one from before the component mounted.
    const previousPath = previewUrl ? extractStoragePath(previewUrl, bucket) : null;
    if (previousPath) {
      await supabase.storage.from(bucket).remove([previousPath]);
    }

    setPreviewUrl(data.publicUrl);
    onUploaded(data.publicUrl);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {previewUrl && (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border">
          <Image src={previewUrl} alt={label} fill className="object-cover" sizes="128px" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {isUploading ? 'Đang tải lên…' : previewUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
      </Button>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
