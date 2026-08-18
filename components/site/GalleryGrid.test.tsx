import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { GalleryImage } from '@/lib/types';
import { GalleryGrid } from './GalleryGrid';

const images: GalleryImage[] = [
  {
    id: 'g1',
    image_url: 'https://picsum.photos/seed/g1/1200/900',
    caption_vi: 'Không gian chính',
    caption_en: 'Main dining area',
    display_order: 1,
  },
  {
    id: 'g2',
    image_url: 'https://picsum.photos/seed/g2/1200/900',
    caption_vi: 'Sân vườn',
    caption_en: 'Garden',
    display_order: 2,
  },
];

describe('GalleryGrid', () => {
  it('does not show the lightbox initially', () => {
    render(<GalleryGrid images={images} locale="vi" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the lightbox with the clicked image when a thumbnail is clicked', () => {
    render(<GalleryGrid images={images} locale="vi" />);
    fireEvent.click(screen.getByAltText('Sân vườn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByAltText('Sân vườn')).toHaveLength(2);
  });

  it('closes the lightbox when the close button is clicked', () => {
    render(<GalleryGrid images={images} locale="vi" />);
    fireEvent.click(screen.getByAltText('Không gian chính'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the lightbox when Escape key is pressed', async () => {
    render(<GalleryGrid images={images} locale="vi" />);
    fireEvent.click(screen.getByAltText('Không gian chính'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('moves focus to the close button when the lightbox opens', async () => {
    render(<GalleryGrid images={images} locale="vi" />);
    const thumbnail = screen.getByAltText('Sân vườn');
    fireEvent.click(thumbnail);
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveFocus();
    });
  });

  it('returns focus to the thumbnail when the lightbox closes', async () => {
    render(<GalleryGrid images={images} locale="vi" />);
    const image = screen.getByAltText('Không gian chính');
    const thumbnailButton = image.closest('button') as HTMLButtonElement;
    fireEvent.click(thumbnailButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    await waitFor(() => {
      expect(thumbnailButton).toHaveFocus();
    });
  });
});
