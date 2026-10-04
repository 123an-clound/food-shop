import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestimonialManager } from './TestimonialManager';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/app/actions/testimonials', () => ({ saveTestimonial: vi.fn(), deleteTestimonial: vi.fn() }));

describe('TestimonialManager', () => {
  it('explains the empty state and opens a hidden draft form', () => {
    render(<TestimonialManager testimonials={[]} />);
    expect(screen.getByText(/Mục đánh giá sẽ xuất hiện/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm đánh giá' }));
    expect(screen.getByRole('heading', { name: 'Đánh giá mới' })).toBeInTheDocument();
    expect(screen.getByLabelText('Hiển thị công khai')).not.toBeChecked();
  });
});
