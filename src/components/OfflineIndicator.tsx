/**
 * Offline Indicator Component
 * Shows a banner when the user is offline
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      // Hide "back online" message after 3 seconds
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-warning text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
        >
          <WifiOff className="w-4 h-4" />
          <span>You're offline. Some features may be limited.</span>
        </motion.div>
      )}
      
      {showBackOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-success text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
        >
          <Wifi className="w-4 h-4" />
          <span>You're back online!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
