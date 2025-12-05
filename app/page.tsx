'use client';

import { useState } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { GroceryList } from '@/components/GroceryList';
import { ItemForm } from '@/components/ItemForm';
import { CreateGroceryItemInput, GroceryItem } from '@/types/grocery';

export default function Home() {
  const { items, addItem, updateItem, deleteItem } = useGroceryItems();
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingItem = editingId ? items.find(item => item.id === editingId) : null;

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
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <GroceryList
              items={items}
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
