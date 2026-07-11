import { useEffect, useState, useRef } from 'react';

export default function StatCounter({ target, suffix = '', label, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end)) return;

    const incrementTime = Math.max(Math.floor(duration / end), 15);
    const step = Math.ceil(end / (duration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return (
    <div
      ref={elementRef}
      style={{
        padding: '24px 32px',
        textAlign: 'center',
        flex: '1',
        minWidth: '200px',
        background: 'var(--white)',
        borderLeft: '1px solid var(--cream-200)',
        borderRight: '1px solid var(--cream-200)',
        margin: '0 -1px' /* Collapse borders together */
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3rem',
          fontWeight: '400',
          color: 'var(--navy-900)',
          lineHeight: '1.1',
          marginBottom: '8px'
        }}
      >
        {count}
        <span style={{ color: 'var(--amber-500)', fontSize: '2rem', marginLeft: '2px' }}>{suffix}</span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--gray-400)'
        }}
      >
        {label}
      </div>
    </div>
  );
}
