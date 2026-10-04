import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialsSection } from './TestimonialsSection';

const testimonial = {
  id: 'one', customer_name: 'Nguyễn An', event_label: 'Tiệc cưới',
  quote_vi: 'Buổi tiệc được tổ chức chu đáo và gia đình rất hài lòng.',
  quote_en: 'A thoughtful celebration that our family truly enjoyed.',
  rating: 5, is_published: true, display_order: 1,
};

describe('TestimonialsSection', () => {
  it('does not suggest customer feedback exists before content is published', () => {
    const { container } = render(<TestimonialsSection testimonials={[]} vi />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a published review with its attribution in Vietnamese', () => {
    render(<TestimonialsSection testimonials={[testimonial]} vi />);
    expect(screen.getByRole('heading', { name: 'Những khoảnh khắc được chia sẻ' })).toBeInTheDocument();
    expect(screen.getByText(testimonial.quote_vi, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Nguyễn An')).toBeInTheDocument();
  });
});
