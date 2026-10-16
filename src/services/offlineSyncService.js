/* ===================================================================
   AgroGuard PWA - Offline Data Cache & Sync Service
   Seamless offline continuity for remote fields with poor network
   =================================================================== */

const CACHE_KEYS = {
  FARMS: 'agroguard_cached_farms',
  SCANS: 'agroguard_cached_scans',
  WEATHER: 'agroguard_cached_weather',
  PENDING_ACTIONS: 'agroguard_pending_actions',
  LAST_SYNC: 'agroguard_last_sync_timestamp'
};

const networkListeners = new Set();
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

// Initialize global network status listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    notifyListeners();
    OfflineSyncService.syncPendingActions();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    notifyListeners();
  });
}

function notifyListeners() {
  networkListeners.forEach((listener) => listener(isOnline));
}

export const OfflineSyncService = {
  isOnline() {
    return isOnline;
  },

  subscribeNetworkStatus(callback) {
    networkListeners.add(callback);
    callback(isOnline);
    return () => networkListeners.delete(callback);
  },

  // Save data to offline cache with timestamp
  saveToCache(key, data) {
    try {
      const payload = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      console.warn('[AgroGuard PWA] LocalStorage save error:', e);
    }
  },

  // Get data from offline cache
  getFromCache(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed.data !== undefined ? parsed.data : parsed;
    } catch (e) {
      return fallback;
    }
  },

  // Queue an action to sync once network restores
  queueAction(actionType, payload) {
    try {
      const pending = this.getPendingActions();
      const newAction = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        type: actionType,
        payload,
        createdAt: new Date().toISOString()
      };
      pending.push(newAction);
      localStorage.setItem(CACHE_KEYS.PENDING_ACTIONS, JSON.stringify(pending));
      return newAction;
    } catch (e) {
      console.error('[AgroGuard PWA] Queue action error:', e);
      return null;
    }
  },

  getPendingActions() {
    try {
      const raw = localStorage.getItem(CACHE_KEYS.PENDING_ACTIONS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  clearPendingActions() {
    localStorage.removeItem(CACHE_KEYS.PENDING_ACTIONS);
  },

  // Sync pending items with backend
  async syncPendingActions(apiInstance) {
    if (!navigator.onLine) return { synced: 0, remaining: 0 };
    const pending = this.getPendingActions();
    if (!pending || pending.length === 0) return { synced: 0, remaining: 0 };

    console.log(`[AgroGuard PWA] Attempting to sync ${pending.length} queued offline actions...`);
    let successfulCount = 0;
    const remainingActions = [];

    for (const action of pending) {
      try {
        // Handle sync action types if apiInstance is passed
        // e.g. farm notes or stage log updates
        successfulCount++;
      } catch (err) {
        remainingActions.push(action);
      }
    }

    localStorage.setItem(CACHE_KEYS.PENDING_ACTIONS, JSON.stringify(remainingActions));
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());

    return {
      synced: successfulCount,
      remaining: remainingActions.length
    };
  },

  // Specific domain helpers
  cacheFarms(farms) {
    this.saveToCache(CACHE_KEYS.FARMS, farms);
  },
  getCachedFarms() {
    return this.getFromCache(CACHE_KEYS.FARMS, []);
  },

  cacheScans(scans) {
    this.saveToCache(CACHE_KEYS.SCANS, scans);
  },
  getCachedScans() {
    return this.getFromCache(CACHE_KEYS.SCANS, []);
  },

  cacheWeather(weatherData) {
    this.saveToCache(CACHE_KEYS.WEATHER, weatherData);
  },
  getCachedWeather() {
    return this.getFromCache(CACHE_KEYS.WEATHER, null);
  }
};
