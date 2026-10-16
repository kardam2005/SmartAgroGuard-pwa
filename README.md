# AgroGuard Progressive Web App (PWA)

A high-performance, offline-capable Progressive Web App for AI crop growth monitoring, disease diagnosis, weather advisories, irrigation planning, and farm lifecycle intelligence.

---

## 🌟 Key PWA Capabilities

1. **Installable Anywhere**:
   - **Android / Chrome / Edge**: One-tap installation directly from browser via the custom in-app install banner or browser address bar install icon.
   - **iOS Safari**: Guided 2-step "Add to Home Screen" instructions.
   - **Desktop**: Installs as a standalone desktop app on Windows, macOS, and Linux.

2. **Offline Resilience & Caching**:
   - Pre-caches core application shell (`index.html`, scripts, CSS, fonts, icons).
   - Serves cached farm details, scan histories, and weather data even when internet or cellular reception drops in remote fields.
   - Includes custom `public/offline.html` fallback.

3. **Background Sync & Storage**:
   - Automatically queues field actions when offline and syncs them as soon as connectivity is restored.
   - Dedicated `OfflineBanner` component with live status indicators.

4. **Homescreen Quick Shortcuts**:
   - **Disease Scan**: Direct access to crop diagnostic scanner.
   - **Weather Radar**: Direct link to 5-day weather and safe chemical spraying windows.
   - **Tank Calculator**: Instant pesticide/fungicide water dilution calculator.
   - **Farmer Simple View**: Simplified regional language mode with voice advisory player.

5. **Native Device Hardware Integrations**:
   - **Haptic Feedback**: Tactile vibration alerts on diagnosis, alerts, or actions.
   - **Web Share API**: One-tap sharing of crop health advisories to WhatsApp or SMS.
   - **Camera & File Capture**: Instant image submission for crop leaves and fields.
   - **High-Accuracy Geolocation**: Field boundary & GPS verification.

---

## 🚀 How to Run Locally

```bash
# Navigate to the PWA folder
cd front_progressive_webapp

# Start development server (runs on port 5175 with network host enabled)
npm run dev
```

Open your browser at:
- Local: `http://localhost:5175`
- Mobile / Local WiFi: `http://<your-pc-ip>:5175`

To test production build:
```bash
npm run build
npm run preview
```

---

## 📂 Architecture Overview

- `public/manifest.json`: Web App Manifest defining standalone mode, icons, colors, and quick shortcuts.
- `public/sw.js`: Service worker implementing network-first and cache-first strategies with push & sync.
- `public/offline.html`: Dedicated offline fallback view.
- `public/icons/`: High-resolution standard and maskable icons (192x192, 512x512, apple-touch-icon, badge).
- `src/services/pwaService.js`: Service worker registration, install prompt event listener, and native device APIs.
- `src/services/offlineSyncService.js`: Local storage caching and action queueing for remote farming areas.
- `src/components/PWAInstallPrompt.jsx`: Custom install banner and iOS modal.
- `src/components/OfflineBanner.jsx`: Dynamic network connectivity banner.
- `src/App.jsx`: Full dashboard, AI scanner, weather radar, tank dilution, and farmer mode.
