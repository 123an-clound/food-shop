import type { SupabaseClient } from '@supabase/supabase-js';

import type { ActionResult } from '@/lib/actions/types';

/**
 * App-level authorization guard for Server Actions.
 *
 * Postgres RLS (`is_admin()` policies) is the ultimate authority on every
 * write, but a Server Action is a POST endpoint Next.js generates — it is
 * not gated by `middleware.ts` or the `(dashboard)` layout unless something
 * inside the action itself checks. This adds that check as a second,
 * app-level layer so a non-admin invocation fails with a clean message
 * instead of a raw Postgres/RLS error.
 *
 * Takes an already-created Supabase client (rather than creating its own)
 * so callers that also need the client for the actual mutation don't pay
 * for two separate server clients per request.
 */
export async function requireAdmin(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; result: ActionResult }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, result: { success: false, error: 'Bạn cần đăng nhập.' } };
  }

  const { data: isAdmin } = await supabase.rpc('is_admin');

  if (!isAdmin) {
    return {
      ok: false,
      result: { success: false, error: 'Bạn không có quyền thực hiện thao tác này.' },
    };
  }

  return { ok: true };
}
