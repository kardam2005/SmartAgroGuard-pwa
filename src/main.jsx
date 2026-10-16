import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { PWAService } from './services/pwaService.js';

// Register enterprise Service Worker for offline capability & caching
PWAService.registerServiceWorker(() => {
  console.log('[AgroGuard PWA] New update available for AgroGuard PWA.');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
