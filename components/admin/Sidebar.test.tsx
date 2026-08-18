import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from './Sidebar';

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/menu-items',
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({ auth: { signOut: signOutMock } }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    signOutMock.mockReset().mockResolvedValue({ error: null });
  });

  it('renders every nav item', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Món ăn')).toBeInTheDocument();
    expect(screen.getByText('Danh mục')).toBeInTheDocument();
    expect(screen.getByText('Thông tin nhà hàng')).toBeInTheDocument();
    expect(screen.getByText('Thư viện ảnh')).toBeInTheDocument();
  });

  it('marks the current route as active', () => {
    render(<Sidebar />);
    expect(screen.getByText('Món ăn').className).toContain('bg-accent');
    expect(screen.getByText('Dashboard').className).not.toContain('bg-accent');
  });

  it('signs out and redirects to the login page on logout', async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText('Đăng xuất'));
    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
    });
    expect(pushMock).toHaveBeenCalledWith('/admin/login');
    expect(refreshMock).toHaveBeenCalled();
  });
});
