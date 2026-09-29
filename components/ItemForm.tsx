'use client';

import { useState, useEffect, useMemo } from 'react';
import { GroceryItem, CreateGroceryItemInput } from '@/types/grocery';
import { useGroceryItems } from '@/contexts/GroceryItemsContext';

interface ItemFormProps {
  onSubmit: (item: CreateGroceryItemInput) => void;
  onCancel?: () => void;
  initialData?: GroceryItem;
  submitLabel?: string;
}

export function ItemForm({ onSubmit, onCancel, initialData, submitLabel = 'Add Item' }: ItemFormProps) {
  const { items } = useGroceryItems();
  const [name, setName] = useState(initialData?.name || '');
  const [status, setStatus] = useState<GroceryItem['status']>(initialData?.status ?? null);
  const [type, setType] = useState<GroceryItem['type']>(initialData?.type || 'grocery');
  const [stores, setStores] = useState<string[]>(initialData?.stores || []);
  const [storeInput, setStoreInput] = useState('');
  const [aisle, setAisle] = useState(initialData?.aisle || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const availableStores = useMemo(() => Array.from(
    new Set(items.flatMap((item) => item.stores ?? []))
  )
    .filter((store) => !stores.includes(store))
    .sort((a, b) => a.localeCompare(b)), [items, stores]);

  const availableLists = useMemo(() => Array.from(
    new Set(items.flatMap((item) => item.tags ?? []))
  )
    .filter((list) => !tags.includes(list))
    .sort((a, b) => a.localeCompare(b)), [items, tags]);

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

  const handleStoreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStore();
    }

    if (e.key === 'Backspace' && !storeInput && stores.length > 0) {
      setStores(stores.slice(0, -1));
    }
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

    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
            Item Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Bananas"
            required
            className="hh-field min-h-11 w-full rounded-xl border px-3 py-2.5 text-base"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
              Type *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as GroceryItem['type'])}
              className="hh-field min-h-11 w-full rounded-xl border px-3 py-2.5 text-base"
            >
              <option value="grocery">Grocery</option>
              <option value="supply">Supply</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="aisle" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
              Aisle/Row
            </label>
            <input
              type="text"
              id="aisle"
              value={aisle}
              onChange={(e) => setAisle(e.target.value)}
              placeholder="e.g., Aisle 5, Produce"
              className="hh-field min-h-11 w-full rounded-xl border px-3 py-2.5 text-base"
            />
          </div>
        </div>

        <div>
          <label htmlFor="stores" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
            Stores
          </label>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="hh-field hh-token-field flex min-h-11 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-xl border px-2 py-1.5">
                {stores.map((store) => (
                  <span
                    key={store}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--separator)] bg-[var(--background)] py-0.5 pl-2.5 pr-0.5 text-sm text-[var(--brand)]"
                  >
                    <span className="min-w-0 break-words">{store}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStore(store)}
                      className="hh-focus inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                      aria-label={`Remove ${store} store`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  id="stores"
                  value={storeInput}
                  onChange={(e) => setStoreInput(e.target.value)}
                  onKeyDown={handleStoreKeyDown}
                  placeholder={stores.length > 0 ? 'Add another store' : "e.g., Costco, Trader Joe's"}
                  className="min-h-8 min-w-36 flex-1 bg-transparent px-1 py-1 text-base outline-none placeholder:text-[var(--subtle)]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddStore}
                className="hh-action hh-focus min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors active:bg-[#c85e2e]"
              >
                Add
              </button>
            </div>
            {availableStores.length > 0 && (
              <div className="pt-0.5">
                <div className="flex flex-wrap gap-2">
                  {availableStores.map((store) => (
                    <button
                      key={store}
                      type="button"
                      onClick={() => setStores([...stores, store])}
                      className="hh-focus min-h-9 rounded-full border border-[var(--separator)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--brand)] transition-colors hover:bg-[var(--surface-hover)] active:bg-[var(--separator)]"
                      aria-label={`Add ${store} store`}
                    >
                      {store}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
            Lists
          </label>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="hh-field hh-token-field flex min-h-11 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-xl border px-2 py-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--separator)] bg-[var(--background)] py-0.5 pl-2.5 pr-0.5 text-sm text-[var(--brand)]"
                  >
                    <span className="min-w-0 break-words">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hh-focus inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                      aria-label={`Remove ${tag} list`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length > 0 ? 'Add another list' : 'Add to a list (e.g., produce, dairy)'}
                  className="min-h-8 min-w-36 flex-1 bg-transparent px-1 py-1 text-base outline-none placeholder:text-[var(--subtle)]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="hh-action hh-focus min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors active:bg-[#c85e2e]"
              >
                Add
              </button>
            </div>
            {availableLists.length > 0 && (
              <div className="pt-0.5">
                <div className="flex flex-wrap gap-2">
                  {availableLists.map((list) => (
                    <button
                      key={list}
                      type="button"
                      onClick={() => setTags([...tags, list])}
                      className="hh-focus min-h-9 rounded-full border border-[var(--separator)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--brand)] transition-colors hover:bg-[var(--surface-hover)] active:bg-[var(--separator)]"
                      aria-label={`Add ${list} list`}
                    >
                      {list}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {initialData && (
          <div>
            <label htmlFor="status" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
              Status
            </label>
            <select
              id="status"
              value={status ?? ''}
              onChange={(e) => setStatus(e.target.value === '' ? null : e.target.value as GroceryItem['status'])}
              className="hh-field min-h-11 w-full rounded-xl border px-3 py-2.5 text-base"
            >
              <option value="">None</option>
              <option value="pending">Pending</option>
              <option value="purchased">Purchased</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--separator)] pt-5 sm:flex-row sm:justify-end">
          <button
            type="submit"
            className="hh-action hh-focus min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors active:bg-[#c85e2e] sm:order-2 sm:flex-none"
          >
            {submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="hh-focus min-h-11 rounded-xl border border-[var(--separator)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] sm:order-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
