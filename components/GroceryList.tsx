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
      <div className="text-center py-12 text-gray-500">
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
            className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
          >
            {/* Action buttons revealed on swipe (mobile only) */}
            {isTouchDevice && (
              <div className="absolute right-0 top-0 bottom-0 flex bg-gray-700 w-1/2">
                <button
                  onClick={() => {
                    onEdit(item.id);
                    setSwipedItemId(null);
                  }}
                  className="h-full w-1/2 bg-blue-600 text-white font-medium flex items-center justify-center"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(item.id);
                    setSwipedItemId(null);
                  }}
                  className="h-full w-1/2 bg-red-600 text-white font-medium flex items-center justify-center"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Main content that slides */}
            <div
              className={`p-4 bg-gray-800 flex items-start gap-3 transition-transform duration-200 ease-out ${
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
                  className="w-5 h-5 text-green-600 border-gray-700 rounded focus:ring-green-500"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {/* Item name with action buttons */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white break-words flex-1">
                  {item.name}
                </h3>
                {/* Desktop-only buttons */}
                {!isTouchDevice && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEdit(item.id)}
                      className="text-xl hover:scale-110 transition-transform border border-gray-600 rounded px-2 py-1 hover:border-blue-500"
                      title="Edit item"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-xl hover:scale-110 transition-transform border border-gray-600 rounded px-2 py-1 hover:border-red-500"
                      title="Delete item"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <p className="text-sm text-gray-300 font-medium mb-2">
                {item.quantity} {item.unit}
                {item.aisle && <span className="text-gray-400 ml-2">• {item.aisle}</span>}
              </p>

              {/* Status, Type, Tags, and Stores on one line */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    item.status === 'purchased'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'skipped'
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.status === 'pending'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {item.status ?? 'none'}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    item.type === 'grocery'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.type === 'supply'
                      ? 'bg-orange-100 text-orange-700'
                      : item.type === 'clothing'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.type}
                </span>
                {item.stores.length > 0 && (
                  <>
                    {item.stores.map((store) => (
                      <span
                        key={store}
                        className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs"
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
                        className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
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
                  className="text-sm border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
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
