export function resolveAdminRedirect(
  pathname: string,
  isAuthenticated: boolean,
  isAdmin: boolean
): string | null {
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return isAuthenticated && isAdmin ? '/admin' : null;
  }

  if (!pathname.startsWith('/admin')) {
    return null;
  }

  if (!isAuthenticated) {
    return '/admin/login';
  }

  if (!isAdmin) {
    return '/admin/login?error=unauthorized';
  }

  return null;
}
