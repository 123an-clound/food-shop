import { describe, it, expect, vi, afterEach } from 'vitest';
import { compressImage } from './image-compression';

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

function stubCanvas(outputBlob: Blob | null) {
  const ctx = { drawImage: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback
  ) {
    callback(outputBlob);
  });
}

describe('compressImage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns the original file unchanged for non-raster types', async () => {
    const file = makeFile('logo.svg', 'image/svg+xml', 1000);
    expect(await compressImage(file)).toBe(file);
  });

  it('returns a smaller re-encoded file when compression shrinks it', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 3200, height: 1600, close: vi.fn() })
    );
    const smallerBlob = new Blob([new Uint8Array(100)], { type: 'image/jpeg' });
    stubCanvas(smallerBlob);

    const original = makeFile('photo.jpg', 'image/jpeg', 5000);
    const result = await compressImage(original);

    expect(result).not.toBe(original);
    expect(result.type).toBe('image/jpeg');
    expect(result.size).toBe(100);
  });

  it('keeps the original file when the re-encoded blob is not smaller', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 400, height: 300, close: vi.fn() })
    );
    const biggerBlob = new Blob([new Uint8Array(9000)], { type: 'image/jpeg' });
    stubCanvas(biggerBlob);

    const original = makeFile('photo.jpg', 'image/jpeg', 5000);
    expect(await compressImage(original)).toBe(original);
  });

  it('falls back to the original file when decoding throws', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('decode failed')));

    const original = makeFile('photo.jpg', 'image/jpeg', 5000);
    expect(await compressImage(original)).toBe(original);
  });
});
