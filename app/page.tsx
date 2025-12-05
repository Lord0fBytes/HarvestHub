'use client';

import { useState, useMemo } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { GroceryList } from '@/components/GroceryList';
import { ItemForm } from '@/components/ItemForm';
import { CreateGroceryItemInput, GroceryItem } from '@/types/grocery';

type SortOption = 'name' | 'store' | 'aisle' | 'dateAdded';

export default function Home() {
  const { items, addItem, updateItem, deleteItem } = useGroceryItems();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
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
      if (item.store) storeSet.add(item.store);
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
        item.store?.toLowerCase().includes(query) ||
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
      filtered = filtered.filter(item => item.store === selectedStore);
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'store':
          return (a.store || '').localeCompare(b.store || '');
        case 'aisle':
          return (a.aisle || '').localeCompare(b.aisle || '');
        case 'dateAdded':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [items, selectedTags, selectedStore, selectedStatus, searchQuery, sortBy]);

  const handleAddItem = (input: CreateGroceryItemInput) => {
    addItem(input);
  };

  const handleEditItem = (input: CreateGroceryItemInput) => {
    if (editingId) {
      updateItem(editingId, input);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HarvestHub</h1>
          <p className="text-gray-600">Your grocery shopping companion</p>
        </header>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <ItemForm
              onSubmit={editingItem ? handleEditItem : handleAddItem}
              onCancel={editingItem ? handleCancelEdit : undefined}
              initialData={editingItem || undefined}
              submitLabel={editingItem ? 'Update Item' : 'Add Item'}
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Shopping List
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
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
                    className={`text-sm px-3 py-1 rounded-md ${
                      selectedItems.size > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedItems.size > 0 ? `Cancel (${selectedItems.size} selected)` : 'Select Items'}
                  </button>
                )}
              </div>
            </div>

            {/* Statistics */}
            {items.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{stats.purchased}</div>
                  <div className="text-sm text-gray-600">Purchased</div>
                </div>
                <div className="bg-white rounded-lg border border-yellow-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">{stats.skipped}</div>
                  <div className="text-sm text-gray-600">Skipped</div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            {items.length > 0 && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search items by name, store, aisle, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                />
              </div>
            )}

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium text-green-900">
                    {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={bulkMarkAsPurchased}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Mark as Purchased
                    </button>
                    <button
                      onClick={bulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Sort */}
            {items.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
                <div className="space-y-4">
                  {/* Sort */}
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                      Sort by
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="dateAdded">Date Added (Newest)</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="store">Store</option>
                      <option value="aisle">Aisle/Row</option>
                    </select>
                  </div>

                  {/* Store and Status Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allStores.length > 0 && (
                      <div>
                        <label htmlFor="store-filter" className="block text-sm font-medium text-gray-700 mb-2">
                          Filter by Store
                        </label>
                        <select
                          id="store-filter"
                          value={selectedStore}
                          onChange={(e) => setSelectedStore(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Status
                      </label>
                      <select
                        id="status-filter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="purchased">Purchased</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>
                  </div>

                  {/* Tag Filter */}
                  {allTags.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Filter by Tags
                        </label>
                        {(selectedTags.length > 0 || selectedStore || selectedStatus || searchQuery) && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
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
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredAndSortedItems.length})
                  </span>
                </label>
              </div>
            )}

            <GroceryList
              items={filteredAndSortedItems}
              onEdit={setEditingId}
              onDelete={handleDeleteItem}
              onStatusChange={handleStatusChange}
              selectedItems={selectedItems}
              onToggleSelection={toggleItemSelection}
              bulkMode={selectedItems.size > 0}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
