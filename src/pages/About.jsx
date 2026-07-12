import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { Target, Eye, ShieldCheck, Award } from 'lucide-react';
import { safeParseJson, asArray, saveLocalAndCloud, initializeDb } from '../utils/storage';

export default function About() {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const defaults = [];

    const loadData = () => {
      const savedMiles = localStorage.getItem('sreeraam_about_milestones');
      setMilestones(savedMiles ? safeParseJson(savedMiles, []) : defaults);
    };

    initializeDb('sreeraam_about_milestones', defaults);

    loadData();
    window.addEventListener('sreeraam_db_update', loadData);
    return () => window.removeEventListener('sreeraam_db_update', loadData);
  }, []);

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
    transition: { staggerChildren: 0.08 }
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
        title="About Us"
        description="Learn about Shree Ramsethu Constructions & Interiors — Rameswaram's civil engineering contractor led by S.M. Sethu Pandian B.E. Specializing in house construction, lodge projects, commercial builds & interior decoration."
        canonical="/about"
      />
    <div className="container" style={{ padding: '50px 0 80px 0' }}>
      {/* 1. Header Hero section */}
      <motion.div
        {...fadeUp}
        style={{ textAlign: 'left', marginBottom: '60px', maxWidth: '800px' }}
      >
        <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
          OUR CORPORATE PROFILE
        </span>
        <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '38px', fontWeight: '800', marginBottom: '20px' }}>
          Sree Raam Shethu Construction &amp; Interiors
        </h1>
        <p style={{ color: 'var(--gray-700)', fontSize: '15px', lineHeight: '1.8' }}>
          We coordinate premium House, Lodge, and Commercial building civil construction works across Rameswaram, Pamban, and adjacent zones. Under the technical direction of **S.M. Sethu Pandian B.E.**, we combine modern structural design with turnkey interior decoration.
        </p>
      </motion.div>

      {/* 2. Core Pillars */}
      <motion.div
        {...stagger}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}
      >
        {[
          {
            icon: <Target size={24} style={{ color: 'var(--vgn-gold)' }} />,
            title: 'OUR MISSION',
            desc: 'To deliver safe, modern, and legally compliant civil structures—including family houses and commercial tourist lodges—with careful engineering precision.'
          },
          {
            icon: <Eye size={24} style={{ color: 'var(--vgn-gold)' }} />,
            title: 'OUR VISION',
            desc: 'To be the most trusted local civil contracting partner in Rameswaram, recognized for durable coastal materials and exceptional interior decoration.'
          },
          {
            icon: <ShieldCheck size={24} style={{ color: 'var(--vgn-gold)' }} />,
            title: 'CIVIL QUALITY POLICY',
            desc: 'Utilizing premium anti-corrosive concrete mixes, solid load-bearing pillars, eco-friendly red clay tiles, and high-standard interior cabinetry.'
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            {...fadeUpChild}
            className="vgn-card"
            style={{ padding: '30px', textAlign: 'left' }}
          >
            <div style={{ marginBottom: '20px' }}>{item.icon}</div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--vgn-blue-dark)', marginBottom: '12px' }}>
              {item.title}
            </h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '13px', lineHeight: '1.7' }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Milestones Timeline Grid */}
      <motion.div {...fadeUp} style={{ marginBottom: '80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          style={{ textAlign: 'center', marginBottom: '50px' }}
        >
          <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '10px' }}>
            CORE CAPABILITIES
          </span>
          <h2 style={{ fontSize: '30px', color: 'var(--vgn-blue-dark)', fontWeight: '800' }}>
            Why Choose Sree Raam Shethu?
          </h2>
        </motion.div>

        <motion.div
          {...stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px'
          }}
        >
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              {...fadeUpChild}
              style={{
                background: 'var(--bg-light)',
                border: '1px solid var(--gray-100)',
                padding: '30px 20px',
                borderRadius: '4px',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: 'var(--vgn-gold)',
                  marginBottom: '10px'
                }}
              >
                {m.year}
              </div>
              <h4 style={{ color: 'var(--vgn-blue-dark)', fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>
                {m.title}
              </h4>
              <p style={{ color: 'var(--gray-500)', fontSize: '12px', lineHeight: '1.6' }}>
                {m.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* 4. Contact/Action Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--vgn-blue-dark)',
          color: 'var(--white)',
          padding: '40px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Award size={36} style={{ color: 'var(--vgn-gold)', flexShrink: 0 }} />
          <div>
            <h3 style={{ color: 'var(--white)', fontSize: '20px', fontWeight: '800', marginBottom: '5px' }}>
              S.M. Sethu Pandian B.E. (Civil)
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Call <strong>+91 9566615030</strong> to discuss structural designs, materials quality, or interior wood choices.
            </p>
          </div>
        </div>
      </motion.div>
    </div></>
  );
}
