'use client';

import { useState } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';

export default function PlanningPage() {
  const { items, updateItem } = useGroceryItems();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle increasing quantity
  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateItem(itemId, {
      quantity: currentQuantity + 1,
      status: 'pending'
    });
  };

  // Handle decreasing quantity
  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      // Set to 0 and remove from shopping list
      updateItem(itemId, {
        quantity: 0,
        status: null
      });
    } else {
      updateItem(itemId, {
        quantity: currentQuantity - 1
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-4 text-center md:text-left">
              Planning
            </h2>
            <p className="text-gray-400 mb-6 text-center md:text-left">
              Build your shopping list by adding items you need
            </p>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">
                    No items found
                  </h3>
                  <p className="text-gray-400">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Go to All Items to add items to your master list'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {filteredItems.map((item) => {
                    const hasQuantity = item.quantity > 0 && item.status === 'pending';

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-700 transition-colors"
                      >
                        {/* Item Name */}
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-100">
                            {item.name}
                          </h3>
                        </div>

                        {/* Quantity Controls */}
                        <div className="ml-4 flex items-center gap-2">
                          {hasQuantity ? (
                            <>
                              {/* Minus Button */}
                              <button
                                onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>

                              {/* Quantity Display */}
                              <span className="text-lg font-semibold text-gray-100 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>

                              {/* Plus Button */}
                              <button
                                onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-green-900 text-white hover:bg-green-800 active:bg-green-700 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            /* Plus Button Only (when quantity is 0 or status is null) */
                            <button
                              onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                              className="flex items-center justify-center w-10 h-10 rounded-full bg-green-900 text-white hover:bg-green-800 active:bg-green-700 transition-colors"
                              aria-label="Add to shopping list"
                            >
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          )}
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
                Showing {filteredItems.length} of {items.length} items
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
