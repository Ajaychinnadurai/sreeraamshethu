import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUICK_REPLIES, QUICK_REPLY_CATEGORIES, detectSmartSuggestions } from '../utils/chatUtils.jsx';

/**
 * Quick Reply Bar — sits between chat messages and input.
 * Shows suggested buttons + category filter.
 */
export default function QuickReplyBar({
  onSend,
  lastMessageText,
  isVisible
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);

  // Detect smart suggestions from the last message
  const suggestions = detectSmartSuggestions(lastMessageText);

  // Filter replies by category
  const filteredReplies = Object.entries(QUICK_REPLIES)
    .filter(([key, reply]) => activeCategory === 'all' || reply.category === activeCategory);

  // Show up to 3 by default, or all if expanded
  const visibleReplies = showAll ? filteredReplies : filteredReplies.slice(0, 4);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: '10px 12px 6px',
            borderBottom: '1px solid var(--gray-100)',
            background: 'var(--bg-light)'
          }}
        >
          {/* Smart suggestions (shown when detected) */}
          {suggestions.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Suggested
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {suggestions.map(key => {
                  const reply = QUICK_REPLIES[key];
                  if (!reply) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => onSend(reply.message)}
                      style={{
                        background: 'var(--vgn-gold)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 2px 8px rgba(212,175,55,0.2)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {reply.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {QUICK_REPLY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: activeCategory === cat.id ? 'var(--vgn-blue-dark)' : 'transparent',
                  color: activeCategory === cat.id ? 'var(--white)' : 'var(--gray-500)',
                  border: '1px solid',
                  borderColor: activeCategory === cat.id ? 'var(--vgn-blue-dark)' : 'var(--gray-200)',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '9px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick reply buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {visibleReplies.map(([key, reply]) => (
              <button
                key={key}
                onClick={() => onSend(reply.message)}
                style={{
                  background: 'var(--white)',
                  color: 'var(--vgn-blue-dark)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '16px',
                  padding: '5px 12px',
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--vgn-gold)';
                  e.currentTarget.style.background = 'var(--vgn-blue-light)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--gray-200)';
                  e.currentTarget.style.background = 'var(--white)';
                }}
              >
                {reply.label}
              </button>
            ))}

            {/* Expand/collapse toggle */}
            {filteredReplies.length > 4 && (
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-400)',
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px'
                }}
              >
                {showAll ? 'Show less' : `+${filteredReplies.length - 4} more`}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
