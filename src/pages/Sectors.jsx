import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { Home as HomeIcon, Building, ShieldCheck, Palette, CheckCircle } from 'lucide-react';
import { safeParseJson, asArray, saveLocalAndCloud, initializeDb } from '../utils/storage';

const defaultDivisions = [];

export default function Sectors() {
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const savedDivs = localStorage.getItem('sreeraam_divisions');
      const parsed = safeParseJson(savedDivs, null);
      setDivisions(Array.isArray(parsed) ? parsed : []);
    };

    initializeDb('sreeraam_divisions', []);

    loadData();
    window.addEventListener('sreeraam_db_update', loadData);
    return () => window.removeEventListener('sreeraam_db_update', loadData);
  }, []);

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('house') || t.includes('home')) return <HomeIcon size={26} style={{ color: 'var(--vgn-gold)' }} />;
    if (t.includes('lodge') || t.includes('hotel') || t.includes('guest')) return <Building size={26} style={{ color: 'var(--vgn-gold)' }} />;
    if (t.includes('commercial') || t.includes('civil') || t.includes('office')) return <ShieldCheck size={26} style={{ color: 'var(--vgn-gold)' }} />;
    return <Palette size={26} style={{ color: 'var(--vgn-gold)' }} />;
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '-60px' },
    transition: { staggerChildren: 0.1 }
  };

  const fadeUpChild = {
    initial: { opacity: 0, y: 25 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <>
      <SEO
        title="Sectors"
        description="Shree Ramsethu Constructions' core execution divisions — house construction, lodge building, commercial civil projects & interior decoration. Serving Rameswaram & Pamban."
        canonical="/sectors"
      />
    <div className="container" style={{ padding: '50px 0 80px 0' }}>
      {/* Title */}
      <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
          OUR CONTRACTING CAPABILITIES
        </span>
        <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '38px', fontWeight: '800', marginBottom: '20px' }}>
          Core Execution Divisions
        </h1>
        <p style={{ color: 'var(--gray-500)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Managed under civil engineering protocols to offer quality results from foundation to final paint layer.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div {...stagger} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {asArray(divisions).map((div, idx) => (
          <motion.div
            key={idx}
            {...fadeUpChild}
            className="vgn-card"
            style={{
              padding: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
              textAlign: 'left'
            }}
          >
            {/* Left Content Column */}
            <div>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'var(--vgn-blue-light)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                {getIcon(div.title)}
              </div>
              <h2 style={{ color: 'var(--vgn-blue-dark)', fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
                {div.title}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--vgn-gold)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                {div.metrics}
              </span>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.7' }}>
                {div.desc}
              </p>
            </div>

            {/* Right Core Services Column */}
            <div
              style={{
                background: 'var(--bg-light)',
                padding: '30px',
                borderRadius: '4px',
                border: '1px solid var(--gray-100)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <h4 style={{ color: 'var(--vgn-blue-dark)', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Core Competencies
              </h4>
              {(div.services || []).map((service, sIdx) => (
                <div key={sIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle size={14} style={{ color: 'var(--vgn-gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--gray-800)', fontWeight: '600' }}>
                    {service}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div></>
  );
}
