'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { GroceryItem, CreateGroceryItemInput, UpdateGroceryItemInput } from '@/types/grocery';

interface GroceryItemsContextType {
  items: GroceryItem[];
  addItem: (input: CreateGroceryItemInput) => Promise<GroceryItem | null>;
  updateItem: (id: string, updates: UpdateGroceryItemInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => GroceryItem | undefined;
  isLoading: boolean;
  error: string | null;
}

interface GroceryItemRow {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  status: GroceryItem['status'];
  type: GroceryItem['type'];
  stores: string[] | null;
  aisle: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const GroceryItemsContext = createContext<GroceryItemsContextType | undefined>(undefined);

async function fetchItems(signal: AbortSignal): Promise<GroceryItem[]> {
  // The unique URL bypasses older cache-first service workers during upgrades.
  const response = await fetch(`/api/grocery-items?_refresh=${Date.now()}`, {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }

  const { items: data }: { items: GroceryItemRow[] } = await response.json();

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: Number(item.quantity),
    unit: item.unit,
    status: item.status,
    type: item.type,
    stores: item.stores || [],
    aisle: item.aisle || undefined,
    tags: item.tags || [],
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  }));
}

export function GroceryItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchItems(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setItems(data);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Error loading items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load items');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const addItem = useCallback(async (input: CreateGroceryItemInput): Promise<GroceryItem | null> => {
    try {
      setError(null);

      const response = await fetch('/api/grocery-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      const { item: data } = await response.json();

      // Transform and add to local state
      const newItem: GroceryItem = {
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        status: data.status,
        type: data.type,
        stores: data.stores || [],
        aisle: data.aisle || undefined,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
      return null;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: UpdateGroceryItemInput): Promise<void> => {
    try {
      setError(null);

      const response = await fetch(`/api/grocery-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        )
      );
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      const response = await fetch(`/api/grocery-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Update local state
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  }, []);

  const getItem = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return (
    <GroceryItemsContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        getItem,
        isLoading,
        error,
      }}
    >
      {children}
    </GroceryItemsContext.Provider>
  );
}

export function useGroceryItems() {
  const context = useContext(GroceryItemsContext);
  if (context === undefined) {
    throw new Error('useGroceryItems must be used within a GroceryItemsProvider');
  }
  return context;
}
