import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeNotifications } from './lib/notifications'
import { registerPeriodicSync } from './hooks/useBackgroundSync'

// Initialize notification system
initializeNotifications().catch(console.error);

// Register periodic background sync for monthiversary checks
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    registerPeriodicSync().catch(console.error);
  });
}

// Initialize stores and sync listeners
import { initializeStores } from './store';
initializeStores().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
