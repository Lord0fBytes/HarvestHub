'use client';

import { useState, useEffect } from 'react';
import { GroceryItem, CreateGroceryItemInput } from '@/types/grocery';

interface ItemFormProps {
  onSubmit: (item: CreateGroceryItemInput) => void;
  onCancel?: () => void;
  initialData?: GroceryItem;
  submitLabel?: string;
}

export function ItemForm({ onSubmit, onCancel, initialData, submitLabel = 'Add Item' }: ItemFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [status, setStatus] = useState<GroceryItem['status']>(initialData?.status ?? null);
  const [type, setType] = useState<GroceryItem['type']>(initialData?.type || 'grocery');
  const [stores, setStores] = useState<string[]>(initialData?.stores || []);
  const [storeInput, setStoreInput] = useState('');
  const [aisle, setAisle] = useState(initialData?.aisle || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setType(initialData.type);
      setStores(initialData.stores || []);
      setAisle(initialData.aisle || '');
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      quantity: initialData?.quantity ?? 0,
      unit: initialData?.unit || 'count',
      status,
      type,
      stores,
      aisle: aisle.trim() || undefined,
      tags,
    });

    if (!initialData) {
      setName('');
      setStatus(null);
      setType('grocery');
      setStores([]);
      setStoreInput('');
      setAisle('');
      setTags([]);
      setTagInput('');
    }
  };

  const handleAddStore = () => {
    const trimmedStore = storeInput.trim();
    if (trimmedStore && !stores.includes(trimmedStore)) {
      setStores([...stores, trimmedStore]);
      setStoreInput('');
    }
  };

  const handleRemoveStore = (store: string) => {
    setStores(stores.filter(s => s !== store));
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Bananas"
            required
            className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
              Type *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as GroceryItem['type'])}
              className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="grocery">Grocery</option>
              <option value="supply">Supply</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="aisle" className="block text-sm font-medium text-gray-300 mb-1">
              Aisle/Row
            </label>
            <input
              type="text"
              id="aisle"
              value={aisle}
              onChange={(e) => setAisle(e.target.value)}
              placeholder="e.g., Aisle 5, Produce"
              className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="stores" className="block text-sm font-medium text-gray-300 mb-1">
            Stores
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                id="stores"
                value={storeInput}
                onChange={(e) => setStoreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStore();
                  }
                }}
                placeholder="e.g., Costco, Trader Joe's"
                className="flex-1 px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleAddStore}
                className="min-h-11 rounded-md bg-green-700 px-4 text-white transition-colors hover:bg-green-600 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Add
              </button>
            </div>
            {stores.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stores.map((store) => (
                  <span
                    key={store}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {store}
                    <button
                      type="button"
                      onClick={() => handleRemoveStore(store)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
            Tags
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag (e.g., produce, dairy)"
                className="flex-1 px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="min-h-11 rounded-md bg-green-700 px-4 text-white transition-colors hover:bg-green-600 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900 focus:outline-none"
                      aria-label={`Remove ${tag} tag`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {initialData && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status ?? ''}
              onChange={(e) => setStatus(e.target.value === '' ? null : e.target.value as GroceryItem['status'])}
              className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">None</option>
              <option value="pending">Pending</option>
              <option value="purchased">Purchased</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium"
          >
            {submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
