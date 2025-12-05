'use client';

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
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            {bulkMode && onToggleSelection && (
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  checked={selectedItems?.has(item.id) || false}
                  onChange={() => onToggleSelection(item.id)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {item.name}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    item.status === 'purchased'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'skipped'
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.status === 'pending'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.status ?? 'none'}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
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
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {item.quantity} {item.unit}
              </p>
              {(item.stores.length > 0 || item.aisle) && (
                <div className="flex flex-wrap items-center gap-1 mt-1">
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
                  {item.stores.length > 0 && item.aisle && (
                    <span className="text-gray-400 text-xs">•</span>
                  )}
                  {item.aisle && (
                    <span className="text-sm text-gray-500">{item.aisle}</span>
                  )}
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={item.status ?? ''}
                onChange={(e) => onStatusChange(item.id, e.target.value === '' ? null : e.target.value as GroceryItem['status'])}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">None</option>
                <option value="pending">Pending</option>
                <option value="purchased">Purchased</option>
                <option value="skipped">Skipped</option>
              </select>
              <button
                onClick={() => onEdit(item.id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
