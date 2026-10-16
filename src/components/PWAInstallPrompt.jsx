import React, { useState, useEffect } from 'react';
import { PWAService } from '../services/pwaService';

export default function PWAInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (PWAService.isStandalone()) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed prompt in this session
    const dismissed = sessionStorage.getItem('agroguard_pwa_install_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // iOS detection
    if (PWAService.isIOS()) {
      setIsIOSDevice(true);
      setCanInstall(true);
    }

    // Listen for standard beforeinstallprompt
    const unsubscribe = PWAService.onInstallableChange((installable) => {
      setCanInstall(installable);
    });

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    PWAService.triggerHaptic([40, 30, 40]);
    if (isIOSDevice) {
      setShowIOSModal(true);
      return;
    }

    const res = await PWAService.promptInstall();
    if (res && res.outcome === 'accepted') {
      setIsInstalled(true);
      PWAService.triggerHaptic([60, 60, 100]);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('agroguard_pwa_install_dismissed', 'true');
  };

  if (isInstalled || isDismissed || (!canInstall && !isIOSDevice)) {
    return null;
  }

  return (
    <>
      <div className="pwa-install-banner">
        <div className="pwa-install-left">
          <div className="pwa-icon-glow">
            <img src="/icons/icon-192x192.png" alt="AgroGuard Logo" className="pwa-logo-img" />
          </div>
          <div className="pwa-install-texts">
            <div className="pwa-install-title">
              Install AgroGuard PWA
              <span className="pwa-badge-pill">Offline Ready</span>
            </div>
            <p className="pwa-install-desc">
              Get full screen app experience, 1-tap disease scan & offline field access.
            </p>
          </div>
        </div>

        <div className="pwa-install-actions">
          <button 
            className="pwa-btn-install"
            onClick={handleInstallClick}
            title="Install AgroGuard on your home screen or desktop"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Install App</span>
          </button>
          
          <button 
            className="pwa-btn-dismiss" 
            onClick={handleDismiss} 
            title="Dismiss installation banner"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>

      {/* iOS Safari 'Add to Home Screen' Instructions Modal */}
      {showIOSModal && (
        <div className="pwa-ios-modal-overlay" onClick={() => setShowIOSModal(false)}>
          <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-ios-header">
              <div className="pwa-icon-glow" style={{ width: 44, height: 44 }}>
                <img src="/icons/icon-192x192.png" alt="AgroGuard" style={{ width: '100%', height: '100%', borderRadius: 10 }} />
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>Install on iPhone / iPad</h3>
              <button className="pwa-btn-dismiss" onClick={() => setShowIOSModal(false)}>✕</button>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.92rem', margin: '14px 0 20px', lineHeight: 1.5 }}>
              Apple Safari does not allow automatic 1-tap installation. Follow these 2 easy steps:
            </p>
            <div className="pwa-ios-steps">
              <div className="pwa-ios-step">
                <div className="pwa-step-number">1</div>
                <div>
                  Tap the <strong>Share</strong> button <span style={{ fontSize: '1.2rem' }}>⎙</span> in the bottom toolbar of Safari.
                </div>
              </div>
              <div className="pwa-ios-step">
                <div className="pwa-step-number">2</div>
                <div>
                  Scroll down and tap <strong>Add to Home Screen</strong> <span style={{ fontSize: '1.2rem' }}>➕</span>.
                </div>
              </div>
            </div>
            <button 
              className="pwa-btn-install" 
              style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }} 
              onClick={() => setShowIOSModal(false)}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
