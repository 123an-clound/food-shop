import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

describe('ConfirmDeleteDialog', () => {
  it('does not render its content when closed', () => {
    render(<ConfirmDeleteDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} itemName="Phở bò" />);
    expect(screen.queryByText('Xoá "Phở bò"?')).not.toBeInTheDocument();
  });

  it('shows the item name and calls onConfirm when confirmed', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteDialog open={true} onOpenChange={vi.fn()} onConfirm={onConfirm} itemName="Phở bò" />);
    expect(screen.getByText('Xoá "Phở bò"?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when Huỷ is clicked', () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDeleteDialog open={true} onOpenChange={onOpenChange} onConfirm={vi.fn()} itemName="Phở bò" />);
    fireEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
