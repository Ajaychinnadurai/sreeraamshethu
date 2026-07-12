import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { ShieldCheck, Compass, GitMerge, HardHat, ChevronRight } from 'lucide-react';

export default function Services({ onRequestQuote }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const servicesList = [
    {
      title: "Custom Building Design",
      icon: <Compass size={20} />,
      desc: "Creating structural plans and architectural elevations for houses and lodges.",
      details: "Our technical director S.M. Sethu Pandian B.E. drafts and certifies structural elevations. We ensure structural columns match soil characteristics, localized weatherproofing, and Rameswaram municipal guidelines.",
      outputs: ["Architectural 2D & 3D Blueprints", "Soil Load Calculations", "Quotation Cost Sheets"]
    },
    {
      title: "Licensing & Approvals",
      icon: <ShieldCheck size={20} />,
      desc: "Handling local panchayat and municipal planning licenses for commercial lodges.",
      details: "We coordinate end-to-end plan approvals. Sree Raam Shethu prepares necessary documentation for tourist lodging, multi-story permissions, sewage layout checks, and fire safety codes.",
      outputs: ["Local Panchayat Submissions", "Municipal Site Audits Documentation", "Zoning Clearance Checklists"]
    },
    {
      title: "Bespoke Interior Styling",
      icon: <GitMerge size={20} />,
      desc: "Designing modular kitchens, gypsum ceilings, and custom wood styling.",
      details: "Select custom teak wood entries, high-grade modular kitchen countertops, modular wardrobes, and false ceilings. Our decorators assist in custom material selection to match your aesthetic goals.",
      outputs: ["Modular Cabinetry Plans", "Ceiling Lighting Schematics", "Materials Procurement Schedules"]
    },
    {
      title: "On-site Supervision",
      icon: <HardHat size={20} />,
      desc: "Direct monitoring of concrete pours, reinforcement welds, and quality checks.",
      details: "Quality control is our cornerstone. We monitor sand-to-cement ratios on-site, concrete curing periods, steel reinforcement welds, and material compliance certifications.",
      outputs: ["Concrete Curing Verification Logs", "Steel Rebar Audit Reports", "Daily Construction Checklists"]
    }
  ];

  return (
    <>
      <SEO
        title="Services"
        description="Shree Ramsethu Constructions offers house construction, lodge building, commercial civil projects, interior decoration, structural design & licensing in Rameswaram, Tamil Nadu."
        canonical="/services"
      />
    <div className="container" style={{ padding: '50px 0 80px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'left', marginBottom: '60px', maxWidth: '800px' }}>
        <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
          OUR SERVICES
        </span>
        <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '38px', fontWeight: '800', marginBottom: '20px' }}>
          Quality Civil Execution &amp; Styling
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '15px' }}>
          Providing comprehensive design-build services from raw soil tests and structural drawings to final custom interior decors.
        </p>
      </div>

      {/* Interactive Services Grid/Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}
      >
        {/* Left Side: Service List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {servicesList.map((service, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <div
                key={service.title}
                onClick={() => setSelectedIdx(idx)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="vgn-card"
                  style={{
                    padding: '24px',
                    textAlign: 'left',
                    background: isSelected ? 'var(--vgn-blue-dark)' : 'var(--white)',
                    borderColor: isSelected ? 'var(--vgn-blue-dark)' : 'var(--gray-100)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'var(--vgn-blue-light)',
                        color: isSelected ? 'var(--vgn-gold)' : 'var(--vgn-blue-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                    >
                      {service.icon}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontSize: '14px', color: isSelected ? 'var(--white)' : 'var(--vgn-blue-dark)', fontWeight: '800' }}>
                        {service.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--gray-500)', marginTop: '4px' }}>
                        {service.desc}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: isSelected ? 'var(--white)' : 'var(--gray-400)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Details View */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <div
                className="vgn-card"
                style={{
                  padding: '40px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  borderColor: 'var(--gray-100)'
                }}
              >
                <div>
                  <h2 style={{ color: 'var(--vgn-blue-dark)', fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
                    {servicesList[selectedIdx].title}
                  </h2>
                  <p style={{ color: 'var(--gray-700)', fontSize: '14px', lineHeight: '1.8', marginBottom: '25px' }}>
                    {servicesList[selectedIdx].details}
                  </p>

                  <h4 style={{ fontSize: '12px', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Civil Deliverables:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                    {servicesList[selectedIdx].outputs.map((out, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--vgn-gold)', borderRadius: '50%' }} />
                        <span style={{ fontSize: '13px', color: 'var(--gray-800)', fontWeight: '600' }}>
                          {out}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <button onClick={onRequestQuote} className="btn-vgn btn-vgn-gold">
                    BOOK CONSULTATION
                  </button>
                  <a href="tel:+919566615030" className="btn-vgn btn-vgn-blue" style={{ textDecoration: 'none' }}>
                    CALL SALESHOTLINE
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div></>
  );
}
