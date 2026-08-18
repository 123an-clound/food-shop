import type { Locale } from './localize';

export const dictionaries = {
  vi: {
    nav: {
      home: 'Trang chủ',
      menu: 'Thực đơn',
      about: 'Giới thiệu',
      gallery: 'Không gian',
      contact: 'Liên hệ',
    },
    common: {
      viewMenuCta: 'Xem thực đơn',
      featuredDishesHeading: 'Món đặc trưng',
      soldOutBadge: 'Hết món',
      viewMoreGallery: 'Xem thêm không gian',
      openingHoursLabel: 'Giờ mở cửa',
      addressLabel: 'Địa chỉ',
      phoneLabel: 'Điện thoại',
      emailLabel: 'Email',
      ourStoryHeading: 'Câu chuyện của chúng tôi',
      ourSpaceHeading: 'Không gian nhà hàng',
      contactHeading: 'Liên hệ với chúng tôi',
      openMenuLabel: 'Mở menu điều hướng',
      closeMenuLabel: 'Đóng menu điều hướng',
    },
  },
  en: {
    nav: {
      home: 'Home',
      menu: 'Menu',
      about: 'About',
      gallery: 'Gallery',
      contact: 'Contact',
    },
    common: {
      viewMenuCta: 'View Menu',
      featuredDishesHeading: 'Signature Dishes',
      soldOutBadge: 'Sold Out',
      viewMoreGallery: 'See More of Our Space',
      openingHoursLabel: 'Opening Hours',
      addressLabel: 'Address',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      ourStoryHeading: 'Our Story',
      ourSpaceHeading: 'Our Space',
      contactHeading: 'Contact Us',
      openMenuLabel: 'Open navigation menu',
      closeMenuLabel: 'Close navigation menu',
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
