/* ===================================================================
   AgroGuard PWA Service
   Manages Service Worker Lifecycle, Installation Prompts & Device APIs
   =================================================================== */

let deferredInstallPrompt = null;
const installListeners = new Set();
let swRegistration = null;

export const PWAService = {
  /**
   * Register Service Worker with update detection
   */
  registerServiceWorker(onUpdateFound) {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      const doRegister = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            swRegistration = registration;
            console.log('[AgroGuard PWA] Service Worker registered with scope:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.addEventListener('statechange', () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[AgroGuard PWA] New update available!');
                    if (onUpdateFound) onUpdateFound();
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.warn('[AgroGuard PWA] Service Worker registration failed:', error);
          });
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        doRegister();
      } else {
        window.addEventListener('load', doRegister);
      }
    }

    // Capture beforeinstallprompt event for custom install banner/button
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      console.log('[AgroGuard PWA] beforeinstallprompt event captured');
      installListeners.forEach((listener) => listener(true));
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      console.log('[AgroGuard PWA] App was successfully installed!');
      installListeners.forEach((listener) => listener(false));
    });
  },

  /**
   * Subscribe to install prompt availability changes
   */
  onInstallableChange(callback) {
    installListeners.add(callback);
    callback(!!deferredInstallPrompt || this.isIOS());
    return () => installListeners.delete(callback);
  },

  /**
   * Trigger the native or custom install prompt
   */
  async promptInstall() {
    if (!deferredInstallPrompt) {
      return { outcome: 'dismissed', reason: 'no-prompt' };
    }
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('[AgroGuard PWA] User accepted the PWA install prompt');
      }
      deferredInstallPrompt = null;
      installListeners.forEach((listener) => listener(false));
      return choice;
    } catch (err) {
      console.warn('[AgroGuard PWA] Install prompt error:', err);
      return { outcome: 'dismissed', reason: 'no-prompt' };
    }
  },

  /**
   * Detect if app is currently running in Standalone (Installed) Mode
   */
  isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true
    );
  },

  /**
   * Detect iOS Device (iPhone / iPad / iPod)
   */
  isIOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    const isMacTouch = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
    return (isAppleMobile || isMacTouch) && !window.MSStream;
  },

  /**
   * Device Haptic Feedback (Vibration API)
   */
  triggerHaptic(pattern = [60]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silent fail on unsupported browsers
      }
    }
  },

  /**
   * Web Share API (Share Field Health Report / Advisory)
   */
  async shareReport(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[AgroGuard PWA] Share failed:', err);
        }
        return false;
      }
    } else {
      try {
        if (data.url) {
          await navigator.clipboard.writeText(data.url);
          return 'copied';
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  },

  /**
   * Request Push Notification Permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    const permission = await Notification.requestPermission();
    return permission;
  },

  /**
   * Trigger Local Test Notification
   */
  showLocalNotification(title, body, url = '/') {
    if (swRegistration && 'showNotification' in swRegistration && Notification.permission === 'granted') {
      swRegistration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [150, 50, 150],
        data: { url }
      });
    }
  }
};
