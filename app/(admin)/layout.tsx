import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin/Sidebar';
import { Toaster } from '@/components/ui/sonner';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  let isAuthenticated = false;
  let isAdmin = false;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;

    if (isAuthenticated) {
      const { data } = await supabase.rpc('is_admin');
      isAdmin = data === true;
    }
  } catch {
    // A genuine infrastructure failure (network error, Supabase outage)
    // leaves isAuthenticated/isAdmin at their fail-closed defaults (false) —
    // the redirect below then sends the visitor to the login page exactly
    // as it would for "not logged in". Deliberately outside this try block:
    // redirect() itself works by throwing a special Next.js control-flow
    // signal, and putting the redirect() calls inside here would mean this
    // catch swallows that signal instead of letting Next.js's router handle
    // it.
  }

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  if (!isAdmin) {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <Toaster />
    </div>
  );
}
