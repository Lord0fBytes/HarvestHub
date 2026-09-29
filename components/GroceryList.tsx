'use client';

import { useState, useRef, useEffect } from 'react';
import { GroceryItem } from '@/types/grocery';

interface GroceryListProps {
  items: GroceryItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: GroceryItem['status']) => void;
  selectedItems?: Set<string>;
  onToggleSelection?: (id: string) => void;
  bulkMode?: boolean;
}

export function GroceryList({
  items,
  onEdit,
  onDelete,
  onStatusChange,
  selectedItems,
  onToggleSelection,
  bulkMode = false
}: GroceryListProps) {
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  useEffect(() => {
    // Detect if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, itemId: string) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchCurrentX.current;

    // Only allow left swipe (positive diff)
    if (diff > 10) {
      setSwipedItemId(itemId);
    } else if (diff < -10) {
      setSwipedItemId(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, itemId: string) => {
    const diff = touchStartX.current - touchCurrentX.current;

    // If swiped more than 80px, keep it open, otherwise close
    if (diff > 80) {
      setSwipedItemId(itemId);
    } else {
      setSwipedItemId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--muted)]">
        <p className="text-lg">No items in your list yet.</p>
        <p className="text-sm mt-2">Add your first item to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isItemSwiped = swipedItemId === item.id;
        return (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-2xl border border-[var(--separator)] bg-[var(--surface)]"
          >
            {/* Action buttons revealed on swipe (mobile only) */}
            {isTouchDevice && (
              <div className="absolute right-0 top-0 bottom-0 flex w-1/2 bg-[var(--surface-hover)]">
                <button
                  onClick={() => {
                    onEdit(item.id);
                    setSwipedItemId(null);
                  }}
                  className="flex h-full w-1/2 items-center justify-center bg-[var(--action)] font-medium text-[var(--on-action)]"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(item.id);
                    setSwipedItemId(null);
                  }}
                  className="flex h-full w-1/2 items-center justify-center bg-[#7f3b32] font-medium text-[var(--foreground)]"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Main content that slides */}
            <div
              className={`flex items-start gap-3 bg-[var(--surface)] px-4 py-3 transition-transform duration-200 ease-out ${
                isItemSwiped ? '-translate-x-40' : 'translate-x-0'
              }`}
              onTouchStart={(e) => handleTouchStart(e, item.id)}
              onTouchMove={(e) => handleTouchMove(e, item.id)}
              onTouchEnd={(e) => handleTouchEnd(e, item.id)}
            >
            {bulkMode && onToggleSelection && (
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  checked={selectedItems?.has(item.id) || false}
                  onChange={() => onToggleSelection(item.id)}
                  className="h-5 w-5 rounded border-[var(--separator)] accent-[var(--action)]"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {/* Item name with action buttons */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="flex-1 break-words text-lg font-semibold text-[var(--foreground)]">
                  {item.name}
                </h3>
                {/* Desktop-only buttons */}
                {!isTouchDevice && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEdit(item.id)}
                      className="hh-focus flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--separator)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                      aria-label={`Edit ${item.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 3.487 3.651 3.651M4 20l4.586-1.414L19.75 7.422a2.582 2.582 0 0 0-3.651-3.651L4.935 14.935 4 20Z" /></svg>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="hh-focus flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--separator)] text-[var(--muted)] hover:bg-[#7f3b32] hover:text-[var(--foreground)]"
                      aria-label={`Delete ${item.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18m-14 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6m-6 4v6m4-6v6M9 6l1-3h4l1 3" /></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <p className="mb-2 text-sm font-medium text-[var(--muted)]">
                {item.quantity} {item.unit}
                {item.aisle && <span className="ml-2 text-[var(--subtle)]">• {item.aisle}</span>}
              </p>

              {/* Status, Type, Tags, and Stores on one line */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    item.status === 'purchased'
                      ? 'bg-[var(--brand)] text-[var(--background)]'
                      : item.status === 'skipped'
                      ? 'bg-[var(--subtle)] text-[var(--background)]'
                      : item.status === 'pending'
                      ? 'bg-[var(--action)] text-[var(--on-action)]'
                      : 'bg-[var(--separator)] text-[var(--muted)]'
                  }`}
                >
                  {item.status ?? 'none'}
                </span>
                <span className="inline-flex items-center rounded border border-[var(--separator)] bg-[var(--background)] px-2 py-0.5 text-xs font-medium whitespace-nowrap text-[var(--muted)]">
                  {item.type}
                </span>
                {item.stores.length > 0 && (
                  <>
                    {item.stores.map((store) => (
                      <span
                        key={store}
                        className="inline-flex items-center rounded-full border border-[var(--separator)] bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)]"
                      >
                        {store}
                      </span>
                    ))}
                  </>
                )}
                {item.tags && item.tags.length > 0 && (
                  <>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-[var(--separator)] bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* Status dropdown */}
              <div>
                <select
                  value={item.status ?? ''}
                  onChange={(e) => onStatusChange(item.id, e.target.value === '' ? null : e.target.value as GroceryItem['status'])}
                  className="hh-field min-h-10 rounded-lg border px-2 text-sm"
                >
                  <option value="">None</option>
                  <option value="pending">Pending</option>
                  <option value="purchased">Purchased</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
            </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
