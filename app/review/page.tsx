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
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-5">
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--action)]">
              Review & Summary
            </h2>
            <p className="mb-5 text-[var(--muted)] md:text-lg">Wrap up your latest shopping trip.</p>

            {/* Statistics */}
            {items.length > 0 && (
              <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
                <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="text-2xl font-bold text-[var(--action)]">{stats.pending}</div>
                  <div className="text-sm text-[var(--muted)]">Pending</div>
                </div>
                <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="text-2xl font-bold text-[var(--brand)]">{stats.purchased}</div>
                  <div className="text-sm text-[var(--muted)]">Purchased</div>
                </div>
                <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="text-2xl font-bold text-[var(--subtle)]">{stats.skipped}</div>
                  <div className="text-sm text-[var(--muted)]">Skipped</div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-6 sm:p-8">
              {/* Complete Purchasing Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleCompletePurchasing}
                  className="hh-action hh-focus min-h-12 w-full rounded-xl px-8 py-3 text-lg font-semibold transition-colors active:bg-[#c85e2e] sm:w-auto"
                >
                  Complete Purchasing
                </button>
                <p className="mt-2 text-center text-xs text-[var(--muted)]">
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
