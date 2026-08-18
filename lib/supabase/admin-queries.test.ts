import { describe, it, expect } from 'vitest';
import { createFakeSupabaseSequence } from './test-helpers';
import { getDashboardCounts } from './admin-queries';

describe('getDashboardCounts', () => {
  it('returns all four counts from the queries in order', async () => {
    const supabase = createFakeSupabaseSequence([
      { data: null, error: null, count: 30 },
      { data: null, error: null, count: 2 },
      { data: null, error: null, count: 7 },
      { data: null, error: null, count: 6 },
    ]);
    await expect(getDashboardCounts(supabase)).resolves.toEqual({
      menuItemCount: 30,
      unavailableMenuItemCount: 2,
      categoryCount: 7,
      galleryImageCount: 6,
    });
  });

  it('defaults a null count to 0', async () => {
    const supabase = createFakeSupabaseSequence([
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
    ]);
    await expect(getDashboardCounts(supabase)).resolves.toEqual({
      menuItemCount: 0,
      unavailableMenuItemCount: 0,
      categoryCount: 0,
      galleryImageCount: 0,
    });
  });

  it('throws when any of the four queries returns an error', async () => {
    const supabase = createFakeSupabaseSequence([
      { data: null, error: null, count: 30 },
      { data: null, error: new Error('db down'), count: null },
      { data: null, error: null, count: 7 },
      { data: null, error: null, count: 6 },
    ]);
    await expect(getDashboardCounts(supabase)).rejects.toThrow('db down');
  });
});
