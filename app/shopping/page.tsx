'use client';

import { useState, useMemo } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';

export default function ShoppingPage() {
  const { items, updateItem } = useGroceryItems();
  const [selectedStore, setSelectedStore] = useState<string>('all');

  // Get shopping items (pending, purchased, and skipped)
  const shoppingItems = items.filter(item =>
    item.status === 'pending' || item.status === 'purchased' || item.status === 'skipped'
  );

  // Get unique stores from shopping items
  const stores = useMemo(() => {
    const storeSet = new Set<string>();
    shoppingItems.forEach(item => {
      item.stores.forEach(store => storeSet.add(store));
    });
    return Array.from(storeSet).sort();
  }, [shoppingItems]);

  // Filter items based on selected store
  const filteredItems = useMemo(() => {
    const filtered = selectedStore === 'all'
      ? shoppingItems
      : shoppingItems.filter(item => item.stores.includes(selectedStore));

    // Sort by aisle (items with aisle first, sorted numerically, then items without aisle)
    return filtered.sort((a, b) => {
      const aHasAisle = a.aisle !== null && a.aisle !== undefined && a.aisle !== '';
      const bHasAisle = b.aisle !== null && b.aisle !== undefined && b.aisle !== '';

      // Items without aisle go to the bottom
      if (!aHasAisle && bHasAisle) return 1;
      if (aHasAisle && !bHasAisle) return -1;

      // Both have aisles - sort numerically
      if (aHasAisle && bHasAisle && a.aisle && b.aisle) {
        // Convert to numbers for proper numeric sorting
        const aNum = typeof a.aisle === 'number' ? a.aisle : parseFloat(a.aisle);
        const bNum = typeof b.aisle === 'number' ? b.aisle : parseFloat(b.aisle);
        return aNum - bNum;
      }

      // Both don't have aisles - maintain original order
      return 0;
    });
  }, [selectedStore, shoppingItems]);

  // Handle toggling item status
  const handleToggleStatus = (itemId: string, currentStatus: 'pending' | 'purchased') => {
    if (currentStatus === 'pending') {
      updateItem(itemId, { status: 'purchased' });
    } else {
      updateItem(itemId, { status: 'pending' });
    }
  };

  // Handle skipping item
  const handleSkipItem = (itemId: string, currentStatus: 'pending' | 'purchased' | 'skipped') => {
    if (currentStatus === 'skipped') {
      updateItem(itemId, { status: 'pending' });
    } else {
      updateItem(itemId, { status: 'skipped' });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-4 text-center md:text-left">
              Shopping Mode
            </h2>
            <p className="text-gray-400 mb-6 text-center md:text-left">
              Check off items as you shop
            </p>

            {/* Store Filter Dropdown */}
            <div className="mb-6">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Stores ({shoppingItems.length} items)</option>
                {stores.map(store => {
                  const count = shoppingItems.filter(item => item.stores.includes(store)).length;
                  return (
                    <option key={store} value={store}>
                      {store} ({count} items)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Items List */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">
                    No items to shop for
                  </h3>
                  <p className="text-gray-400">
                    {selectedStore === 'all'
                      ? 'Go to Planning to add items to your shopping list'
                      : `No items for ${selectedStore}`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {filteredItems.map((item) => {
                    const isPurchased = item.status === 'purchased';
                    const isSkipped = item.status === 'skipped';
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 hover:bg-gray-700 transition-colors ${
                          isPurchased || isSkipped ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Item Info - Formatted in columns */}
                        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                          {/* Column 1: Item Name */}
                          <h3 className={`font-medium truncate ${
                            isPurchased ? 'text-gray-400 line-through' : isSkipped ? 'text-yellow-600 line-through' : 'text-gray-100'
                          }`}>
                            {item.name}
                          </h3>

                          {/* Column 2: Quantity */}
                          <span className="text-gray-400 whitespace-nowrap text-sm text-right min-w-[4rem]">
                            {item.quantity} {item.unit}
                          </span>

                          {/* Column 3: Aisle */}
                          <span className="text-gray-400 whitespace-nowrap text-sm text-right min-w-[4rem]">
                            {item.aisle ? `Aisle ${item.aisle}` : '—'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                          {/* Skip Button */}
                          <button
                            onClick={() => handleSkipItem(item.id, item.status as 'pending' | 'purchased' | 'skipped')}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                              isSkipped
                                ? 'bg-yellow-900 text-yellow-400 hover:bg-yellow-800 active:bg-yellow-700'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 active:bg-gray-500'
                            }`}
                            aria-label={isSkipped ? 'Unskip item' : 'Skip item'}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>

                          {/* Purchase Button */}
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status as 'pending' | 'purchased')}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                              isPurchased
                                ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500'
                                : 'bg-green-900 text-white hover:bg-green-800 active:bg-green-700'
                            }`}
                            aria-label={isPurchased ? 'Mark as pending (undo)' : 'Mark as purchased'}
                          >
                            {isPurchased ? (
                              // Dollar Sign Icon
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            ) : (
                              // Shopping Cart Icon
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Item Count */}
            {filteredItems.length > 0 && (
              <div className="mt-4 text-sm text-gray-400 text-center">
                {selectedStore === 'all'
                  ? `${filteredItems.length} items on your shopping list`
                  : `Showing ${filteredItems.length} items for ${selectedStore}`}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
