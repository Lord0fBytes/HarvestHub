'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed, don't show prompt
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show install button if not standalone
    if (isIOSDevice && !isStandalone) {
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (!dismissed) {
        setShowInstallButton(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS installation instructions
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    if (isIOS) {
      localStorage.setItem('ios-install-dismissed', 'true');
    }
  };

  const handleDismissIOSInstructions = () => {
    setShowIOSInstructions(false);
    setShowInstallButton(false);
    localStorage.setItem('ios-install-dismissed', 'true');
  };

  if (!showInstallButton) {
    return null;
  }

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Install HarvestHub</h3>
          <div className="space-y-3 text-gray-300 mb-6">
            <p className="text-sm">To install this app on your iPhone or iPad:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Tap the Share button <span className="inline-block">📤</span> in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
          <button
            onClick={handleDismissIOSInstructions}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg shadow-lg p-4 border border-green-400">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Install HarvestHub</h3>
            <p className="text-sm text-green-50">
              Install this app for quick access and offline use while shopping.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-green-100 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            {isIOS ? 'How to Install' : 'Install'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-white hover:text-green-100 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
