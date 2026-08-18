import { createBrowserClient } from '@supabase/ssr';

// Next.js only inlines NEXT_PUBLIC_* vars into the client bundle when they're
// accessed as a literal `process.env.NEXT_PUBLIC_X` — a dynamic/computed key
// like `process.env[name]` is never replaced and evaluates to undefined in
// the browser, so these two vars must be read directly rather than through
// a shared `requireEnv(name)` helper.
function requireValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function createBrowserSupabaseClient() {
  const url = requireValue('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = requireValue(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return createBrowserClient(url, anonKey);
}
