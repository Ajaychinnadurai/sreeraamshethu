import { motion } from 'framer-motion';

/**
 * Typing indicator — animated bouncing dots with "typing..." text.
 * Shown in the client's chat when the admin is actively replying.
 */
export default function TypingIndicator({ name = 'Admin' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        alignSelf: 'flex-start',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        background: 'var(--white)',
        borderRadius: '16px 16px 16px 4px',
        border: '1px solid rgba(220, 200, 180, 0.3)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        maxWidth: '180px'
      }}
    >
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--vgn-blue-dark)',
              display: 'inline-block'
            }}
          />
        ))}
      </div>

      {/* Text */}
      <span style={{
        fontSize: '11px',
        color: 'var(--gray-500)',
        fontWeight: '600',
        whiteSpace: 'nowrap'
      }}>
        {name} typing...
      </span>
    </motion.div>
  );
}
