import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';

describe('Table', () => {
  it('renders header and body rows', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Phở bò Wagyu</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Tên')).toBeInTheDocument();
    expect(screen.getByText('Phở bò Wagyu')).toBeInTheDocument();
  });
});
