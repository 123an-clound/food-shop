export type Category = {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  description_vi: string;
  description_en: string;
  display_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
};

export type RestaurantInfo = {
  id: number;
  name_vi: string;
  name_en: string;
  tagline_vi: string;
  tagline_en: string;
  description_vi: string;
  description_en: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  map_embed_url: string;
  facebook_url: string;
  instagram_url: string;
  logo_url: string;
  hero_image_url: string;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption_vi: string;
  caption_en: string;
  display_order: number;
};
