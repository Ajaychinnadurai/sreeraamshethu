import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, MessageCircle, CheckCircle, FileText, Clock, X, Users } from 'lucide-react';

/**
 * Toast notification component — slides in from top-right.
 * Auto-dismisses after `duration` ms. Plays notification sound.
 */
export default function ToastNotification({
  toasts,
  onDismiss
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        maxWidth: '380px'
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              pointerEvents: 'auto',
              background: 'var(--white)',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(220, 200, 180, 0.25)',
              borderLeft: '4px solid var(--vgn-gold)',
              padding: '14px 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease'
            }}
            onClick={() => onDismiss(toast.id)}
            whileHover={{ boxShadow: '0 16px 48px rgba(0,0,0,0.22)' }}
          >
            {/* Icon */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: toast.iconBg || 'var(--vgn-blue-light)',
                color: toast.iconColor || 'var(--vgn-blue-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '16px'
              }}
            >
              {renderToastIcon(toast.iconName)}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '2px' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: '1.4', wordBreak: 'break-word' }}>
                {toast.message}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '4px' }}>
                {formatRelativeTime(toast.timestamp || Date.now())}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--gray-400)',
                fontSize: '12px',
                flexShrink: 0,
                padding: 0,
                lineHeight: 1,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.08)';
                e.currentTarget.style.color = 'var(--gray-600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                e.currentTarget.style.color = 'var(--gray-400)';
              }}
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function renderToastIcon(iconName) {
  switch (iconName) {
    case 'mail': return <Mail size={16} />;
    case 'message': return <MessageCircle size={16} />;
    case 'check': return <CheckCircle size={16} />;
    case 'file': return <FileText size={16} />;
    case 'clock': return <Clock size={16} />;
    case 'users': return <Users size={16} />;
    default: return <Bell size={16} />;
  }
}

/**
 * Format a timestamp as a human-readable relative time string.
 * e.g. "Just now", "2m ago", "1h ago", "Yesterday", "3d ago"
 */
function formatRelativeTime(ts) {
  const now = Date.now();
  const diff = now - (typeof ts === 'number' ? ts : new Date(ts).getTime());
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 14) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks}w ago`;

  // Fallback to date string
  const date = new Date(ts);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
