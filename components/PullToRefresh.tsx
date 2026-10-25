'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TRIGGER_DISTANCE = 72;

export function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const currentDistance = useRef(0);
  const refreshingRef = useRef(false);
  const refreshTimer = useRef<number | null>(null);

  const refreshPage = useCallback(() => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setRefreshing(true);
    setPullDistance(TRIGGER_DISTANCE);

    refreshTimer.current = window.setTimeout(() => {
      // A new URL also bypasses older cache-first service workers on this origin.
      const url = new URL(window.location.href);
      url.searchParams.set('_refresh', Date.now().toString());
      window.location.replace(url.toString());
    }, 150);
  }, []);

  useEffect(() => {
    const resetPull = () => {
      startY.current = null;
      currentDistance.current = 0;
      setPullDistance(0);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (
        refreshingRef.current ||
        !window.matchMedia('(max-width: 767px)').matches ||
        event.touches.length !== 1 ||
        window.scrollY > 0 ||
        document.body.style.overflow === 'hidden' ||
        (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]'))
      ) {
        return;
      }

      startY.current = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (startY.current === null || refreshingRef.current) return;
      if (event.touches.length !== 1 || window.scrollY > 0) {
        resetPull();
        return;
      }

      const movement = event.touches[0].clientY - startY.current;
      if (movement <= 0) {
        currentDistance.current = 0;
        setPullDistance(0);
        return;
      }

      if (movement > 8) {
        event.preventDefault();
        const distance = Math.min(movement * 0.75, 96);
        currentDistance.current = distance;
        setPullDistance(distance);
      }
    };

    const onTouchEnd = () => {
      if (startY.current === null) return;
      const shouldRefresh = currentDistance.current >= TRIGGER_DISTANCE;
      resetPull();
      if (shouldRefresh) refreshPage();
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', resetPull);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', resetPull);
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
    };
  }, [refreshPage]);

  const ready = pullDistance >= TRIGGER_DISTANCE;
  const message = refreshing ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh';

  return (
    <>
      <button
        type="button"
        onClick={refreshPage}
        className="hh-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-[4.5rem] focus:z-[65] focus:rounded-xl focus:border focus:border-[var(--separator)] focus:bg-[var(--surface)] focus:p-2 focus:text-[var(--foreground)] md:hidden"
      >
        Refresh page
      </button>
      {(pullDistance > 0 || refreshing) && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none fixed left-1/2 top-[4.5rem] z-[65] flex items-center gap-2 rounded-xl border bg-[var(--surface)] px-3 py-2 text-sm font-medium md:hidden ${
            ready ? 'border-[var(--action)] text-[var(--action)]' : 'border-[var(--separator)] text-[var(--foreground)]'
          }`}
          style={{ transform: `translate(-50%, ${Math.round(pullDistance / 3)}px)` }}
        >
          <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m-5-5 5 5 5-5M4 20h16" />
          </svg>
          <span>{message}</span>
        </div>
      )}
    </>
  );
}
