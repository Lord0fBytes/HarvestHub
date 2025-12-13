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

  const handleResetStatuses = async () => {
    if (window.confirm('Are you sure you want to reset all item statuses to null?')) {
      // Reset all statuses
      const updatePromises = items.map(item =>
        updateItem(item.id, {
          status: null
        })
      );

      await Promise.all(updatePromises);
      alert('All item statuses have been reset to null!');
    }
  };

  const handleResetQuantities = async () => {
    if (window.confirm('Are you sure you want to reset all item quantities to 0?')) {
      // Reset all quantities
      const updatePromises = items.map(item =>
        updateItem(item.id, {
          quantity: 0
        })
      );

      await Promise.all(updatePromises);
      alert('All item quantities have been reset to 0!');
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-100">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total Items</div>
                </div>
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-500">{stats.nullStatus}</div>
                  <div className="text-sm text-gray-400">Master List</div>
                </div>
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
              <div className="text-center mb-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-100 mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-400 mb-8">
                  This is where you'll review your shopping trip and note any substitutions.
                </p>
              </div>

              {/* Temporary Reset Buttons */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-sm font-medium text-gray-300 mb-4 text-center">
                  Temporary Tools
                </h4>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleResetStatuses}
                      className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800 active:bg-red-700 transition-colors font-medium w-full sm:w-auto"
                    >
                      Reset All Statuses
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Sets all statuses to null
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleResetQuantities}
                      className="px-6 py-3 bg-orange-900 text-white rounded-lg hover:bg-orange-800 active:bg-orange-700 transition-colors font-medium w-full sm:w-auto"
                    >
                      Reset All Quantities
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Sets all quantities to 0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
