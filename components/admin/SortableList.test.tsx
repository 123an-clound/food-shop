import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortableList } from './SortableList';

describe('SortableList', () => {
  it('renders every item in the given order', () => {
    const items = [
      { id: '1', name: 'Khai vị' },
      { id: '2', name: 'Súp' },
      { id: '3', name: 'Tráng miệng' },
    ];
    render(
      <SortableList items={items} onReorder={vi.fn()} renderItem={(item) => <span>{item.name}</span>} />
    );
    const rendered = screen.getAllByRole('listitem').map((el) => el.textContent);
    expect(rendered).toEqual(['Khai vị', 'Súp', 'Tráng miệng']);
  });
});
