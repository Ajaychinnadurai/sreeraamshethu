import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Award, CheckCircle, ChevronRight, Mail } from 'lucide-react';
import { safeParseJson, asArray } from '../utils/storage';

export default function Home({ onNavigate, onRequestQuote }) {
  // Search state
  const [searchStatus, setSearchStatus] = useState('All');
  const [searchLocation, setSearchLocation] = useState('All');
  const [searchCategory, setSearchCategory] = useState('All');

  // Parallax for hero background
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 180]);

  // Tabbed project preview
  const [activeTab, setActiveTab] = useState('Ongoing');

  // Load dynamic data sets
  const [projectsData, setProjectsData] = useState([]);
  const [divisionsData, setDivisionsData] = useState([]);

  useEffect(() => {
    // Load projects
    const savedProj = localStorage.getItem('sreeraam_projects');
    const parsedProj = safeParseJson(savedProj, null);
    if (parsedProj !== null) {
      setProjectsData(asArray(parsedProj, []));
    } else {
      const defaults = [
        { id: 1, name: 'Laxmana Residency Lodge', location: 'Rameswaram', status: 'Ongoing', category: 'Lodge Construction', price: 'Premium Commercial Fit', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=800&q=80', type: 'Modern Lodge & Guest House', desc: 'Multistory lodge construction featuring standard Dravidian columns base and high-strength concrete framing near Laxmana Theertham.' },
        { id: 2, name: 'Sethu Coastal Villa Enclave', location: 'Pamban', status: 'Ongoing', category: 'House Construction', price: 'High-Quality Civil Build', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', desc: 'Seaside luxury villas constructed using premium local red clay roof tiles and wind-resistant framing structures.' },
        { id: 3, name: 'Rameswaram Tourist Lodge Complex', location: 'Rameswaram', status: 'Ready to Move-in', category: 'Lodge Construction', price: 'Completed Turnkey Project', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=cover&w=800&q=80', type: 'Commercial Lodges', desc: 'Finished premium lodge suites offering spacious ventilation, safety compliance, and parking layouts.' },
        { id: 4, name: 'Thulasi Baba Mansion', location: 'Rameswaram', status: 'Ready to Move-in', category: 'House Construction', price: 'Ready to Handover', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', desc: 'Double story signature bungalow featuring premium teak wood entryways and modern modular layout specs.' },
        { id: 5, name: 'Pamban Sea-View Resort Lodge', location: 'Pamban', status: 'Upcoming', category: 'Lodge Construction', price: 'Planning Phase', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=cover&w=800&q=80', type: 'Boutique Lodge Enclave', desc: 'Upcoming double-winged tourist lodge offering direct sea views, modern recreational zones, and structural integrity audits.' },
        { id: 6, name: 'Temple View Arcade', location: 'Rameswaram', status: 'Completed', category: 'Commercial Civil Build', price: 'Fully Handed Over', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=cover&w=800&q=80', type: 'Commercial Building', desc: 'Premium retail block housing local handicraft stores, complete with heavy-duty structural concrete slabs.' }
      ];
      setProjectsData(defaults);
      localStorage.setItem('sreeraam_projects', JSON.stringify(defaults));
    }

    // Load divisions
    const savedDivs = localStorage.getItem('sreeraam_divisions');
    const parsedDivs = safeParseJson(savedDivs, null);
    if (parsedDivs !== null) {
      setDivisionsData(asArray(parsedDivs, []));
    } else {
      const defaults = [
        { id: 1, title: 'House Construction', desc: 'Bespoke custom homes, family bungalows, and villas designed to withstand local coastal conditions.', bg: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=cover&w=500&q=80' },
        { id: 2, title: 'Lodge Construction', desc: 'Heavy-duty multi-room tourist lodges, hotels, and layout enclaves built near spiritual hubs.', bg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=500&q=80' },
        { id: 3, title: 'Commercial Civil Build', desc: 'Reliable office blocks, retail shopping corridors, and foundational structures matching engineering codes.', bg: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=cover&w=500&q=80' },
        { id: 4, title: 'Interior decoration', desc: 'Fine wood cabinetry, custom modular kitchens, gypsum false ceilings, and premium wall finishes.', bg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=cover&w=500&q=80' }
      ];
      setDivisionsData(defaults);
      localStorage.setItem('sreeraam_divisions', JSON.stringify(defaults));
    }
  }, []);

  // Callback / quick form state
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackName || !callbackPhone) return;
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
    localStorage.setItem('sreeraam_inquiries', JSON.stringify(inquiries));

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
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(adminNotifs));

    setCallbackSubmitted(true);
    setTimeout(() => {
      setCallbackSubmitted(false);
      setCallbackName('');
      setCallbackPhone('');
    }, 4000);
  };

  // Filter projects for the tabbed catalog
  const tabFilteredProjects = asArray(projectsData).filter(p => p.status === activeTab);

  // Dynamic Background Slideshow
  const heroBackgrounds = asArray(projectsData).length > 0 
    ? [...new Set(asArray(projectsData).map(p => p.image))]
    : [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=1600&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=cover&w=1600&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=cover&w=1600&q=80',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=cover&w=1600&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=cover&w=1600&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=cover&w=1600&q=80'
      ];

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (heroBackgrounds.length === 0) return;
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBackgrounds.length]);

  return (
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
        {/* Parallax Background Slideshow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, overflow: 'hidden' }}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={heroBackgrounds[bgIndex]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.55, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '-10%', left: 0, right: 0, bottom: '-10%',
                backgroundImage: `url(${heroBackgrounds[bgIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                width: '100%',
                height: '120%',
                y: heroY
              }}
            />
          </AnimatePresence>
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
              <button onClick={onRequestQuote} className="btn-vgn btn-vgn-outline-white">
                REQUEST CALL BACK
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
                Our deep familiarity with local building specifications, sea-wind resistance parameters, and structural foundations near Laxmana Theertham guarantees that your project is durable, legally compliant, and delivered on-budget.
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
