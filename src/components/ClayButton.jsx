
import { motion } from 'framer-motion';

export default function ClayButton({
  children,
  onClick,
  variant = 'primary', // 'primary' (dark navy), 'secondary' (white), 'dark' (navy), 'outline' (border outline)
  className = '',
  type = 'button',
  disabled = false,
  id,
  style = {}
}) {
  const isPill = className.includes('btn-pill') || style.borderRadius === '50px' || style.borderRadius === 50;

  const baseStyle = {
    fontFamily: 'var(--font-body)',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    padding: '14px 30px',
    borderRadius: isPill ? '50px' : '0px', /* Sharp rectangles for body, pills for CTAs */
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': // Solid Emaar Navy/Black
        return {
          background: 'var(--navy-900)',
          color: 'var(--white)',
          border: '1px solid var(--navy-900)'
        };
      case 'secondary': // Solid White with border
        return {
          background: 'var(--white)',
          color: 'var(--navy-900)',
          border: '1px solid var(--cream-200)'
        };
      case 'dark': // Dark Slate
        return {
          background: 'var(--navy-950)',
          color: 'var(--white)',
          border: '1px solid var(--navy-950)'
        };
      case 'outline': // Thin dark outline
        return {
          background: 'transparent',
          color: 'var(--navy-900)',
          border: '1px solid var(--navy-900)'
        };
      default:
        return {};
    }
  };

  return (
    <motion.button
      id={id}
      type={type}
      onClick={disabled ? undefined : onClick}
      style={{
        ...baseStyle,
        ...getVariantStyles()
      }}
      className={className}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98, y: 0 }}
    >
      {children}
    </motion.button>
  );
}
