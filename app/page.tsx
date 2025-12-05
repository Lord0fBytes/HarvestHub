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
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');

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

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

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
  }, [items, selectedTags, selectedStore, sortBy]);

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
              <span className="text-sm text-gray-600">
                {filteredAndSortedItems.length} of {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

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

                  {/* Store Filter */}
                  {allStores.length > 0 && (
                    <div>
                      <label htmlFor="store-filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Store
                      </label>
                      <select
                        id="store-filter"
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

                  {/* Tag Filter */}
                  {allTags.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Filter by Tags
                        </label>
                        {(selectedTags.length > 0 || selectedStore) && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Clear Filters
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

            <GroceryList
              items={filteredAndSortedItems}
              onEdit={setEditingId}
              onDelete={handleDeleteItem}
              onStatusChange={handleStatusChange}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
