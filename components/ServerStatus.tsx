'use client';

import { useEffect, useState } from 'react';

export function ServerStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [serverReachable, setServerReachable] = useState(true);

  useEffect(() => {
    // Check network connectivity
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Check server reachability
    const checkServer = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-store',
        });
        setServerReachable(response.ok);
      } catch {
        setServerReachable(false);
      }
    };

    // Initial checks
    updateOnlineStatus();
    checkServer();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check server every 30 seconds
    const interval = setInterval(checkServer, 30000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const status = isOnline && serverReachable ? 'online' : 'offline';
  const statusColor = status === 'online' ? 'bg-green-500' : 'bg-red-500';
  const statusText = status === 'online' ? 'Online' : 'Offline';

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor} ${status === 'online' ? 'animate-pulse' : ''}`} />
        <span>{statusText}</span>
      </div>
    </div>
  );
}
