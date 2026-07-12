import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import { isOnline, onOnlineStatusChange, getPendingItems, retryAll, getPendingCount, clearQueue } from '../utils/syncQueue';

export default function SyncStatusBar() {
  const [online, setOnline] = useState(isOnline());
  const [pendingItems, setPendingItems] = useState(getPendingItems());
  const [retrying, setRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // Listen for online/offline changes
  useEffect(() => {
    const unsub = onOnlineStatusChange((isOnline) => {
      if (mountedRef.current) setOnline(isOnline);
    });
    return unsub;
  }, []);

  // Listen for queue updates
  useEffect(() => {
    const handleQueueUpdate = () => {
      if (mountedRef.current) {
        setPendingItems(getPendingItems());
        setLastResult(null);
      }
    };
    window.addEventListener('sreeraam_sync_queue_update', handleQueueUpdate);
    return () => window.removeEventListener('sreeraam_sync_queue_update', handleQueueUpdate);
  }, []);

  // When coming back online, auto-retry (handled by syncQueue), but also update UI
  useEffect(() => {
    if (online && pendingItems.length > 0 && !retrying) {
      // Auto-retry was triggered by syncQueue's online handler
      // Just refresh the UI
    }
  }, [online, pendingItems.length, retrying]);

  const handleRetry = async () => {
    setRetrying(true);
    setLastResult(null);
    const result = await retryAll();
    if (mountedRef.current) {
      setRetrying(false);
      setLastResult(result);
      setPendingItems(getPendingItems());
      // Clear result after 5s
      setTimeout(() => {
        if (mountedRef.current) setLastResult(null);
      }, 5000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Re-show after 2 minutes if there are still pending items
    setTimeout(() => {
      if (mountedRef.current) {
        const count = getPendingCount();
        if (count > 0) setDismissed(false);
      }
    }, 120_000);
  };

  const handleClearAll = () => {
    clearQueue();
    if (mountedRef.current) {
      setPendingItems([]);
      setLastResult(null);
    }
  };

  const count = pendingItems.length;
  const isOffline = !online;
  const show = !dismissed && (isOffline || count > 0);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -40, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            width: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: '600',
              flexWrap: 'wrap',
              background: isOffline
                ? 'linear-gradient(135deg, #991b1b, #b91c1c)'
                : lastResult && lastResult.failed === 0
                  ? 'linear-gradient(135deg, #15803d, #16a34a)'
                  : 'linear-gradient(135deg, #92400e, #b45309)',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}
          >
            {/* Icon */}
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            </span>

            {/* Message */}
            <span style={{ textAlign: 'center', lineHeight: '1.4' }}>
              {isOffline ? (
                <>You are currently offline. Changes are saved locally and will sync when connection is restored.</>
              ) : lastResult ? (
                lastResult.failed === 0
                  ? `✓ All ${lastResult.success} pending items synced successfully!`
                  : `${lastResult.success} synced, ${lastResult.failed} failed`
              ) : (
                <>{count} pending {count === 1 ? 'item' : 'items'} waiting to sync to cloud.</>
              )}
            </span>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              {!isOffline && count > 0 && (
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '4px',
                    background: retrying ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: retrying ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => { if (!retrying) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={(e) => { if (!retrying) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                >
                  <RefreshCw size={12} style={retrying ? { animation: 'spin 0.7s linear infinite' } : {}} />
                  {retrying ? 'Syncing...' : `Retry All (${count})`}
                </button>
              )}
              <button
                onClick={handleClearAll}
                title="Dismiss all"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
