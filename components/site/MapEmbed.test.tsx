import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapEmbed } from './MapEmbed';

describe('MapEmbed', () => {
  it('renders an iframe with the given src and title', () => {
    render(<MapEmbed mapEmbedUrl="https://maps.example.com/embed" title="Hương Việt" />);
    const iframe = screen.getByTitle('Hương Việt');
    expect(iframe).toHaveAttribute('src', 'https://maps.example.com/embed');
  });

  it('renders nothing when mapEmbedUrl is empty', () => {
    const { container } = render(<MapEmbed mapEmbedUrl="" title="Hương Việt" />);
    expect(container).toBeEmptyDOMElement();
  });
});
