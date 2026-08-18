import { describe, it, expect } from 'vitest';
import { createFakeSupabase } from './test-helpers';
import {
  getCategories,
  getMenuItems,
  getFeaturedMenuItems,
  getRestaurantInfo,
  getGalleryImages,
} from './queries';

describe('getCategories', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', slug: 'khai-vi' }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getCategories(supabase)).resolves.toEqual(rows);
  });

  it('returns an empty array when data is null', async () => {
    const supabase = createFakeSupabase({ data: null, error: null });
    await expect(getCategories(supabase)).resolves.toEqual([]);
  });

  it('throws when the query returns an error', async () => {
    const supabase = createFakeSupabase({ data: null, error: new Error('db down') });
    await expect(getCategories(supabase)).rejects.toThrow('db down');
  });
});

describe('getMenuItems', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', name_vi: 'Phở' }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getMenuItems(supabase)).resolves.toEqual(rows);
  });
});

describe('getFeaturedMenuItems', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', is_featured: true }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getFeaturedMenuItems(supabase)).resolves.toEqual(rows);
  });
});

describe('getRestaurantInfo', () => {
  it('returns the single row', async () => {
    const row = { id: 1, name_vi: 'Hương Việt' };
    const supabase = createFakeSupabase({ data: row, error: null });
    await expect(getRestaurantInfo(supabase)).resolves.toEqual(row);
  });

  it('throws when the query returns an error', async () => {
    const supabase = createFakeSupabase({ data: null, error: new Error('not found') });
    await expect(getRestaurantInfo(supabase)).rejects.toThrow('not found');
  });
});

describe('getGalleryImages', () => {
  it('returns the rows from the query', async () => {
    const rows = [{ id: '1', image_url: 'x.jpg' }];
    const supabase = createFakeSupabase({ data: rows, error: null });
    await expect(getGalleryImages(supabase)).resolves.toEqual(rows);
  });
});
