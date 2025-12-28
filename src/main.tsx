import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeNotifications } from './lib/notifications'

// Initialize notification system
initializeNotifications().catch(console.error);

// Initialize stores and sync listeners
import { initializeStores } from './store';
initializeStores().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
