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

const GroceryItemsContext = createContext<GroceryItemsContextType | undefined>(undefined);

export function GroceryItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items from Supabase on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/grocery-items');

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const { items: data } = await response.json();

      // Transform API data to match our GroceryItem interface
      const transformedItems: GroceryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        type: item.type,
        stores: item.stores || [],
        aisle: item.aisle || undefined,
        tags: item.tags || [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setItems(transformedItems);
    } catch (err) {
      console.error('Error loading items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

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
