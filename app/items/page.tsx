'use client';

import { useState, useMemo } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { GroceryList } from '@/components/GroceryList';
import { ItemForm } from '@/components/ItemForm';
import { Modal } from '@/components/Modal';
import { CreateGroceryItemInput, GroceryItem } from '@/types/grocery';

type SortOption = 'name' | 'type' | 'aisle' | 'dateAdded';

export default function Home() {
  const { items, addItem, updateItem, deleteItem } = useGroceryItems();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const editingItem = editingId ? items.find(item => item.id === editingId) : null;

  // Get all unique tags and stores from items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  const allStores = useMemo(() => {
    const storeSet = new Set<string>();
    items.forEach(item => {
      item.stores.forEach(store => storeSet.add(store));
    });
    return Array.from(storeSet).sort();
  }, [items]);

  // Calculate statistics
  const stats = useMemo(() => {
    const pending = items.filter(item => item.status === 'pending').length;
    const purchased = items.filter(item => item.status === 'purchased').length;
    const skipped = items.filter(item => item.status === 'skipped').length;
    return { pending, purchased, skipped, total: items.length };
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.stores.some(store => store.toLowerCase().includes(query)) ||
        item.aisle?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        selectedTags.some(tag => item.tags?.includes(tag))
      );
    }

    // Filter by store
    if (selectedStore) {
      filtered = filtered.filter(item => item.stores.includes(selectedStore));
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by status
    if (selectedStatus) {
      if (selectedStatus === 'null') {
        filtered = filtered.filter(item => item.status === null);
      } else {
        filtered = filtered.filter(item => item.status === selectedStatus);
      }
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'aisle':
          return (a.aisle || '').localeCompare(b.aisle || '');
        case 'dateAdded':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [items, selectedTags, selectedStore, selectedType, selectedStatus, searchQuery, sortBy]);

  const handleAddItem = async (input: CreateGroceryItemInput) => {
    await addItem(input);
    setIsModalOpen(false);
  };

  const loadSampleData = async () => {
    const sampleItems: CreateGroceryItemInput[] = [
      { name: 'Bananas', quantity: 3, unit: 'bunch', status: null, type: 'grocery', stores: ['Costco', 'BJ\'s'], aisle: 'Produce', tags: ['fruit', 'produce'] },
      { name: 'Milk', quantity: 1, unit: 'gallon', status: null, type: 'grocery', stores: ['Trader Joe\'s'], aisle: 'Dairy', tags: ['dairy', 'beverages'] },
      { name: 'Bread', quantity: 2, unit: 'loaf', status: 'purchased', type: 'grocery', stores: ['Trader Joe\'s', 'Costco'], aisle: 'Bakery', tags: ['bakery', 'grains'] },
      { name: 'Chicken Breast', quantity: 2, unit: 'lb', status: 'pending', type: 'grocery', stores: ['Costco'], aisle: 'Meat', tags: ['protein', 'meat'] },
      { name: 'Apples', quantity: 5, unit: 'count', status: null, type: 'grocery', stores: ['Costco', 'BJ\'s'], aisle: 'Produce', tags: ['fruit', 'produce'] },
      { name: 'Eggs', quantity: 2, unit: 'dozen', status: 'skipped', type: 'grocery', stores: ['Trader Joe\'s'], aisle: 'Dairy', tags: ['dairy', 'protein'] },
      { name: 'Greek Yogurt', quantity: 6, unit: 'count', status: 'pending', type: 'grocery', stores: ['Trader Joe\'s'], aisle: 'Dairy', tags: ['dairy', 'breakfast'] },
      { name: 'Baby Spinach', quantity: 1, unit: 'bag', status: null, type: 'grocery', stores: ['Costco', 'Trader Joe\'s'], aisle: 'Produce', tags: ['vegetables', 'produce'] },
      { name: 'Olive Oil', quantity: 1, unit: 'bottle', status: 'purchased', type: 'grocery', stores: ['Costco'], aisle: 'Aisle 12', tags: ['pantry', 'cooking'] },
      { name: 'Pasta', quantity: 3, unit: 'box', status: null, type: 'grocery', stores: ['Trader Joe\'s'], aisle: 'Aisle 5', tags: ['pantry', 'grains'] },
      { name: 'Tomatoes', quantity: 6, unit: 'count', status: null, type: 'grocery', stores: ['Costco', 'BJ\'s'], aisle: 'Produce', tags: ['vegetables', 'produce'] },
      { name: 'Cheese', quantity: 1, unit: 'lb', status: null, type: 'grocery', stores: ['Trader Joe\'s', 'Costco'], aisle: 'Dairy', tags: ['dairy', 'cheese'] },
      { name: 'Rotisserie Chicken', quantity: 1, unit: 'count', status: null, type: 'grocery', stores: ['Costco'], aisle: 'Deli', tags: ['protein', 'prepared'] },
      { name: 'Paper Towels', quantity: 2, unit: 'pack', status: null, type: 'supply', stores: ['Costco', 'Target'], aisle: 'Paper Goods', tags: ['household'] },
      { name: 'Kids T-Shirts', quantity: 3, unit: 'count', status: null, type: 'clothing', stores: ['Target', 'Old Navy'], aisle: 'Kids', tags: ['clothing'] },
    ];

    await Promise.all(sampleItems.map(item => addItem(item)));
  };

  const handleEditItem = (input: CreateGroceryItemInput) => {
    if (editingId) {
      updateItem(editingId, input);
      setEditingId(null);
      setIsModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const handleStatusChange = (id: string, status: GroceryItem['status']) => {
    updateItem(id, { status });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedStore('');
    setSelectedType('');
    setSelectedStatus('');
    setSearchQuery('');
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllItems = () => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)));
    }
  };

  const bulkMarkAsPurchased = () => {
    selectedItems.forEach(id => {
      updateItem(id, { status: 'purchased' });
    });
    setSelectedItems(new Set());
  };

  const bulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
      selectedItems.forEach(id => {
        deleteItem(id);
      });
      setSelectedItems(new Set());
    }
  };

  const handleResetStatuses = async () => {
    if (window.confirm('Are you sure you want to reset all item statuses to null?')) {
      // Reset all statuses
      const updatePromises = items.map(item =>
        updateItem(item.id, {
          status: null
        })
      );

      await Promise.all(updatePromises);
      alert('All item statuses have been reset to null!');
    }
  };

  const handleResetQuantities = async () => {
    if (window.confirm('Are you sure you want to reset all item quantities to 0?')) {
      // Reset all quantities
      const updatePromises = items.map(item =>
        updateItem(item.id, {
          quantity: 0
        })
      );

      await Promise.all(updatePromises);
      alert('All item quantities have been reset to 0!');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {items.length === 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={loadSampleData}
              className="hh-action hh-focus min-h-11 rounded-xl px-4 text-sm font-semibold"
            >
              Load Sample Data
            </button>
          </div>
        )}

        <div className="space-y-5">
          <section>
            <div className="mb-5 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--action)]">
                All Items
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--muted)]">
                  {filteredAndSortedItems.length} of {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      const bulkModeEnabled = selectedItems.size === 0;
                      if (!bulkModeEnabled) {
                        setSelectedItems(new Set());
                      }
                    }}
                    className={`hh-focus min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors ${
                      selectedItems.size > 0
                        ? 'hh-action'
                        : 'border border-[var(--separator)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {selectedItems.size > 0 ? `Cancel (${selectedItems.size} selected)` : 'Select Items'}
                  </button>
                )}
                <button
                  onClick={handleOpenAddModal}
                  className="hh-action hh-focus min-h-11 rounded-xl px-4 text-sm font-semibold"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Statistics */}
            {items.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
                <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</div>
                  <div className="text-sm text-[var(--muted)]">Total Items</div>
                </div>
                <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="text-2xl font-bold text-[var(--action)]">{stats.pending}</div>
                  <div className="text-sm text-[var(--muted)]">Pending</div>
                </div>
                <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="text-2xl font-bold text-[var(--brand)]">{stats.purchased}</div>
                  <div className="text-sm text-[var(--muted)]">Purchased</div>
                </div>
                <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="text-2xl font-bold text-[var(--subtle)]">{stats.skipped}</div>
                  <div className="text-sm text-[var(--muted)]">Skipped</div>
                </div>
              </div>
            )}

            {/* Developer Tools */}
            {items.length > 0 && (
              <div className="mb-4 rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="text-xs text-[var(--muted)]">Dev Tools:</span>
                  <button
                    onClick={handleResetStatuses}
                    className="rounded-lg bg-[#7f3b32] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[#99483c]"
                  >
                    Reset Statuses
                  </button>
                  <button
                    onClick={handleResetQuantities}
                    className="rounded-lg bg-[var(--separator)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    Reset Quantities
                  </button>
                </div>
              </div>
            )}

            {/* Search Bar */}
            {items.length > 0 && (
              <div className="mb-4">
                <input
                  type="text"
                placeholder="Search items by name, store, aisle, or lists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hh-field min-h-12 w-full rounded-xl border px-4 py-3 text-base"
                />
              </div>
            )}

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
              <div className="mb-4 rounded-2xl border border-[var(--separator)] bg-[var(--surface-hover)] p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={bulkMarkAsPurchased}
                      className="hh-action hh-focus min-h-11 rounded-xl px-4 text-sm font-semibold"
                    >
                      Mark as Purchased
                    </button>
                    <button
                      onClick={bulkDelete}
                      className="min-h-11 rounded-xl bg-[#7f3b32] px-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[#99483c]"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Sort */}
            {items.length > 0 && (
              <div className="mb-4 rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-4">
                <div className="space-y-4">
                  {/* Sort */}
                  <div>
                    <label htmlFor="sort" className="mb-2 block text-sm font-medium text-[var(--muted)]">
                      Sort by
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="hh-field min-h-11 w-full rounded-xl border px-3 sm:w-auto"
                    >
                      <option value="dateAdded">Date Added (Newest)</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="type">Type</option>
                      <option value="aisle">Aisle/Row</option>
                    </select>
                  </div>

                  {/* Type, Store, and Status Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                    <label htmlFor="type-filter" className="mb-2 block text-sm font-medium text-[var(--muted)]">
                        Filter by Type
                      </label>
                      <select
                        id="type-filter"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="hh-field min-h-11 w-full rounded-xl border px-3"
                      >
                        <option value="">All Types</option>
                        <option value="grocery">Grocery</option>
                        <option value="supply">Supply</option>
                        <option value="clothing">Clothing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {allStores.length > 0 && (
                      <div>
                        <label htmlFor="store-filter" className="mb-2 block text-sm font-medium text-[var(--muted)]">
                          Filter by Store
                        </label>
                        <select
                          id="store-filter"
                          value={selectedStore}
                          onChange={(e) => setSelectedStore(e.target.value)}
                          className="hh-field min-h-11 w-full rounded-xl border px-3"
                        >
                          <option value="">All Stores</option>
                          {allStores.map((store) => (
                            <option key={store} value={store}>
                              {store}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label htmlFor="status-filter" className="mb-2 block text-sm font-medium text-[var(--muted)]">
                        Filter by Status
                      </label>
                      <select
                        id="status-filter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="hh-field min-h-11 w-full rounded-xl border px-3"
                      >
                        <option value="">All Statuses</option>
                        <option value="null">None</option>
                        <option value="pending">Pending</option>
                        <option value="purchased">Purchased</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>
                  </div>

                  {/* List filter */}
                  {allTags.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-[var(--muted)]">
                          Filter by Lists
                        </label>
                        {(selectedTags.length > 0 || selectedStore || selectedType || selectedStatus || searchQuery) && (
                          <button
                            onClick={clearFilters}
                            className="hh-focus text-sm font-medium text-[var(--action)] hover:text-[var(--action-hover)]"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`hh-focus rounded-full border px-3 py-1 text-sm transition-colors ${
                              selectedTags.includes(tag)
                                ? 'border-[var(--action)] bg-[var(--action)] text-[var(--on-action)]'
                                : 'border-[var(--separator)] bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Select All Checkbox */}
            {selectedItems.size > 0 && filteredAndSortedItems.length > 0 && (
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredAndSortedItems.length}
                    onChange={toggleAllItems}
                    className="h-5 w-5 rounded border-[var(--separator)] accent-[var(--action)]"
                  />
                  <span className="text-sm font-medium text-[var(--muted)]">
                    Select All ({filteredAndSortedItems.length})
                  </span>
                </label>
              </div>
            )}

            <GroceryList
              items={filteredAndSortedItems}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteItem}
              onStatusChange={handleStatusChange}
              selectedItems={selectedItems}
              onToggleSelection={toggleItemSelection}
              bulkMode={selectedItems.size > 0}
            />
          </section>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <ItemForm
          onSubmit={editingItem ? handleEditItem : handleAddItem}
          onCancel={handleCancelEdit}
          initialData={editingItem || undefined}
          submitLabel={editingItem ? 'Update Item' : 'Add Item'}
        />
      </Modal>
    </div>
  );
}
