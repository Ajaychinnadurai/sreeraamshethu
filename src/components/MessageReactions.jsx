import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus } from 'lucide-react';

const EMOJI_LIST = ['👍', '❤️', '😊', '🎉', '👏', '✅', '🙏', '💯', '🔥', '⭐'];

/**
 * Message reactions — shows emoji badges + a reaction picker.
 * Click an existing emoji to toggle your reaction.
 * Click the + button to open the picker and choose a new emoji.
 */
export default function MessageReactions({
  reactions = {},
  currentUserEmail,
  onReact
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  const toggleReaction = (emoji) => {
    onReact(emoji);
    setShowPicker(false);
  };

  const entries = Object.entries(reactions).filter(([_, users]) => users.length > 0);
  const totalReactions = entries.reduce((sum, [_, users]) => sum + users.length, 0);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '6px',
      flexWrap: 'wrap',
      position: 'relative'
    }}>
      {/* Existing reaction badges */}
      {entries.map(([emoji, users]) => {
        const hasReacted = users.some(u => u.toLowerCase() === currentUserEmail?.toLowerCase());
        return (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            title={users.join(', ')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
              borderRadius: '12px',
              border: hasReacted ? '1px solid var(--vgn-gold)' : '1px solid var(--gray-200)',
              background: hasReacted ? 'rgba(212,175,55,0.1)' : 'var(--white)',
              cursor: 'pointer',
              fontSize: '12px',
              lineHeight: 1,
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--vgn-gold)'; }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = hasReacted ? 'var(--vgn-gold)' : 'var(--gray-200)';
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>{emoji}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: hasReacted ? 'var(--vgn-gold)' : 'var(--gray-500)',
              minWidth: '12px',
              textAlign: 'center'
            }}>
              {users.length}
            </span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        title="Add reaction"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '1px dashed var(--gray-300)',
          background: 'transparent',
          cursor: totalReactions > 0 ? 'pointer' : 'pointer',
          color: 'var(--gray-400)',
          fontSize: '14px',
          padding: 0,
          lineHeight: 1,
          transition: 'all 0.15s ease',
          opacity: 0.6
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.borderColor = 'var(--vgn-gold)';
          e.currentTarget.style.color = 'var(--vgn-gold)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.borderColor = 'var(--gray-300)';
          e.currentTarget.style.color = 'var(--gray-400)';
        }}
      >
        <SmilePlus size={12} />
      </button>

      {/* Emoji picker popover */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '0',
              marginBottom: '6px',
              background: 'var(--white)',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              border: '1px solid var(--gray-100)',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              zIndex: 10
            }}
          >
            {EMOJI_LIST.map(emoji => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  lineHeight: 1,
                  transition: 'background 0.1s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
