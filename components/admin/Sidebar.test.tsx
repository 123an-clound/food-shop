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
    expect(screen.getByText('Tổng quan')).toBeInTheDocument();
    expect(screen.getByText('Yêu cầu tư vấn')).toBeInTheDocument();
    expect(screen.getByText('Gói tiệc & sự kiện')).toBeInTheDocument();
    expect(screen.getByText('Đánh giá khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Món ăn')).toBeInTheDocument();
    expect(screen.getByText('Danh mục món')).toBeInTheDocument();
    expect(screen.getByText('Thông tin liên hệ')).toBeInTheDocument();
    expect(screen.getByText('Thư viện ảnh')).toBeInTheDocument();
  });

  it('marks the current route as active', () => {
    render(<Sidebar />);
    expect(screen.getByText('Món ăn')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Tổng quan')).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the mobile admin navigation', () => {
    render(<Sidebar />);
    const toggle = screen.getByRole('button', { name: 'Mở menu quản trị' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Đóng menu quản trị' })).toHaveAttribute('aria-expanded', 'true');
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
