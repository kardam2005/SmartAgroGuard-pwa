import React, { useState, useEffect } from 'react';
import { OfflineSyncService } from '../services/offlineSyncService';
import { PWAService } from '../services/pwaService';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(OfflineSyncService.isOnline());
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initial check
    setPendingCount(OfflineSyncService.getPendingActions().length);

    const unsubscribe = OfflineSyncService.subscribeNetworkStatus((online) => {
      setIsOnline(online);
      if (online) {
        setShowRestoredNotice(true);
        PWAService.triggerHaptic([50, 50]);
        const timer = setTimeout(() => {
          setShowRestoredNotice(false);
        }, 4000);
        return () => clearTimeout(timer);
      } else {
        PWAService.triggerHaptic([100, 100]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSyncNow = async () => {
    PWAService.triggerHaptic([40]);
    await OfflineSyncService.syncPendingActions();
    setPendingCount(OfflineSyncService.getPendingActions().length);
  };

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  return (
    <div className={`pwa-connectivity-strip ${isOnline ? 'pwa-strip-online' : 'pwa-strip-offline'}`}>
      <div className="pwa-strip-content">
        <div className="pwa-strip-icon">
          {isOnline ? '🟢' : '⚡'}
        </div>
        <div className="pwa-strip-text">
          {isOnline ? (
            <span>
              <strong>Online:</strong> Network connection restored. Cached data synchronized with satellite servers.
            </span>
          ) : (
            <span>
              <strong>Field Offline Mode:</strong> Zero/low network detected. AgroGuard is serving locally cached farm data.
              {pendingCount > 0 && ` (${pendingCount} actions queued for auto-sync)`}
            </span>
          )}
        </div>
      </div>
      {!isOnline && (
        <button className="pwa-strip-btn" onClick={handleSyncNow} title="Force sync test">
          Sync Now
        </button>
      )}
    </div>
  );
}
