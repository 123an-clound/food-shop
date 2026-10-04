import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createPublicSupabaseClient } from './public';
import { getEventPackages, getFeaturedMenuItems, getGalleryImages, getRestaurantInfo, getTestimonials } from './queries';
import { samplePackages } from '@/lib/events/content';

// Public records are shared across requests and refreshed after admin edits.
const getCachedRestaurantInfo = unstable_cache(async () => {
  const supabase = createPublicSupabaseClient();
  return getRestaurantInfo(supabase);
}, ['public-restaurant-info'], { tags: ['restaurant-info'], revalidate: 300 });

export const getPublicRestaurantInfo = cache(getCachedRestaurantInfo);

export const getPublicHomeGallery = unstable_cache(async () => {
  const supabase = createPublicSupabaseClient();
  return getGalleryImages(supabase, 5);
}, ['public-home-gallery'], { tags: ['gallery-images'], revalidate: 300 });

export const getPublicEventPackages = unstable_cache(async () => {
  const packages = await getEventPackages(createPublicSupabaseClient());
  return packages.length ? packages : samplePackages;
}, ['public-event-packages'], { tags: ['event-packages'], revalidate: 300 });

export const getPublicFeaturedMenu = unstable_cache(async () => {
  return getFeaturedMenuItems(createPublicSupabaseClient(), 4);
}, ['public-featured-menu'], { tags: ['featured-menu'], revalidate: 300 });

export const getPublicTestimonials = unstable_cache(async () => {
  return getTestimonials(createPublicSupabaseClient());
}, ['public-testimonials'], { tags: ['testimonials'], revalidate: 300 });
