'use client';

import { useState, type ReactNode } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  const [localItems, setLocalItems] = useState(items);
  const [prevItems, setPrevItems] = useState(items);

  // Adjusting state during render (not in an effect) when the `items` prop
  // changes — this is React's documented pattern for resetting derived
  // state without an extra render/effect round-trip.
  if (items !== prevItems) {
    setPrevItems(items);
    setLocalItems(items);
  }

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        const next = move(localItems, event);
        setLocalItems(next);
        onReorder(next.map((item) => item.id));
      }}
    >
      <ul className="space-y-2">
        {localItems.map((item, index) => (
          <SortableRow key={item.id} id={item.id} index={index}>
            {renderItem(item, index)}
          </SortableRow>
        ))}
      </ul>
    </DragDropProvider>
  );
}

function SortableRow({ id, index, children }: { id: string; index: number; children: ReactNode }) {
  const { ref, isDragging } = useSortable({ id, index });

  return (
    <li ref={ref} className={isDragging ? 'opacity-50' : undefined}>
      {children}
    </li>
  );
}
