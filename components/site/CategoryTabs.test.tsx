import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Category, MenuItem } from '@/lib/types';
import { CategoryTabs } from './CategoryTabs';

const categories: Category[] = [
  {
    id: 'c1',
    name_vi: 'Khai vị',
    name_en: 'Appetizers',
    slug: 'khai-vi',
    description_vi: '',
    description_en: '',
    display_order: 1,
  },
  {
    id: 'c2',
    name_vi: 'Súp',
    name_en: 'Soups',
    slug: 'sup',
    description_vi: '',
    description_en: '',
    display_order: 2,
  },
];

const items: MenuItem[] = [
  {
    id: 'i1',
    category_id: 'c1',
    name_vi: 'Gỏi cuốn',
    name_en: 'Spring Rolls',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: 'https://picsum.photos/seed/i1/800/600',
    is_available: true,
    is_featured: false,
    display_order: 1,
  },
  {
    id: 'i2',
    category_id: 'c2',
    name_vi: 'Súp măng cua',
    name_en: 'Crab Soup',
    description_vi: '',
    description_en: '',
    price: 165000,
    image_url: 'https://picsum.photos/seed/i2/800/600',
    is_available: true,
    is_featured: false,
    display_order: 1,
  },
];

describe('CategoryTabs', () => {
  it('shows items from the first category by default', () => {
    render(<CategoryTabs categories={categories} items={items} locale="vi" />);
    expect(screen.getByText('Gỏi cuốn')).toBeInTheDocument();
    expect(screen.queryByText('Súp măng cua')).not.toBeInTheDocument();
  });

  it('switches to the selected category when its tab is clicked', () => {
    render(<CategoryTabs categories={categories} items={items} locale="vi" />);
    fireEvent.click(screen.getByText('Súp'));
    expect(screen.getByText('Súp măng cua')).toBeInTheDocument();
    expect(screen.queryByText('Gỏi cuốn')).not.toBeInTheDocument();
  });
});
