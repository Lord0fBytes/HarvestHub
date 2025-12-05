'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { GroceryItem, CreateGroceryItemInput, UpdateGroceryItemInput } from '@/types/grocery';
import { supabase } from '@/lib/supabase';

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

      const { data, error: fetchError } = await supabase
        .from('grocery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform Supabase data to match our GroceryItem interface
      const transformedItems: GroceryItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        store: item.store || undefined,
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

      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('grocery_items')
        .insert([{
          name: input.name,
          quantity: input.quantity,
          unit: input.unit,
          status: input.status,
          store: input.store || null,
          aisle: input.aisle || null,
          tags: input.tags || [],
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Transform and add to local state
      const newItem: GroceryItem = {
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        status: data.status,
        store: data.store || undefined,
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

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('grocery_items')
        .update({
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.quantity !== undefined && { quantity: updates.quantity }),
          ...(updates.unit !== undefined && { unit: updates.unit }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.store !== undefined && { store: updates.store || null }),
          ...(updates.aisle !== undefined && { aisle: updates.aisle || null }),
          ...(updates.tags !== undefined && { tags: updates.tags }),
        })
        .eq('id', id);

      if (updateError) throw updateError;

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

      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

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
