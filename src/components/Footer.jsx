import { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';

export default function Footer({ onNavigate, animSpeed, setAnimSpeed }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  const handleLinkClick = (pageId) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: 'var(--vgn-blue-dark)',
        color: 'rgba(255, 255, 255, 0.8)',
        padding: '80px 0 40px 0',
        fontFamily: 'var(--font-body)',
        borderTop: '4px solid var(--vgn-gold)'
      }}
    >
      <div className="container">
        {/* Top Newsletter & Branding Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '30px',
            paddingBottom: '40px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '60px'
          }}
        >
          <div>
            <h3 style={{ color: 'var(--white)', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
              Stay Updated with SREE RAAM SHETHU Developments
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Subscribe to get details on new launches, ready-to-move projects, and plots.
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0' }}>
                <input
                  required
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flexGrow: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRight: 'none',
                    padding: '12px 16px',
                    color: 'var(--white)',
                    fontSize: '13px',
                    outline: 'none',
                    borderRadius: '2px 0 0 2px'
                  }}
                />
                <button
                  type="submit"
                  className="btn-vgn btn-vgn-gold"
                  style={{
                    padding: '0 24px',
                    fontSize: '12px',
                    borderRadius: '0 2px 2px 0',
                    height: '45px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  SUBSCRIBE
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--vgn-gold)', fontSize: '14px', fontWeight: '700' }}>
                <Check size={16} /> Subscribed successfully!
              </div>
            )}
          </div>
        </div>

        {/* Directory Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '60px'
          }}
        >
          {/* Column 1: Company Profile */}
          <div>
            <h4 style={{ color: 'var(--white)', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px', borderLeft: '3px solid var(--vgn-gold)', paddingLeft: '10px' }}>
              SREE RAAM SHETHU
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '15px' }}>
              We are Rameswaram's leading design and contracting firm, specializing in custom residential builds, lodge construction, commercial civil projects, and complete interior decoration services.
            </p>
            <span style={{ fontSize: '12px', color: 'var(--vgn-gold)', fontWeight: '700' }}>
              Quality &amp; Precision Execution
            </span>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: 'var(--white)', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px', borderLeft: '3px solid var(--vgn-gold)', paddingLeft: '10px' }}>
              QUICK NAVIGATION
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <span onClick={() => handleLinkClick('home')} style={{ cursor: 'pointer' }}>Home</span>
              <span onClick={() => handleLinkClick('projects')} style={{ cursor: 'pointer' }}>Our Projects</span>
              <span onClick={() => handleLinkClick('sectors')} style={{ cursor: 'pointer' }}>Business Divisions</span>
              <span onClick={() => handleLinkClick('about')} style={{ cursor: 'pointer' }}>About Us</span>
              <span onClick={() => handleLinkClick('careers')} style={{ cursor: 'pointer' }}>Careers</span>
              <span onClick={() => handleLinkClick('contact')} style={{ cursor: 'pointer' }}>Contact Sales</span>
            </div>
          </div>

          {/* Column 3: Project Categories */}
          <div>
            <h4 style={{ color: 'var(--white)', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px', borderLeft: '3px solid var(--vgn-gold)', paddingLeft: '10px' }}>
              PROJECT CATEGORIES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <span onClick={() => handleLinkClick('projects')} style={{ cursor: 'pointer' }}>Lodge Constructions</span>
              <span onClick={() => handleLinkClick('projects')} style={{ cursor: 'pointer' }}>Custom House Builds</span>
              <span onClick={() => handleLinkClick('projects')} style={{ cursor: 'pointer' }}>Commercial Complexes</span>
              <span onClick={() => handleLinkClick('projects')} style={{ cursor: 'pointer' }}>Interior decoration</span>
            </div>
          </div>

          {/* Column 4: Address */}
          <div>
            <h4 style={{ color: 'var(--white)', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px', borderLeft: '3px solid var(--vgn-gold)', paddingLeft: '10px' }}>
              OFFICE ADDRESS
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '15px' }}>
              12/15c Thulasi Baba Madam Street,<br />
              Near to Laxmana Theertham,<br />
              Rameswaram - 623526, Tamil Nadu, India.
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              <strong>Phone:</strong> +91 9566615030<br />
              <strong>Email:</strong> sreeraamconstruction@gmail.com
            </p>
          </div>
        </div>

        {/* Disclaimer / RERA Box */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px',
            fontSize: '11px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.45)',
            marginBottom: '40px',
            borderRadius: '4px',
            textAlign: 'justify'
          }}
        >
          <strong>Disclaimer:</strong> The information, images, renders, maps, designs, and dimensions contained in this website are for representational and illustrative purposes only. Actual layout, designs, specifications, prices, and availability are subject to change based on developer discretion and RERA approvals. Customers are advised to review official brochures and sign formal agreements before purchase. All projects are registered with Tamil Nadu RERA.
        </div>

        {/* Bottom Rights */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            paddingTop: '30px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <span>&copy; {new Date().getFullYear()} Sree Raam Shethu Construction &amp; Interiors. All Rights Reserved.</span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span>|</span>
            <span style={{ cursor: 'pointer' }}>Terms of Use</span>
            <span>|</span>
            <span style={{ cursor: 'pointer' }}>Site Map</span>
            <span>|</span>
            {/* Animation Speed Toggle */}
            <button
              onClick={() => {
                const speeds = ['fast', 'normal', 'slow'];
                const idx = speeds.indexOf(animSpeed);
                setAnimSpeed(speeds[(idx + 1) % speeds.length]);
              }}
              title={`Animation speed: ${animSpeed}. Click to change.`}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '3px',
                padding: '4px 10px',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'var(--vgn-gold)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {animSpeed === 'fast' ? '0.25s' : animSpeed === 'normal' ? '0.5s' : '0.8s'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
