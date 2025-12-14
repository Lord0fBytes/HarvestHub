'use client';

import { useMemo } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';

export default function ReviewPage() {
  const { items, updateItem } = useGroceryItems();

  // Calculate statistics
  const stats = useMemo(() => {
    const nullStatus = items.filter(item => item.status === null).length;
    const pending = items.filter(item => item.status === 'pending').length;
    const purchased = items.filter(item => item.status === 'purchased').length;
    const skipped = items.filter(item => item.status === 'skipped').length;
    return { nullStatus, pending, purchased, skipped, total: items.length };
  }, [items]);

  const handleCompletePurchasing = async () => {
    const purchasedItems = items.filter(item => item.status === 'purchased');

    if (purchasedItems.length === 0) {
      alert('No purchased items to complete.');
      return;
    }

    if (window.confirm(`Complete purchasing for ${purchasedItems.length} item(s)? This will clear their status and set quantity to 0.`)) {
      // Clear status and quantity for all purchased items
      const updatePromises = purchasedItems.map(item =>
        updateItem(item.id, {
          status: null,
          quantity: 0
        })
      );

      await Promise.all(updatePromises);
      alert(`${purchasedItems.length} purchased item(s) have been completed!`);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-4 text-center md:text-left">
              Review & Summary
            </h2>

            {/* Statistics */}
            {items.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg border border-blue-900 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-400">{stats.pending}</div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
                <div className="bg-gray-800 rounded-lg border border-green-900 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-500">{stats.purchased}</div>
                  <div className="text-sm text-gray-400">Purchased</div>
                </div>
                <div className="bg-gray-800 rounded-lg border border-yellow-900 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-yellow-500">{stats.skipped}</div>
                  <div className="text-sm text-gray-400">Skipped</div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-sm">
              {/* Complete Purchasing Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleCompletePurchasing}
                  className="px-8 py-4 bg-green-900 text-white rounded-lg hover:bg-green-800 active:bg-green-700 transition-colors font-medium text-lg w-full sm:w-auto"
                >
                  Complete Purchasing
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Clears all purchased items from your shopping list
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
