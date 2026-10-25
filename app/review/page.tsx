'use client';

import { useMemo } from 'react';
import { useGroceryItems } from '@/hooks/useGroceryItems';

export default function ReviewPage() {
  const { items, updateItem, isLoading, error } = useGroceryItems();

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
    const skippedItems = items.filter(item => item.status === 'skipped');
    const completedCount = purchasedItems.length + skippedItems.length;

    if (completedCount === 0) {
      alert('No purchased or skipped items to complete.');
      return;
    }

    if (window.confirm(`Complete purchasing for ${completedCount} item(s)? This will clear purchased and skipped statuses, set purchased quantities to 0, and leave pending items unchanged.`)) {
      const updatePromises = [
        ...purchasedItems.map(item => updateItem(item.id, { status: null, quantity: 0 })),
        ...skippedItems.map(item => updateItem(item.id, { status: null })),
      ];

      await Promise.all(updatePromises);
      alert(`${completedCount} purchased or skipped item(s) have been completed!`);
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
            {isLoading ? (
              <p className="mb-6 text-sm text-[var(--muted)]">Loading item counts…</p>
            ) : error && items.length === 0 ? (
              <p role="alert" className="mb-6 rounded-xl border border-[var(--separator)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                Item counts are unavailable because the items could not be loaded. Check the database connection and refresh this page.
              </p>
            ) : (
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
                  disabled={isLoading || (error !== null && items.length === 0)}
                  className="hh-action hh-focus min-h-12 w-full rounded-xl px-8 py-3 text-lg font-semibold transition-colors active:bg-[#c85e2e] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Complete Purchasing
                </button>
                <p className="mt-2 text-center text-xs text-[var(--muted)]">
                  Clears purchased and skipped statuses. Pending items stay on your list.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
