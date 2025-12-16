'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';

export default function ShoppingPage() {
  const { items, updateItem } = useGroceryItems();
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  useEffect(() => {
    // Detect if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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
  const filteredItems = useMemo(() => {
    const filtered = selectedStore === 'all'
      ? shoppingItems
      : shoppingItems.filter(item => item.stores.includes(selectedStore));

    // Sort by status first (pending before purchased), then by aisle, then alphabetically by name (case insensitive)
    return filtered.sort((a, b) => {
      // Priority 1: Status (pending before purchased)
      if (a.status === 'pending' && b.status === 'purchased') return -1;
      if (a.status === 'purchased' && b.status === 'pending') return 1;

      // Priority 2: Aisle presence
      const aHasAisle = a.aisle !== null && a.aisle !== undefined && a.aisle !== '';
      const bHasAisle = b.aisle !== null && b.aisle !== undefined && b.aisle !== '';

      // Items without aisle go to the bottom
      if (!aHasAisle && bHasAisle) return 1;
      if (aHasAisle && !bHasAisle) return -1;

      // Both have aisles - sort by aisle
      if (aHasAisle && bHasAisle && a.aisle && b.aisle) {
        // Check if aisle contains emoji (characters outside basic ASCII range)
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        const aHasEmoji = emojiRegex.test(a.aisle);
        const bHasEmoji = emojiRegex.test(b.aisle);

        // Try to parse as numbers
        const aNum = parseFloat(a.aisle);
        const bNum = parseFloat(b.aisle);
        const aIsNum = !isNaN(aNum);
        const bIsNum = !isNaN(bNum);

        // Both have emojis - sort alphabetically by aisle, then by name
        if (aHasEmoji && bHasEmoji) {
          const aisleCompare = a.aisle.toLowerCase().localeCompare(b.aisle.toLowerCase());
          if (aisleCompare !== 0) {
            return aisleCompare;
          }
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }

        // One has emoji, one doesn't - emoji first
        if (aHasEmoji && !bHasEmoji) return -1;
        if (!aHasEmoji && bHasEmoji) return 1;

        // Both are numbers - sort numerically
        if (aIsNum && bIsNum) {
          if (aNum !== bNum) {
            return aNum - bNum;
          }
          // Same aisle number - sort alphabetically by name
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }

        // Both are text - sort alphabetically by aisle, then by name
        if (!aIsNum && !bIsNum) {
          const aisleCompare = a.aisle.toLowerCase().localeCompare(b.aisle.toLowerCase());
          if (aisleCompare !== 0) {
            return aisleCompare;
          }
          // Same aisle text - sort alphabetically by name
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }

        // One is number, one is text - numbers first
        return aIsNum ? -1 : 1;
      }

      // Both don't have aisles - sort alphabetically by name (case insensitive)
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
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
  const handleSkipItem = (itemId: string) => {
    updateItem(itemId, { status: 'skipped' });
    setSwipedItemId(null);
  };

  // Touch handlers for swipe
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
                <>
                  {/* Column Headers */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-600">
                    <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                        Item
                      </span>
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide text-right min-w-[4rem]">
                        Qty
                      </span>
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide text-center min-w-[4rem]">
                        Aisle
                      </span>
                    </div>
                    {/* Spacer for action button */}
                    <div className="ml-4 w-10 flex-shrink-0"></div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-gray-700">
                    {filteredItems.map((item) => {
                    const isPurchased = item.status === 'purchased';
                    const isItemSwiped = swipedItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden relative"
                      >
                        {/* Skip button revealed on swipe (mobile only) - only for pending items */}
                        {isTouchDevice && !isPurchased && (
                          <div className="absolute right-0 top-0 bottom-0 flex bg-gray-700 w-1/4">
                            <button
                              onClick={() => handleSkipItem(item.id)}
                              className="h-full w-full bg-yellow-600 text-white font-medium flex items-center justify-center"
                            >
                              Skip
                            </button>
                          </div>
                        )}

                        {/* Main content that slides */}
                        <div
                          className={`relative flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 transition-all duration-200 ease-out ${
                            isPurchased ? 'opacity-60' : ''
                          } ${isItemSwiped ? '-translate-x-[25%]' : 'translate-x-0'}`}
                          onTouchStart={(e) => handleTouchStart(e, item.id)}
                          onTouchMove={(e) => handleTouchMove(e, item.id)}
                          onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                        >
                        {/* Item Info - Formatted in columns */}
                        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                          {/* Column 1: Item Name */}
                          <h3 className={`font-semibold text-base ${
                            isPurchased ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            {item.name}
                          </h3>

                          {/* Column 2: Quantity */}
                          <span className="text-gray-300 font-medium whitespace-nowrap text-sm text-right min-w-[4rem]">
                            {item.quantity} {item.unit}
                          </span>

                          {/* Column 3: Aisle */}
                          <span className="text-gray-300 font-semibold whitespace-nowrap text-sm text-center min-w-[4rem]">
                            {item.aisle ? item.aisle : '—'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-4 flex items-center gap-2 flex-shrink-0">
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
                    </div>
                  );
                })}
                  </div>
                </>
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
