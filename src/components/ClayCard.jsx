

export default function ClayCard({
  children,
  variant = 'light', // 'light' or 'dark'
  hoverLift = true,
  className = '',
  style = {},
  onClick
}) {
  const cardClass = variant === 'light' ? 'clay-card-light' : 'clay-card-dark';
  const hoverClass = hoverLift ? 'clay-card-hover' : '';

  return (
    <div
      onClick={onClick}
      className={`${cardClass} ${hoverClass} ${className}`}
      style={{
        padding: '30px',
        ...style,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {children}
    </div>
  );
}
