import { describe, it, expect } from 'vitest';

describe('vitest harness', () => {
  it('runs in the test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
