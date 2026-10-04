import type { RestaurantInfo } from '@/lib/types';
import { localize } from '@/lib/i18n/localize';

export function publicBrandName(info: RestaurantInfo, locale: 'vi' | 'en') {
  const englishName = info.name_en === 'Huong Viet Fine Dining'
    ? 'Huong Viet Wedding & Events'
    : info.name_en;
  return localize(info.name_vi, englishName, locale);
}

// Values from the original demo seed are placeholders, not verified venue details.
export function publicContact(info: RestaurantInfo) {
  return {
    address: info.address === '15 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh' ? '' : info.address,
    phone: info.phone === '028 3822 9999' ? '' : info.phone,
    email: info.email === 'contact@huongvietrestaurant.vn' ? '' : info.email,
    openingHours: info.opening_hours === '11:00 – 14:00 (trưa) và 17:30 – 22:30 (tối), tất cả các ngày trong tuần' ? '' : info.opening_hours,
    facebook: info.facebook_url === 'https://facebook.com/huongvietrestaurant' ? '' : info.facebook_url,
    instagram: info.instagram_url === 'https://instagram.com/huongvietrestaurant' ? '' : info.instagram_url,
  };
}
