import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('lets a later conflicting Tailwind class win over an earlier one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
