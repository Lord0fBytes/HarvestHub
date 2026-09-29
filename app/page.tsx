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
  const [selectedTag, setSelectedTag] = useState('all');
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

    if (selectedTag !== 'all') {
      filtered = filtered.filter(item => item.tags?.includes(selectedTag));
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
  }, [items, searchQuery, selectedTag, selectedType]);

  const tags = useMemo(() => Array.from(
    new Set(items.flatMap((item) => item.tags ?? [])),
  ).sort((a, b) => a.localeCompare(b)), [items]);

  // Add an item to the shopping list without changing its saved quantity.
  const handleAddToShoppingList = (itemId: string) => {
    updateItem(itemId, {
      status: 'pending',
    });
  };

  const handleRemoveFromShoppingList = (itemId: string) => {
    updateItem(itemId, {
      status: null,
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
  const cartCount = items.filter((item) => item.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-5">
          {/* Header */}
          <section>
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="text-left">
                <h2 className="text-left text-xs font-bold uppercase tracking-[0.16em] text-[var(--action)]">
                  Plan your shop
                </h2>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <span className="rounded-full border border-[var(--separator)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--muted)]">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
                </span>
                <button
                  onClick={handleOpenNewItemModal}
                  className="hh-action hh-focus inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors active:bg-[#c85e2e]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New item
                </button>
              </div>
            </div>
            <p className="mb-4 text-[var(--muted)] md:text-lg">
              {cartCount > 0 ? `${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your cart` : 'Add items when you are ready to shop.'}
            </p>

            {/* Search and type filter */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hh-field min-h-12 w-full rounded-xl border px-4 py-3 pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--subtle)]"
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
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
              <div className="min-w-0 sm:w-48">
                <label htmlFor="type-filter" className="sr-only">
                  Filter by item type
                </label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value as ItemType | 'all')}
                  className="hh-field min-h-12 w-full rounded-xl border px-3"
                >
                  <option value="all">All Types</option>
                  <option value="grocery">Grocery</option>
                  <option value="supply">Supply</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="min-w-0 sm:w-48">
                <label htmlFor="tag-filter" className="sr-only">
                  Filter by list
                </label>
                <select
                  id="tag-filter"
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                  className="hh-field min-h-12 w-full rounded-xl border px-3"
                >
                  <option value="all">All Lists</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              </div>
            </div>

            {/* Items List */}
            <div className="overflow-hidden rounded-2xl border border-[var(--separator)] bg-[var(--surface)]">
              {filteredItems.length === 0 ? (
                <div className="p-10 text-center">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 text-[var(--subtle)]"
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
                  <h3 className="mb-2 text-lg font-medium text-[var(--foreground)]">
                    No items found
                  </h3>
                  <p className="text-[var(--muted)]">
                    {searchQuery || selectedType !== 'all' || selectedTag !== 'all'
                      ? 'Try a different search term, type, or list'
                      : 'Go to All Items to add items to your master list'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="divide-y divide-[var(--separator)]">
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
                          <div className="absolute right-0 top-0 bottom-0 flex w-1/4 bg-[var(--surface-hover)]">
                            <button
                              onClick={() => handleOpenEditModal(item.id)}
                              className="h-full w-full bg-[var(--action)] font-medium text-[var(--on-action)]"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        {/* Main content that slides */}
                        <div
                          className={`bg-[var(--surface)] px-4 py-3 transition-all duration-200 ease-out hover:bg-[var(--surface-hover)] ${
                            isItemSwiped ? '-translate-x-[25%]' : 'translate-x-0'
                          }`}
                          onTouchStart={(e) => handleTouchStart(e, item.id)}
                          onTouchMove={(e) => handleTouchMove(e, item.id)}
                          onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                        >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:gap-3">
                          {/* Item Name */}
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-[var(--foreground)]">
                              {item.name}
                            </h3>
                            {item.stores.length > 0 && (
                              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                                {item.stores.length > 0 && (
                                  <span className="min-w-0 max-w-full truncate text-sm text-[var(--muted)]" aria-label={`Stores: ${item.stores.join(', ')}`}>
                                    {item.stores[0]}{item.stores.length > 1 ? ` +${item.stores.length - 1}` : ''}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex min-w-0 items-center gap-4 sm:contents">
                          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                            {item.tags?.map((tag) => (
                              <span key={`tag-${tag}`} className="truncate rounded-full border border-[var(--separator)] bg-[var(--background)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex w-11 shrink-0 justify-end">
                            <button
                              onClick={() => isAddedToShoppingList
                                ? handleRemoveFromShoppingList(item.id)
                                : handleAddToShoppingList(item.id)}
                              className={`hh-focus flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                                isAddedToShoppingList
                                  ? 'bg-[var(--separator)] text-[var(--foreground)] hover:bg-[var(--subtle)] hover:text-[var(--background)]'
                                  : 'hh-action active:bg-[#c85e2e]'
                              }`}
                              aria-label={isAddedToShoppingList ? `Remove ${item.name} from the shopping list` : `Add ${item.name} to the shopping list`}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAddedToShoppingList ? 'M5 12h14' : 'M12 4v16m8-8H4'} />
                              </svg>
                            </button>
                          </div>
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
              <div className="mt-4 text-center text-sm text-[var(--muted)]">
                Showing {filteredItems.length} of {items.length} items
              </div>
            )}
          </section>
        </div>
      </div>

      <button
        onClick={handleOpenNewItemModal}
        className="hh-action hh-focus fixed right-3 top-2 z-[60] inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors active:bg-[#c85e2e] md:hidden"
        aria-label="Create a new catalog item and add it to the shopping list"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New item
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
