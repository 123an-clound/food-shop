import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  it('opens its content when the trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Mở</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Tiêu đề')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Mở'));
    expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
  });
});
