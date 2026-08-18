import '@testing-library/jest-dom/vitest';

// jsdom does not implement ResizeObserver, but @dnd-kit/dom (used by
// SortableList) registers one on mount to track element size for drag
// sensors. A no-op stub is enough since this test env never actually
// resizes anything.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
