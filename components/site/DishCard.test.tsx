import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { MenuItem } from '@/lib/types';
import { DishCard } from './DishCard';

const item: MenuItem = {
  id: '1',
  category_id: 'c1',
  name_vi: 'Phở bò Wagyu',
  name_en: 'Wagyu Beef Pho',
  description_vi: 'Phở nước dùng ninh 12 tiếng.',
  description_en: 'Broth simmered for 12 hours.',
  price: 285000,
  image_url: 'https://picsum.photos/seed/pho/800/600',
  is_available: true,
  is_featured: true,
  display_order: 1,
};

describe('DishCard', () => {
  it('renders the Vietnamese name, description, and formatted price by default', () => {
    render(<DishCard item={item} locale="vi" />);
    expect(screen.getByText('Phở bò Wagyu')).toBeInTheDocument();
    expect(screen.getByText('Phở nước dùng ninh 12 tiếng.')).toBeInTheDocument();
    expect(screen.getByText('285.000đ')).toBeInTheDocument();
  });

  it('renders the English name and description when locale is en', () => {
    render(<DishCard item={item} locale="en" />);
    expect(screen.getByText('Wagyu Beef Pho')).toBeInTheDocument();
    expect(screen.getByText('Broth simmered for 12 hours.')).toBeInTheDocument();
  });

  it('shows the sold-out badge when is_available is false', () => {
    render(<DishCard item={{ ...item, is_available: false }} locale="vi" />);
    expect(screen.getByText('Hết món')).toBeInTheDocument();
  });

  it('does not show the sold-out badge when the item is available', () => {
    render(<DishCard item={item} locale="vi" />);
    expect(screen.queryByText('Hết món')).not.toBeInTheDocument();
  });
});
