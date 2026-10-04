'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { localize } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/i18n/localize';
import type { GalleryImage } from '@/lib/types';

export function GalleryGrid({ images, locale }: { images: GalleryImage[]; locale: Locale }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbnailRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const focusedThumbnailIdRef = useRef<string | null>(null);
  const openImage = images.find((image) => image.id === openId) ?? null;

  // Handle focus management and keyboard events
  useEffect(() => {
    if (openImage) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Move focus to close button when dialog opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      // Handle Escape key to close dialog
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpenId(null);
        } else if (event.key === 'Tab') {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    } else if (focusedThumbnailIdRef.current) {
      // Return focus to the thumbnail that opened the dialog
      const thumbnail = thumbnailRefs.current.get(focusedThumbnailIdRef.current);
      if (thumbnail) {
        thumbnail.focus();
      }
      focusedThumbnailIdRef.current = null;
    }
  }, [openImage]);

  const handleThumbnailClick = (imageId: string) => {
    focusedThumbnailIdRef.current = imageId;
    setOpenId(imageId);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {images.map((image, index) => (
          <button
            key={image.id}
            ref={(el) => {
              if (el) thumbnailRefs.current.set(image.id, el);
            }}
            type="button"
            onClick={() => handleThumbnailClick(image.id)}
            className={`group relative overflow-hidden bg-[var(--brand-sand)] ${index === 0 ? 'col-span-2 aspect-[4/3] md:aspect-[16/9]' : 'aspect-[3/4] md:aspect-[4/5]'}`}
          >
            <Image
              src={image.image_url}
              alt={localize(image.caption_vi, image.caption_en, locale)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes={index === 0 ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 50vw'}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={localize(openImage.caption_vi, openImage.caption_en, locale)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17120e]/95 p-4"
          onClick={(event) => { if (event.target === event.currentTarget) setOpenId(null); }}
        >
          <div className="relative aspect-video w-full max-w-4xl">
            <Image
              src={openImage.image_url}
              alt={localize(openImage.caption_vi, openImage.caption_en, locale)}
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-contain"
            />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpenId(null)}
            aria-label={locale === 'vi' ? 'Đóng ảnh' : 'Close image'}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/70 text-2xl text-white hover:bg-white/15"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
