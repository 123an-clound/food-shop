'use client';

import { useState } from 'react';
import Image from 'next/image';
import { localize } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/i18n/localize';
import type { GalleryImage } from '@/lib/types';

export function GalleryGrid({ images, locale }: { images: GalleryImage[]; locale: Locale }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openImage = images.find((image) => image.id === openId) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenId(image.id)}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={image.image_url}
              alt={localize(image.caption_vi, image.caption_en, locale)}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          </button>
        ))}
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4"
          onClick={() => setOpenId(null)}
        >
          <div className="relative aspect-video w-full max-w-4xl">
            <Image
              src={openImage.image_url}
              alt={localize(openImage.caption_vi, openImage.caption_en, locale)}
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpenId(null)}
            aria-label="Close"
            className="absolute right-4 top-4 text-2xl text-ivory"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
