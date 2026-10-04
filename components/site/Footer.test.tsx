import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import type { RestaurantInfo } from '@/lib/types';
import { Footer } from './Footer';
import { BookingProvider } from './BookingDialog';

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
  it('renders the Vietnamese name without publishing demo contact details', () => {
    render(
      <LanguageProvider initialLocale="vi">
        <BookingProvider><Footer restaurantInfo={restaurantInfo} /></BookingProvider>
      </LanguageProvider>
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Hương Việt');
    expect(screen.getByRole('contentinfo')).toHaveTextContent(restaurantInfo.address);
    expect(screen.queryByRole('link', { name: restaurantInfo.phone })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nhận tư vấn tiệc/ })).toBeInTheDocument();
  });

  it('shows a confirmed phone number as a callable link', () => {
    render(<LanguageProvider initialLocale="vi"><BookingProvider><Footer restaurantInfo={{ ...restaurantInfo, phone: '090 000 0000' }} /></BookingProvider></LanguageProvider>);
    expect(screen.getByRole('link', { name: '090 000 0000' })).toHaveAttribute('href', 'tel:0900000000');
  });

  it('renders the English name when locale is en', () => {
    render(
      <LanguageProvider initialLocale="en">
        <BookingProvider><Footer restaurantInfo={restaurantInfo} /></BookingProvider>
      </LanguageProvider>
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Huong Viet Wedding & Events');
  });
});
