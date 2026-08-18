import { describe, it, expect } from 'vitest';
import { resolveAdminRedirect } from './admin-guard';

describe('resolveAdminRedirect', () => {
  it('sends an unauthenticated visitor to /admin/login', () => {
    expect(resolveAdminRedirect('/admin', false, false)).toBe('/admin/login');
  });

  it('sends an authenticated non-admin to /admin/login with an error flag', () => {
    expect(resolveAdminRedirect('/admin', true, false)).toBe('/admin/login?error=unauthorized');
  });

  it('allows an authenticated admin through', () => {
    expect(resolveAdminRedirect('/admin', true, true)).toBeNull();
  });

  it('allows an unauthenticated visitor to see the login page', () => {
    expect(resolveAdminRedirect('/admin/login', false, false)).toBeNull();
  });

  it('redirects an already-authenticated admin away from the login page', () => {
    expect(resolveAdminRedirect('/admin/login', true, true)).toBe('/admin');
  });

  it('does not redirect an authenticated non-admin sitting on the login page', () => {
    expect(resolveAdminRedirect('/admin/login', true, false)).toBeNull();
  });

  it('is a no-op for paths outside /admin', () => {
    expect(resolveAdminRedirect('/menu', false, false)).toBeNull();
  });
});
