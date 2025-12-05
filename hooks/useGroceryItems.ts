import { useState, useCallback } from 'react';
import { GroceryItem, CreateGroceryItemInput, UpdateGroceryItemInput } from '@/types/grocery';
import { generateId } from '@/lib/utils';

export function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>([]);

  const addItem = useCallback((input: CreateGroceryItemInput) => {
    const newItem: GroceryItem = {
      id: generateId(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: UpdateGroceryItemInput) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getItem = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    getItem,
  };
}
