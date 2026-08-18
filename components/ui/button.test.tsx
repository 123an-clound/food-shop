import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders its children and responds to click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Lưu</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the destructive variant class', () => {
    render(<Button variant="destructive">Xoá</Button>);
    expect(screen.getByRole('button', { name: 'Xoá' }).className).toContain('bg-destructive');
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Đang lưu</Button>);
    expect(screen.getByRole('button', { name: 'Đang lưu' })).toBeDisabled();
  });
});
