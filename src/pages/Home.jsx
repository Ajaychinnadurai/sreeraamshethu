import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Award, CheckCircle, ChevronRight, Mail } from 'lucide-react';
import { safeParseJson, asArray, saveLocalAndCloud, initializeDb } from '../utils/storage';
import { getVariant, trackClick, resolveVariantFromUrl, HERO_CTA_TEST, LAYOUT_TEST } from '../utils/abTest';
import { trackEvent } from '../utils/posthog';

export default function Home({ onNavigate, onRequestQuote }) {
  // Search state
  const [searchStatus, setSearchStatus] = useState('All');
  const [searchLocation, setSearchLocation] = useState('All');
  const [searchCategory, setSearchCategory] = useState('All');


  // A/B Test: Landing page layout variant (from URL ?variant=a|b or stored/random)
  const [layoutVariant] = useState(() => {
    const { variant, source } = resolveVariantFromUrl(LAYOUT_TEST.name, ['A', 'B']);
    console.log(`[A/B Test] Layout variant ${variant} (source: ${source})`);
    // Clean up URL param to keep URLs clean
    if (source === 'url') {
      const url = new URL(window.location);
      url.searchParams.delete('variant');
      window.history.replaceState({}, '', url);
    }
    return variant;
  });

  // Track layout impression
  useEffect(() => {
    const key = 'sreeraam_abtest_landing_layout_impressions';
    try {
      const raw = localStorage.getItem(key);
      const imps = raw ? JSON.parse(raw) : {};
      imps[layoutVariant] = (imps[layoutVariant] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(imps));
    } catch {}
  }, [layoutVariant]);

  // A/B Test: Hero CTA button text
  const [heroCtaVariant] = useState(() => {
    const { variant, isNew } = getVariant(HERO_CTA_TEST.name, ['A', 'B']);
    if (isNew) {
      console.log(`[A/B Test] Assigned to variant ${variant} for "${HERO_CTA_TEST.name}"`);
    }
    return variant;
  });
  const heroCtaLabel = HERO_CTA_TEST.variants.find(v => v.id === heroCtaVariant)?.label || 'REQUEST A QUOTE';

  // Track impression (view) for CTR calculation
  useEffect(() => {
    const impressionsKey = 'sreeraam_abtest_hero_cta_text_impressions';
    try {
      const raw = localStorage.getItem(impressionsKey);
      const impressions = raw ? JSON.parse(raw) : {};
      impressions[heroCtaVariant] = (impressions[heroCtaVariant] || 0) + 1;
      localStorage.setItem(impressionsKey, JSON.stringify(impressions));
    } catch {}
  }, [heroCtaVariant]);

  const handleHeroCtaClick = () => {
    trackClick(HERO_CTA_TEST.name, heroCtaVariant, { element: 'hero_cta', page: 'home' });
    onRequestQuote();
  };

  // Tabbed project preview
  const [activeTab, setActiveTab] = useState('Ongoing');

  // Load dynamic data sets
  const [projectsData, setProjectsData] = useState([]);
  const [divisionsData, setDivisionsData] = useState([]);

  useEffect(() => {
    const defaultProj = [
      { id: 1, name: 'Laxmana Residency Lodge', location: 'Rameswaram', status: 'Ongoing', category: 'Lodge Construction', price: 'Premium Commercial Fit', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=800&q=80', type: 'Modern Lodge & Guest House', desc: 'Multistory lodge construction featuring standard Dravidian columns base and high-strength concrete framing near Laxmana Theertham.' },
      { id: 2, name: 'Sethu Coastal Villa Enclave', location: 'Pamban', status: 'Ongoing', category: 'House Construction', price: 'High-Quality Civil Build', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', desc: 'Seaside luxury villas constructed using premium local red clay roof tiles and wind-resistant framing structures.' },
      { id: 3, name: 'Rameswaram Tourist Lodge Complex', location: 'Rameswaram', status: 'Ready to Move-in', category: 'Lodge Construction', price: 'Completed Turnkey Project', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=cover&w=800&q=80', type: 'Commercial Lodges', desc: 'Finished premium lodge suites offering spacious ventilation, safety compliance, and parking layouts.' },
      { id: 4, name: 'Thulasi Baba Mansion', location: 'Rameswaram', status: 'Ready to Move-in', category: 'House Construction', price: 'Ready to Handover', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', desc: 'Double story signature bungalow featuring premium teak wood entryways and modern modular layout specs.' },
      { id: 5, name: 'Pamban Sea-View Resort Lodge', location: 'Pamban', status: 'Upcoming', category: 'Lodge Construction', price: 'Planning Phase', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=cover&w=800&q=80', type: 'Boutique Lodge Enclave', desc: 'Upcoming double-winged tourist lodge offering direct sea views, modern recreational zones, and structural integrity audits.' },
      { id: 6, name: 'Temple View Arcade', location: 'Rameswaram', status: 'Completed', category: 'Commercial Civil Build', price: 'Fully Handed Over', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=cover&w=800&q=80', type: 'Commercial Building', desc: 'Premium retail block housing local handicraft stores, complete with heavy-duty structural concrete slabs.' }
    ];

    const defaultDivs = [
      { id: 1, title: 'House Construction', desc: 'Bespoke custom homes, family bungalows, and villas designed to withstand local coastal conditions.', bg: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=cover&w=500&q=80' },
      { id: 2, title: 'Lodge Construction', desc: 'Heavy-duty multi-room tourist lodges, hotels, and layout enclaves built near spiritual hubs.', bg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=500&q=80' },
      { id: 3, title: 'Commercial Civil Build', desc: 'Reliable office blocks, retail shopping corridors, and foundational structures matching engineering codes.', bg: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=cover&w=500&q=80' },
      { id: 4, title: 'Interior decoration', desc: 'Fine wood cabinetry, custom modular kitchens, gypsum false ceilings, and premium wall finishes.', bg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=cover&w=500&q=80' }
    ];

    const loadData = () => {
      const savedProj = localStorage.getItem('sreeraam_projects');
      setProjectsData(savedProj ? safeParseJson(savedProj, []) : defaultProj);

      const savedDivs = localStorage.getItem('sreeraam_divisions');
      setDivisionsData(savedDivs ? safeParseJson(savedDivs, []) : defaultDivs);
    };

    initializeDb('sreeraam_projects', defaultProj);
    initializeDb('sreeraam_divisions', defaultDivs);

    loadData();
    window.addEventListener('sreeraam_db_update', loadData);
    return () => window.removeEventListener('sreeraam_db_update', loadData);
  }, []);

  // Callback / quick form state
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackName || !callbackPhone) return;

    // Track in PostHog
    trackEvent('lead_form_submitted', {
      source: layoutVariant === 'B' ? 'layout_b' : 'layout_a',
      name_length: callbackName.length
    });

    // Save callback inquiry to localStorage for admin dashboard
    const rawInq = safeParseJson(localStorage.getItem('sreeraam_inquiries'), []);
    const inquiries = asArray(rawInq, []);
    inquiries.push({
      id: Date.now(),
      name: callbackName,
      phone: callbackPhone,
      project: 'Callback Request (via Home page)',
      message: `Callback requested by ${callbackName} at ${callbackPhone}.`,
      date: 'Just now'
    });
    saveLocalAndCloud('sreeraam_inquiries', inquiries);

    // Save persistent admin notification
    const rawNotifs = safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []);
    const adminNotifs = asArray(rawNotifs, []);
    adminNotifs.unshift({
      id: Date.now() + Math.random(),
      iconName: 'mail',
      title: 'New Callback Request',
      message: `${callbackName} requested callback at ${callbackPhone}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    saveLocalAndCloud('sreeraam_notifications_admin', adminNotifs);

    setCallbackSubmitted(true);
    setTimeout(() => {
      setCallbackSubmitted(false);
      setCallbackName('');
      setCallbackPhone('');
    }, 4000);
  };

  // Filter projects for the tabbed catalog
  const tabFilteredProjects = asArray(projectsData)
    .filter(p => p.status === activeTab)
    .slice()
    .sort((a, b) => b.id - a.id);

  // Video Background Cycler with preloading
  const heroVideos = ['/videos/bg_video1.mp4', '/videos/bg_video2.mp4'];
  const [videoIndex, setVideoIndex] = useState(0);
  // Track which videos have buffered enough to show (by index)
  const [readyVideos, setReadyVideos] = useState(new Set());

  const handleVideoCanPlay = (i) => {
    setReadyVideos(prev => new Set([...prev, i]));
  };

  // Cycle video every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setVideoIndex(prev => (prev + 1) % heroVideos.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // ── LAYOUT B: Conversion-Focused Variant ──
  const renderLayoutB = () => (
    <div style={{ width: '100%' }}>
      {/* B1. HERO — Centered, bold, single CTA */}
      <section
        style={{
          position: 'relative',
          height: '92vh',
          minHeight: '650px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(150deg, #05050F 0%, #1A1A2E 50%, #0F0F1F 100%)',
          overflow: 'hidden',
          marginTop: '-85px',
          paddingTop: '85px'
        }}
      >
        {/* Subtle geometric grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        {/* Gold accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span
              style={{
                color: 'var(--vgn-gold)',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '20px',
                border: '1px solid rgba(212,175,55,0.3)',
                padding: '6px 18px',
                borderRadius: '2px'
              }}
            >
              SREE RAAM SHETHU CONSTRUCTION &amp; INTERIORS
            </span>

            <h1
              style={{
                color: 'var(--white)',
                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                fontWeight: '800',
                lineHeight: '1.15',
                marginBottom: '16px',
                maxWidth: '900px',
                margin: '0 auto 16px'
              }}
            >
              Rameswaram's{' '}
              <span style={{ color: 'var(--vgn-gold)' }}>Trusted</span>
              {' '}Construction Partner
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 'clamp(15px, 1.6vw, 17px)',
                lineHeight: '1.7',
                maxWidth: '640px',
                margin: '0 auto 35px',
                fontWeight: '400'
              }}
            >
              Premium house builds, lodge constructions, commercial projects &amp; bespoke interior decoration — delivered with engineering precision in Rameswaram &amp; Pamban.
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  trackClick(LAYOUT_TEST.name, layoutVariant, { element: 'hero_cta_b', page: 'home' });
                  onRequestQuote();
                }}
                className="btn-vgn btn-vgn-gold"
                style={{
                  padding: '16px 40px',
                  fontSize: '14px',
                  borderRadius: '2px',
                  boxShadow: '0 8px 30px rgba(212,175,55,0.25)'
                }}
              >
                GET A FREE CONSULTATION
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="btn-vgn btn-vgn-outline-white"
                style={{ padding: '16px 40px', fontSize: '14px', borderRadius: '2px' }}
              >
                VIEW OUR WORK
              </button>
            </div>

            {/* Trust indicators */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                marginTop: '45px',
                flexWrap: 'wrap'
              }}
            >
              {[
                { icon: '✓', text: 'B.E. Civil Certified' },
                { icon: '✓', text: '15+ Years Experience' },
                { icon: '✓', text: '100+ Projects Delivered' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600' }}
                >
                  <span style={{ color: 'var(--vgn-gold)', fontWeight: '800' }}>{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative bottom fade */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to top, var(--bg-light) 0%, transparent 100%)',
            zIndex: 1
          }}
        />
      </section>

      {/* B2. STATS — Compact horizontal strip */}
      <section style={{ padding: '40px 0', background: 'var(--white)', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            {[
              { num: '15+', label: 'Years of Excellence' },
              { num: '100+', label: 'Projects Completed' },
              { num: '2,500+', label: 'Happy Families' },
              { num: '4.9', label: 'Client Rating' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px 20px' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--vgn-blue-dark)', lineHeight: 1 }}>{stat.num}</div>
                <div style={{ width: '30px', height: '2px', background: 'var(--vgn-gold)', margin: '8px auto' }} />
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B3. PROJECTS — Full-width showcase, no tabs */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--vgn-gold)', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                OUR PROJECTS
              </span>
              <h2 style={{ fontSize: 'clamp(24px, 2.8vw, 32px)', color: 'var(--vgn-blue-dark)', fontWeight: '800', margin: 0 }}>
                Featured Constructions
              </h2>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="btn-vgn btn-vgn-outline-gold"
              style={{ padding: '10px 20px', fontSize: '11px', borderRadius: '2px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              VIEW ALL <ArrowRight size={12} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}
          >
            {asArray(projectsData).slice(0, 6).map((project) => (
              <div
                key={project.id}
                className="vgn-card"
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => onNavigate('projects')}
              >
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img
                    src={project.image}
                    alt={project.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ padding: '20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--vgn-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>{project.category}</span>
                    <span style={{ fontSize: '9px', color: 'var(--gray-400)' }}>|</span>
                    <span style={{ fontSize: '9px', color: 'var(--gray-500)' }}>{project.location}</span>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--vgn-blue-dark)', marginBottom: '8px' }}>{project.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: '14px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: '600' }}>{project.status}</span>
                    <span style={{ fontSize: '12px', color: 'var(--vgn-gold)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      INQUIRE <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B4. TRUST + TESTIMONIAL */}
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #0A0A18, var(--vgn-blue-dark))' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--vgn-gold)', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                WHY CHOOSE US
              </span>
              <h2 style={{ color: 'var(--white)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2' }}>
                Built by Engineers,<br />Trusted by Families
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.8', marginBottom: '30px' }}>
                Directed by S.M. Sethu Pandian B.E., our team brings 15+ years of structural engineering expertise to every project — from coastal villas to commercial complexes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'B.E. Certified Leadership', desc: 'Direct oversight by a qualified civil engineer' },
                  { label: 'Premium Materials', desc: 'Anti-corrosive concrete, teak wood, quality finishes' },
                  { label: 'End-to-End Service', desc: 'From soil tests to modular interior decoration' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--vgn-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <span style={{ color: '#0A0A18', fontSize: '10px', fontWeight: '800' }}>✓</span>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--white)', fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>{item.label}</h4>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '35px',
                  padding: '20px 24px',
                  background: 'rgba(255,255,255,0.04)',
                  borderLeft: '3px solid var(--vgn-gold)',
                  borderRadius: '2px'
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontStyle: 'italic', lineHeight: '1.7', margin: 0 }}>
                  "They transformed our vision into a breathtaking landmark. The attention to structural detail and interior craftsmanship is unmatched in Rameswaram."
                </p>
                <p style={{ color: 'var(--vgn-gold)', fontSize: '11px', fontWeight: '700', marginTop: '12px', marginBottom: 0 }}>— Client, Lakshmana Residency Lodge</p>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  border: '8px solid rgba(212,175,55,0.15)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  height: '350px'
                }}
              >
                <iframe
                  title="Office Location"
                  src="https://maps.google.com/maps?q=12/15c%20Thulasi%20Baba%20Madam%20Street,%20Rameswaram&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block', opacity: 0.7 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://maps.app.goo.gl/vpLk7orWfTrsPH6f7?g_st=aw"
                target="_blank"
                rel="noreferrer"
                className="btn-vgn btn-vgn-gold"
                style={{
                  marginTop: '16px',
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 20px',
                  fontSize: '11px',
                  textDecoration: 'none'
                }}
              >
                <MapPin size={13} /> VISIT OUR OFFICE IN RAMESWARAM
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* B5. LEAD FORM — Urgency + trust badges */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--vgn-gold)', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              START YOUR PROJECT
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 2.8vw, 32px)', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '10px' }}>
              Book Your Free Consultation
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 30px' }}>
              Limited construction slots available for this quarter. Speak to S.M. Sethu Pandian B.E. directly.
            </p>

            <div
              style={{
                background: 'var(--white)',
                borderRadius: '4px',
                boxShadow: '0 10px 40px rgba(26,26,46,0.08)',
                padding: '40px',
                textAlign: 'left'
              }}
            >
              {!callbackSubmitted ? (
                <form onSubmit={handleCallbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px', textTransform: 'uppercase' }}>Your Name</label>
                      <input
                        required
                        type="text"
                        placeholder="Enter your full name"
                        className="vgn-input"
                        value={callbackName}
                        onChange={(e) => setCallbackName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px', textTransform: 'uppercase' }}>Mobile Number</label>
                      <input
                        required
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        className="vgn-input"
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-vgn btn-vgn-gold"
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxShadow: '0 6px 20px rgba(212,175,55,0.2)'
                    }}
                    onClick={() => trackClick(LAYOUT_TEST.name, layoutVariant, { element: 'lead_form_b', page: 'home' })}
                  >
                    REQUEST CALL BACK
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '30px 10px' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--vgn-blue-light)', color: 'var(--vgn-blue-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                    <CheckCircle size={24} />
                  </div>
                  <h4 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>Request Received!</h4>
                  <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Thank you <strong>{callbackName}</strong>. We will call you at <strong>{callbackPhone}</strong> within 24 hours.</p>
                </motion.div>
              )}

              {/* Trust badges */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--gray-100)',
                  flexWrap: 'wrap'
                }}
              >
                {['RERA Compliant', 'B.E. Certified', 'ISO Standards', 'Premium Materials'].map((badge, i) => (
                  <span key={i} style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--vgn-gold)' }}>◆</span> {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating contact helpers — same as Layout A */}
      <div className="quick-inquiry-bar">
        <a href="tel:+919566615030" className="quick-btn" title="Call Support">
          <Phone size={20} />
        </a>
        <a href="https://wa.me/919566615030" target="_blank" rel="noreferrer" className="quick-btn quick-btn-whatsapp" title="WhatsApp Chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </a>
      </div>
    </div>
  );

  // ── Render active layout ──
  return layoutVariant === 'B' ? renderLayoutB() : (
    <div style={{ width: '100%' }}>
      {/* 1. Hero banner & overlay slider */}
      <section
        style={{
          position: 'relative',
          height: '85vh',
          minHeight: '600px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0A0A18 0%, var(--vgn-blue-dark) 100%)',
          overflow: 'hidden',
          marginTop: '-85px',
          paddingTop: '85px'
        }}
      >
        {/* Video Background — preload both, show active one when ready */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, overflow: 'hidden' }}>
          {heroVideos.map((src, i) => (
            <video
              key={src}
              src={src}
              preload="auto"
              muted
              playsInline
              loop
              autoPlay={i === videoIndex}
              onCanPlay={() => handleVideoCanPlay(i)}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: i === videoIndex && readyVideos.has(i) ? 0.55 : 0,
                transition: 'opacity 1.5s ease-in-out',
                pointerEvents: 'none'
              }}
            />
          ))}
        </div>

        {/* Hero Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, rgba(26, 26, 46, 0.65) 0%, rgba(26, 26, 46, 0.30) 100%)',
            zIndex: 2
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ maxWidth: '750px', textAlign: 'left' }}>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: 'var(--vgn-gold)',
                color: 'var(--white)',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRadius: '2px',
                display: 'inline-block',
                marginBottom: '20px'
              }}
            >
              Licensed Contractor: S.M. Sethu Pandian B.E.
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              style={{
                color: 'var(--white)',
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                fontWeight: '800',
                lineHeight: '1.2',
                marginBottom: '20px'
              }}
            >
              Precision Construction &amp; <span className="font-serif" style={{ fontStyle: 'italic', color: 'var(--vgn-gold)' }}>Interiors</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 'clamp(14px, 1.8vw, 16px)',
                lineHeight: '1.8',
                marginBottom: '35px',
                fontWeight: '400'
              }}
            >
              Contact us for premium House builds, Lodge projects, Commercial civil construction, and all types of custom Interior decoration works in Rameswaram.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}
            >
              <button onClick={() => onNavigate('projects')} className="btn-vgn btn-vgn-gold">
                VIEW CONSTRUCTIONS
              </button>
              <button
                onClick={handleHeroCtaClick}
                className="btn-vgn btn-vgn-outline-white"
                style={{ position: 'relative' }}
              >
                {heroCtaLabel}
                {/* Dev-only A/B variant badge — hidden in production */}
                {import.meta.env.DEV && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'var(--vgn-gold)',
                      color: '#fff',
                      fontSize: '7px',
                      fontWeight: '700',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      lineHeight: '1.2',
                      opacity: 0.7
                    }}
                    title={`A/B Test Variant ${heroCtaVariant}`}
                  >
                    {heroCtaVariant}
                  </span>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Brand Statistics Strip */}
      <section style={{ padding: '60px 0 20px 0', background: 'var(--bg-light)' }}>
        <div className="container">
          <div
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              display: 'grid',
              gap: '30px',
              textAlign: 'center'
            }}
          >
            {[
              { num: 'B.E. Civil', label: 'Technical Leadership', desc: 'Managed by S.M. Sethu Pandian B.E.' },
              { num: '100%', label: 'Quality Assurance', desc: 'House, Lodge & Commercial projects' },
              { num: 'Rameswaram', label: 'Local Expertise', desc: 'Located at Thulasi Baba Madam Street' },
              { num: 'Turnkey', label: 'Decoration & Build', desc: 'Tailored interior styling details' }
            ].map((stat, i) => (
              <div key={i} style={{ padding: '10px' }}>
                <h3 style={{ color: 'var(--vgn-gold)', fontSize: '36px', fontWeight: '800', marginBottom: '5px' }}>
                  {stat.num}
                </h3>
                <h4 style={{ color: 'var(--vgn-blue-dark)', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                  {stat.label}
                </h4>
                <p style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Legacy Spotlight / About Snapshot */}
      <section className="section-padding" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '60px',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--vgn-gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                EXPERT CIVIL CONTRACTOR
              </span>
              <h2 style={{ fontSize: '32px', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '24px' }}>
                We Build House, Lodge, and Commercial Projects with Engineering Care
              </h2>
              <p style={{ color: 'var(--gray-700)', fontSize: '14px', lineHeight: '1.8', marginBottom: '20px' }}>
                Sree Raam Shethu Construction &amp; Interiors is directed by S.M. Sethu Pandian B.E. We provide professional civil construction and bespoke interior decoration works for properties across Rameswaram, Pamban, and surrounding areas.
              </p>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.8', marginBottom: '30px' }}>
                Our deep familiarity with local building specifications, sea-wind resistance parameters, and structural foundations near Lakshmana Theertham guarantees that your project is durable, legally compliant, and delivered on-budget.
              </p>
              <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award style={{ color: 'var(--vgn-gold)' }} size={24} />
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700' }}>B.E. CERTIFIED</h5>
                    <p style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Solid civil engineering foundations</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle style={{ color: 'var(--vgn-gold)' }} size={24} />
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700' }}>COMPLETE DECOR</h5>
                    <p style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Turnkey modern interior styling</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  border: '10px solid var(--vgn-blue-light)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: 'var(--card-shadow)',
                  height: '400px'
                }}
              >
                <iframe
                  title="Sree Raam Shethu Office Location"
                  src="https://maps.google.com/maps?q=12/15c%20Thulasi%20Baba%20Madam%20Street,%20Rameswaram&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              {/* Badge Overlay - Positioned Top Right */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'var(--vgn-blue-dark)',
                  color: 'var(--white)',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  borderLeft: '4px solid var(--vgn-gold)',
                  pointerEvents: 'none'
                }}
              >
                <h4 style={{ color: 'var(--vgn-gold)', fontSize: '16px', fontWeight: '800' }}>RAMESWARAM</h4>
                <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Office Location</p>
              </div>

              {/* Get Directions Button */}
              <div style={{ marginTop: '16px' }}>
                <a
                  href="https://maps.app.goo.gl/vpLk7orWfTrsPH6f7?g_st=aw"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-vgn btn-vgn-gold"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    boxShadow: '0 4px 15px rgba(18, 117, 70, 0.12)'
                  }}
                >
                  <MapPin size={14} /> GET DIRECTIONS ON GOOGLE MAPS
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tabbed Project Showcase */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--vgn-gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              OUR ACTIVE SITES
            </span>
            <h2 style={{ fontSize: '32px', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '30px' }}>
              Featured Local Projects
            </h2>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--white)',
                padding: '6px',
                borderRadius: '4px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                gap: '5px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              {['Ongoing', 'Ready to Move-in', 'Upcoming', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  style={{
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    background: activeTab === status ? 'var(--vgn-blue-dark)' : 'transparent',
                    color: activeTab === status ? 'var(--white)' : 'var(--vgn-blue-dark)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {status === 'Ready to Move-in' ? 'Ready to Handover' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Project List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px'
            }}
          >
            <AnimatePresence>
              {tabFilteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="vgn-card"
                  style={{ position: 'relative' }}
                >
                  {/* Status Badge */}
                  <span className={`vgn-badge bg-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {project.status === 'Ready to Move-in' ? 'Ready to Handover' : project.status}
                  </span>

                  <div style={{ height: '240px', overflow: 'hidden' }}>
                    <img
                      src={project.image}
                      alt={project.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.06)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>

                  <div style={{ padding: '24px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--gray-500)', fontSize: '11px', marginBottom: '8px', fontWeight: '600' }}>
                      <MapPin size={12} style={{ color: 'var(--vgn-gold)' }} /> {project.location}, Tamil Nadu
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--vgn-blue-dark)', marginBottom: '8px' }}>
                      {project.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                      {project.type}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', marginBottom: '20px' }}>
                      {project.desc}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--gray-100)',
                        paddingTop: '16px'
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '850', color: 'var(--vgn-blue-dark)' }}>
                        {project.price}
                      </span>
                      <button
                        onClick={onRequestQuote}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--vgn-gold)',
                          fontWeight: '700',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        INQUIRE <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. Business Divisions Grid */}
      <section className="section-padding" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--vgn-gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              OUR DOMAIN CAPABILITIES
            </span>
            <h2 style={{ fontSize: '32px', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '15px' }}>
              Core Execution Verticals
            </h2>
            <p style={{ color: 'var(--gray-500)', maxWidth: '600px', margin: '0 auto', fontSize: '14px' }}>
              Providing comprehensive, high-durability contracting options matching your specific build needs.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px'
            }}
          >
            {divisionsData.map((div, i) => (
              <div
                key={i}
                className="vgn-card"
                style={{
                  height: '350px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  cursor: 'pointer'
                }}
                onClick={() => onNavigate('sectors')}
              >
                {/* Background Div */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0, right: 0,
                    backgroundImage: `url(${div.bg || (
                      div.title.toLowerCase().includes('house') ? 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=cover&w=500&q=80' :
                        div.title.toLowerCase().includes('lodge') ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=500&q=80' :
                          div.title.toLowerCase().includes('commercial') ? 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=cover&w=500&q=80' :
                            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=cover&w=500&q=80'
                    )})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 1
                  }}
                />
                {/* Tint Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(26, 26, 46, 0.92) 0%, rgba(26, 26, 46, 0.35) 100%)',
                    zIndex: 2
                  }}
                />

                <div style={{ position: 'relative', zIndex: 3, padding: '24px', textAlign: 'left' }}>
                  <h3 style={{ color: 'var(--white)', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
                    {div.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.6', marginBottom: '15px' }}>
                    {div.desc}
                  </p>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--vgn-gold)',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    LEARN MORE <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Quick Lead Inquiry Form */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '4px',
              boxShadow: 'var(--card-shadow)',
              padding: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--vgn-gold)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                HAVE A QUESTION?
              </span>
              <h2 style={{ fontSize: '28px', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '15px' }}>
                Speak to S.M. Sethu Pandian B.E.
              </h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.7', marginBottom: '25px' }}>
                Provide your mobile number and details about your land, preferred build style, or decoration works and we will get back to you with structural drafts.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Phone size={16} style={{ color: 'var(--vgn-gold)' }} />
                  <span><strong>Call Support:</strong> +91 9566615030</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Mail size={16} style={{ color: 'var(--vgn-gold)' }} />
                  <span><strong>Email Inquiry:</strong> sreeraamconstruction@gmail.com</span>
                </div>
              </div>
            </div>

            <div>
              {!callbackSubmitted ? (
                <form onSubmit={handleCallbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Your Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter your full name"
                      className="vgn-input"
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Mobile Number</label>
                    <input
                      required
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      className="vgn-input"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-vgn btn-vgn-gold" style={{ marginTop: '10px' }}>
                    REQUEST CALL BACK
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '30px 10px' }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--vgn-blue-light)',
                      color: 'var(--vgn-blue-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 15px auto'
                    }}
                  >
                    <CheckCircle size={24} />
                  </div>
                  <h4 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
                    Request Received!
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--gray-500)', lineHeight: '1.6' }}>
                    Thank you <strong>{callbackName}</strong>. We will get in touch on <strong>{callbackPhone}</strong> shortly.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating contact helpers (Phone & WhatsApp triggers) */}
      <div className="quick-inquiry-bar">
        <a href="tel:+919566615030" className="quick-btn" title="Call Sree Raam Shethu Support">
          <Phone size={20} />
        </a>
        <a href="https://wa.me/919566615030" target="_blank" rel="noreferrer" className="quick-btn quick-btn-whatsapp" title="WhatsApp Chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
