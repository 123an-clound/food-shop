import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import type { RestaurantInfo } from '@/lib/types';
import { Footer } from './Footer';

const restaurantInfo: RestaurantInfo = {
  id: 1,
  name_vi: 'Hương Việt',
  name_en: 'Huong Viet Fine Dining',
  tagline_vi: '',
  tagline_en: '',
  description_vi: '',
  description_en: '',
  address: '15 Đồng Khởi, Quận 1, TP. Hồ Chí Minh',
  phone: '028 3822 9999',
  email: 'contact@huongvietrestaurant.vn',
  opening_hours: '11:00 – 14:00 và 17:30 – 22:30',
  map_embed_url: '',
  facebook_url: '',
  instagram_url: '',
  logo_url: '',
  hero_image_url: '',
};

describe('Footer', () => {
  it('renders the Vietnamese name and contact details by default', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <Footer restaurantInfo={restaurantInfo} />
      </LanguageProvider>
    );
    expect(screen.getByText('Hương Việt')).toBeInTheDocument();
    expect(screen.getByText(restaurantInfo.address)).toBeInTheDocument();
    expect(screen.getByText(restaurantInfo.phone)).toBeInTheDocument();
  });

  it('renders the English name when locale is en', () => {
    render(
      <LanguageProvider initialLocale="en">
        <Footer restaurantInfo={restaurantInfo} />
      </LanguageProvider>
    );
    expect(screen.getByText('Huong Viet Fine Dining')).toBeInTheDocument();
  });
});
