const MAX_DIMENSION = 1600;
const JPEG_WEBP_QUALITY = 0.82;

/**
 * Downscales an image file to fit within MAX_DIMENSION (never upscales) and
 * re-encodes it at JPEG_WEBP_QUALITY, to keep uploaded photos from bloating
 * Supabase Storage/bandwidth. Falls back to the original file untouched on
 * any decode/encode failure (unsupported browser, corrupt file, etc.) so a
 * compression bug never blocks an otherwise-valid upload.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outputType, JPEG_WEBP_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    const name = file.name.replace(/\.[^.]+$/, `.${extension}`);
    return new File([blob], name, { type: outputType });
  } catch {
    return file;
  }
}
