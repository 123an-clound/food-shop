export type EventPackage = {
  id: string;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  image_url: string;
  starting_price: number | null;
  inclusions_vi: string[];
  inclusions_en: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
};

export type EventInquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: 'wedding' | 'corporate' | 'private' | 'other';
  event_date: string;
  guests: number;
  budget: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'confirmed' | 'closed';
  staff_note: string;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  event_label: string;
  quote_vi: string;
  quote_en: string;
  rating: number;
  is_published: boolean;
  display_order: number;
};

// Editorial examples until a venue publishes its own confirmed packages.
export const samplePackages: EventPackage[] = [
  {
    id: 'sample-wedding', name_vi: 'Tiệc cưới trọn vẹn', name_en: 'Wedding celebration',
    description_vi: 'Một hành trình được thiết kế từ nghi lễ, không gian đến bữa tiệc, theo câu chuyện của hai bạn.',
    description_en: 'A celebration shaped around your story, from ceremony to dining.',
    image_url: '/images/wedding-ceremony.png', starting_price: null,
    inclusions_vi: ['Tư vấn chủ đề và bố cục tiệc', 'Gợi ý thực đơn món Việt', 'Điều phối chương trình'],
    inclusions_en: ['Concept and layout consultation', 'Vietnamese menu suggestions', 'Event coordination'],
    is_featured: true, is_active: true, display_order: 1,
  },
  {
    id: 'sample-corporate', name_vi: 'Sự kiện doanh nghiệp', name_en: 'Corporate occasions',
    description_vi: 'Không gian chỉn chu cho hội nghị, tri ân khách hàng và những buổi tiệc kết nối.',
    description_en: 'A considered setting for conferences, appreciation events and gatherings.',
    image_url: '/images/event-gala.png', starting_price: null,
    inclusions_vi: ['Bố trí không gian linh hoạt', 'Gợi ý tiệc theo quy mô', 'Hỗ trợ kịch bản sự kiện'],
    inclusions_en: ['Flexible space planning', 'Menus for your group', 'Event run-of-show support'],
    is_featured: false, is_active: true, display_order: 2,
  },
  {
    id: 'sample-private', name_vi: 'Tiệc riêng & kỷ niệm', name_en: 'Private celebrations',
    description_vi: 'Dành chỗ cho sinh nhật, lễ kỷ niệm và những cuộc sum họp đáng nhớ bên người thân.',
    description_en: 'For birthdays, anniversaries and the moments shared with your people.',
    image_url: '/images/table-setting.jpg', starting_price: null,
    inclusions_vi: ['Tư vấn phong cách bàn tiệc', 'Thực đơn phù hợp dịp gặp gỡ', 'Không gian riêng theo nhu cầu'],
    inclusions_en: ['Table styling consultation', 'Occasion-ready menus', 'Private-space options'],
    is_featured: false, is_active: true, display_order: 3,
  },
];

export const eventTypes = [
  { value: 'wedding', vi: 'Tiệc cưới', en: 'Wedding' },
  { value: 'corporate', vi: 'Sự kiện doanh nghiệp', en: 'Corporate event' },
  { value: 'private', vi: 'Tiệc riêng / kỷ niệm', en: 'Private celebration' },
  { value: 'other', vi: 'Nhu cầu khác', en: 'Other event' },
] as const;
