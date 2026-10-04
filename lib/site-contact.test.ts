import { describe, expect, it } from 'vitest';
import { publicBrandName, publicContact } from './site-contact';
import type { RestaurantInfo } from './types';

const info = {
  id: 1, name_vi: 'Hương Việt', name_en: 'Huong Viet', tagline_vi: '', tagline_en: '',
  description_vi: '', description_en: '', address: '15 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  phone: '028 3822 9999', email: 'contact@huongvietrestaurant.vn',
  opening_hours: '11:00 – 14:00 (trưa) và 17:30 – 22:30 (tối), tất cả các ngày trong tuần',
  map_embed_url: '', facebook_url: 'https://facebook.com/huongvietrestaurant',
  instagram_url: 'https://instagram.com/huongvietrestaurant', logo_url: '', hero_image_url: '',
} satisfies RestaurantInfo;

describe('publicContact', () => {
  it('hides original demo contact values', () => {
    expect(Object.values(publicContact(info)).every((value) => value === '')).toBe(true);
  });

  it('shows updated contact values', () => {
    expect(publicContact({ ...info, phone: '090 000 0000' }).phone).toBe('090 000 0000');
  });
});

describe('publicBrandName', () => {
  it('replaces the former demo English name on public pages', () => {
    expect(publicBrandName({ ...info, name_en: 'Huong Viet Fine Dining' }, 'en')).toBe('Huong Viet Wedding & Events');
  });

  it('uses the updated name from admin', () => {
    expect(publicBrandName({ ...info, name_en: 'Lễ Việt' }, 'en')).toBe('Lễ Việt');
  });
});
