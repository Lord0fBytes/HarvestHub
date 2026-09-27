'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { Modal } from '@/components/Modal';
import { ItemForm } from '@/components/ItemForm';
import { CreateGroceryItemInput, ItemType } from '@/types/grocery';

export default function PlanningPage() {
  const { items, addItem, updateItem } = useGroceryItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  useEffect(() => {
    // Detect if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    // First filter by status (only show null and pending items)
    let filtered = items.filter(item =>
      item.status === null || item.status === 'pending'
    );

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(normalizedQuery)
      );
    }

    // Sort first by tag, then by name alphabetically
    return filtered.sort((a, b) => {
      const aHasTags = a.tags && a.tags.length > 0;
      const bHasTags = b.tags && b.tags.length > 0;

      // Items without tags go to the bottom
      if (!aHasTags && bHasTags) return 1;
      if (aHasTags && !bHasTags) return -1;

      // Both have tags - sort alphabetically by first tag, then by name
      if (aHasTags && bHasTags) {
        const tagComparison = a.tags[0].localeCompare(b.tags[0]);
        // If tags are the same, sort by name
        if (tagComparison === 0) {
          return a.name.localeCompare(b.name);
        }
        return tagComparison;
      }

      // Both don't have tags - sort by name
      return a.name.localeCompare(b.name);
    });
  }, [items, searchQuery, selectedType]);

  // Add an item to the shopping list without changing its saved quantity.
  const handleAddToShoppingList = (itemId: string) => {
    updateItem(itemId, {
      status: 'pending',
    });
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

  // Edit handlers
  const handleOpenEditModal = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
    setSwipedItemId(null);
  };

  const handleOpenNewItemModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleSubmitItem = async (input: CreateGroceryItemInput) => {
    if (editingId) {
      await updateItem(editingId, input);
      setEditingId(null);
      setIsModalOpen(false);
      return;
    }

    const newItem = await addItem({
      ...input,
      status: 'pending',
    });

    if (newItem) {
      setIsModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsModalOpen(false);
  };

  const editingItem = editingId ? items.find(item => item.id === editingId) : null;

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

            {/* Search and type filter */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
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
              <div className="sm:w-48">
                <label htmlFor="type-filter" className="sr-only">
                  Filter by item type
                </label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value as ItemType | 'all')}
                  className="min-h-11 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 text-gray-100 focus:border-transparent focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="grocery">Grocery</option>
                  <option value="supply">Supply</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other</option>
                </select>
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
                    {searchQuery || selectedType !== 'all'
                      ? 'Try a different search term or type'
                      : 'Go to All Items to add items to your master list'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Column Headers */}
                  <div className="px-4 py-3 bg-gray-800 border-b border-gray-600">
                    <div className="grid grid-cols-[2fr_1fr_auto] gap-3 items-center">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                        Item
                      </span>
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                        Tags
                      </span>
                      <span className="w-11 text-xs font-bold text-gray-300 uppercase tracking-wide text-right">
                        List
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-gray-700">
                  {filteredItems.map((item) => {
                    const isAddedToShoppingList = item.status === 'pending';
                    const isItemSwiped = swipedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden relative"
                      >
                        {/* Edit button revealed on swipe (mobile only) */}
                        {isTouchDevice && (
                          <div className="absolute right-0 top-0 bottom-0 flex bg-gray-700 w-1/4">
                            <button
                              onClick={() => handleOpenEditModal(item.id)}
                              className="h-full w-full bg-blue-600 text-white font-medium flex items-center justify-center"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        {/* Main content that slides */}
                        <div
                          className={`p-4 bg-gray-800 hover:bg-gray-700 transition-all duration-200 ease-out ${
                            isItemSwiped ? '-translate-x-[25%]' : 'translate-x-0'
                          }`}
                          onTouchStart={(e) => handleTouchStart(e, item.id)}
                          onTouchMove={(e) => handleTouchMove(e, item.id)}
                          onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                        >
                        <div className="grid grid-cols-[2fr_1fr_auto] gap-3 items-center">
                          {/* Item Name */}
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-white truncate">
                              {item.name}
                            </h3>
                            {item.stores.length > 0 && (
                              <div className="mt-1 flex min-w-0 items-center gap-1" aria-label={`Stores: ${item.stores.join(', ')}`}>
                                <span className="min-w-0 truncate rounded bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-200 whitespace-nowrap">
                                  {item.stores[0]}
                                </span>
                                {item.stores.length > 1 && (
                                  <span className="shrink-0 text-xs text-purple-200" aria-label={`${item.stores.length - 1} additional stores`}>
                                    +{item.stores.length - 1}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.tags && item.tags.length > 0 ? (
                              item.tags.map((tag) => (
                                <span
                                  key={`tag-${tag}`}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300 whitespace-nowrap"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : null}
                          </div>

                          <div className="flex justify-end w-11">
                            <button
                              onClick={() => handleAddToShoppingList(item.id)}
                              disabled={isAddedToShoppingList}
                              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                isAddedToShoppingList
                                  ? 'cursor-default bg-gray-700 text-gray-400'
                                  : 'bg-green-700 text-white hover:bg-green-600 active:bg-green-800'
                              }`}
                              aria-label={isAddedToShoppingList ? `${item.name} is already on the shopping list` : `Add ${item.name} to the shopping list`}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
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
                Showing {filteredItems.length} of {items.length} items
              </div>
            )}
          </section>
        </div>
      </div>

      <button
        onClick={handleOpenNewItemModal}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-colors hover:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 md:bottom-6 md:right-6"
        aria-label="Add a new item to the shopping list"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title={editingId ? 'Edit Item' : 'New Item'}
      >
        <ItemForm
          onSubmit={handleSubmitItem}
          onCancel={handleCancelEdit}
          initialData={editingItem || undefined}
          submitLabel={editingId ? 'Update Item' : 'Add to Shopping List'}
        />
      </Modal>
    </div>
  );
}
