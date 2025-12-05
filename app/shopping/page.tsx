'use client';

import { useState, useMemo } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';

export default function ShoppingPage() {
  const { items, updateItem } = useGroceryItems();
  const [selectedStore, setSelectedStore] = useState<string>('all');

  // Get shopping items (pending and purchased)
  const shoppingItems = items.filter(item =>
    item.status === 'pending' || item.status === 'purchased'
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
  const filteredItems = selectedStore === 'all'
    ? shoppingItems
    : shoppingItems.filter(item => item.stores.includes(selectedStore));

  // Handle toggling item status
  const handleToggleStatus = (itemId: string, currentStatus: 'pending' | 'purchased') => {
    if (currentStatus === 'pending') {
      updateItem(itemId, { status: 'purchased' });
    } else {
      updateItem(itemId, { status: 'pending' });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Shopping Mode
            </h2>
            <p className="text-gray-600 mb-6">
              Check off items as you shop
            </p>

            {/* Store Filter Dropdown */}
            <div className="mb-6">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No items to shop for
                  </h3>
                  <p className="text-gray-600">
                    {selectedStore === 'all'
                      ? 'Go to Planning to add items to your shopping list'
                      : `No items for ${selectedStore}`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredItems.map((item) => {
                    const isPurchased = item.status === 'purchased';
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                          isPurchased ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Item Info - Keep on single line */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <h3 className={`font-medium truncate ${
                              isPurchased ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </h3>
                            <span className="text-gray-500 whitespace-nowrap">
                              {item.quantity} {item.unit}
                            </span>
                            {item.aisle && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500 whitespace-nowrap">
                                  Aisle {item.aisle}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Shopping Cart or Dollar Sign Button */}
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status as 'pending' | 'purchased')}
                          className={`ml-4 flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0 ${
                            isPurchased
                              ? 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400'
                              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                          }`}
                          aria-label={isPurchased ? 'Mark as pending (undo)' : 'Mark as purchased'}
                        >
                          {isPurchased ? (
                            // Dollar Sign Icon
                            <svg
                              className="w-5 h-5 text-gray-600"
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
                    );
                  })}
                </div>
              )}
            </div>

            {/* Item Count */}
            {filteredItems.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
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
