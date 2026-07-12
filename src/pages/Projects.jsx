import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { MapPin, ArrowLeft, Filter, Phone, Download, HelpCircle, CheckCircle, Play } from 'lucide-react';
import { safeParseJson, asArray, saveLocalAndCloud, initializeDb } from '../utils/storage';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Brochure request states
  const [brochureRequested, setBrochureRequested] = useState(false);
  const [brochureEmail, setBrochureEmail] = useState('');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(-1); // -1 = show image, 0+ = show video

  const [projectsData, setProjectsData] = useState([]);

  useEffect(() => {
    const defaults = [];

    const loadData = () => {
      const savedProj = localStorage.getItem('sreeraam_projects');
      setProjectsData(savedProj ? safeParseJson(savedProj, []) : defaults);
    };

    initializeDb('sreeraam_projects', defaults);

    loadData();
    window.addEventListener('sreeraam_db_update', loadData);
    return () => window.removeEventListener('sreeraam_db_update', loadData);
  }, []);

  // Filtering Logic
  const filteredProjects = asArray(projectsData)
    .filter(project => {
      const matchesStatus = filterStatus === 'All' || project.status === filterStatus || (filterStatus === 'Ready to Move-in' && project.status === 'Ready to Handover');
      const matchesLocation = filterLocation === 'All' || project.location === filterLocation;
      const matchesCategory = filterCategory === 'All' || project.category === filterCategory;
      return matchesStatus && matchesLocation && matchesCategory;
    })
    .slice()
    .sort((a, b) => b.id - a.id);

  const handleBrochureSubmit = (e) => {
    e.preventDefault();
    if (!brochureEmail) return;

    // Save inquiry so admin can follow up
    const inquiries = asArray(safeParseJson(localStorage.getItem('sreeraam_inquiries'), []), []);
    inquiries.push({
      id: Date.now(),
      name: brochureEmail.split('@')[0] || 'Website Visitor',
      phone: brochureEmail,
      project: selectedProject ? selectedProject.name : 'Project Details Request',
      message: `Requested project details for ${selectedProject ? selectedProject.name : 'an unspecified project'}. Email: ${brochureEmail}`,
      date: 'Just now'
    });
    saveLocalAndCloud('sreeraam_inquiries', inquiries);

    // Save persistent admin notification
    const adminNotifs = asArray(safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []), []);
    adminNotifs.unshift({
      id: Date.now() + Math.random(),
      iconName: 'mail',
      title: 'Project Detail Request',
      message: `${brochureEmail} requested brochure for ${selectedProject ? selectedProject.name : 'a project'}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    saveLocalAndCloud('sreeraam_notifications_admin', adminNotifs);

    setBrochureRequested(true);
    setTimeout(() => {
      setBrochureRequested(false);
      setBrochureEmail('');
    }, 4500);
  };

  if (selectedProject) {
    return (
      <>
        <SEO
          title={`${selectedProject.name} | Projects`}
          description={`${selectedProject.name} — ${selectedProject.type} by Shree Ramsethu Constructions in ${selectedProject.location}. ${selectedProject.desc}`}
          canonical="/projects"
          image={selectedProject.image}
        />
      <div className="container" style={{ padding: '40px 0 80px 0' }}>
        <button
          onClick={() => setSelectedProject(null)}
          className="btn-vgn btn-vgn-blue"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', padding: '10px 20px', fontSize: '12px' }}
        >
          <ArrowLeft size={14} /> Back to Property Catalog
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px',
            textAlign: 'left'
          }}
        >
          {/* Gallery / Image Frame with Video Support */}
          <div>
            <div
              style={{
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
                marginBottom: '20px'
              }}
            >
              {/* Show video if selected, otherwise show image */}
              {selectedVideoIndex >= 0 && selectedProject.videos && selectedProject.videos.length > 0 && selectedProject.videos[selectedVideoIndex] ? (
                <div style={{ position: 'relative', width: '100%', height: '400px', background: '#000' }}>
                  <iframe
                    src={selectedProject.videos[selectedVideoIndex]}
                    title={`${selectedProject.name} Video ${selectedVideoIndex + 1}`}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              )}
              <span className={`vgn-badge bg-${selectedProject.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {selectedProject.status}
              </span>
            </div>

            {/* Media switcher: show image + video thumbnails */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {/* Image thumbnail */}
              <div
                onClick={() => setSelectedVideoIndex(-1)}
                style={{
                  width: '80px',
                  height: '56px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedVideoIndex === -1 ? '3px solid var(--vgn-gold)' : '2px solid var(--gray-200)',
                  opacity: selectedVideoIndex === -1 ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <img src={selectedProject.image} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {/* Video thumbnails */}
              {selectedProject.videos && selectedProject.videos.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedVideoIndex(idx)}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '56px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedVideoIndex === idx ? '3px solid var(--vgn-gold)' : '2px solid var(--gray-200)',
                    opacity: selectedVideoIndex === idx ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    background: '#1A1A2E',
                    flexShrink: 0
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                      <polygon points="6,4 20,12 6,20" />
                    </svg>
                  </div>
                  <div style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', background: 'rgba(0,0,0,0.5)', padding: '0 3px', borderRadius: '2px' }}>
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick specifications box */}
            <div
              style={{
                background: 'var(--bg-light)',
                padding: '24px',
                borderRadius: '4px',
                border: '1px solid var(--gray-100)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'block' }}>Approval Status</span>
                <strong style={{ fontSize: '12px', color: 'var(--vgn-blue-dark)' }}>{selectedProject.rera}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'block' }}>Super Area</span>
                <strong style={{ fontSize: '12px', color: 'var(--vgn-blue-dark)' }}>{selectedProject.area}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'block' }}>Category</span>
                <strong style={{ fontSize: '12px', color: 'var(--vgn-blue-dark)' }}>{selectedProject.category}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'block' }}>Layout Specs</span>
                <strong style={{ fontSize: '12px', color: 'var(--vgn-blue-dark)' }}>{selectedProject.units}</strong>
              </div>
            </div>
          </div>

          {/* Details & Inquiries */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              {selectedProject.type} &bull; {selectedProject.location}
            </span>
            <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>
              {selectedProject.name}
            </h1>
            
            <h3 style={{ fontSize: '24px', color: 'var(--vgn-gold)', fontWeight: '800', marginBottom: '25px' }}>
              {selectedProject.price}
            </h3>

            <p style={{ color: 'var(--gray-700)', fontSize: '14px', lineHeight: '1.8', marginBottom: '30px' }}>
              {selectedProject.details}
            </p>

            {/* Request Blueprint Form */}
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--gray-150)',
                boxShadow: 'var(--card-shadow)',
                padding: '30px',
                borderRadius: '4px',
                borderTop: '3px solid var(--vgn-gold)'
              }}
            >
              {!brochureRequested ? (
                <form onSubmit={handleBrochureSubmit}>
                  <h4 style={{ color: 'var(--vgn-blue-dark)', fontSize: '16px', fontWeight: '700', marginBottom: '15px' }}>
                    Request Project Details
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '15px' }}>
                    Enter your email to receive structural plans and estimated quotation sheets.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      required
                      type="email"
                      placeholder="name@domain.com"
                      className="vgn-input"
                      value={brochureEmail}
                      onChange={(e) => setBrochureEmail(e.target.value)}
                    />
                    <button type="submit" className="btn-vgn btn-vgn-gold" style={{ padding: '0 20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Download size={16} /> REQUEST
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <CheckCircle size={24} style={{ color: 'var(--vgn-gold)', marginBottom: '10px' }} />
                  <h5 style={{ color: 'var(--vgn-blue-dark)', fontWeight: '700' }}>Details Dispatched!</h5>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    Check your email inbox at <strong>{brochureEmail}</strong>.
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', alignItems: 'center', fontSize: '13px' }}>
              <Phone size={18} style={{ color: 'var(--vgn-gold)' }} />
              <span>Contact S.M. Sethu Pandian B.E. at <strong>+91 9566615030</strong></span>
            </div>
          </div>
        </div>
      </div></>
    );
  }

  return (
    <>
      <SEO
        title="Projects"
        description="Explore Shree Ramsethu Constructions' project catalog — ongoing house builds, lodge constructions, commercial civil projects & completed sites in Rameswaram & Pamban."
        canonical="/projects"
      />
    <div className="container" style={{ padding: '50px 0 80px 0' }}>
      {/* Title */}
      <div style={{ textAlign: 'left', marginBottom: '40px' }}>
        <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
          SREE RAAM SHETHU PROJECTS
        </span>
        <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '38px', fontWeight: '800', marginBottom: '15px' }}>
          Our Construction Catalog
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', maxWidth: '600px' }}>
          Use the filters below to explore active house, lodge, and commercial civil contracting sites across Rameswaram.
        </p>
      </div>

      {/* Advanced Filters Row */}
      <div
        style={{
          background: 'var(--bg-light)',
          border: '1px solid var(--gray-100)',
          padding: '20px',
          borderRadius: '4px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '40px',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>
          <Filter size={14} style={{ color: 'var(--vgn-gold)' }} /> FILTERS:
        </div>

        {/* Filter 1: Status */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="vgn-input vgn-select"
            style={{ padding: '8px 12px', fontSize: '12px' }}
          >
            <option value="All">All Phases</option>
            <option value="Ongoing">Ongoing Works</option>
            <option value="Ready to Move-in">Ready to Handover</option>
            <option value="Upcoming">Upcoming Launch</option>
            <option value="Completed">Completed Sites</option>
          </select>
        </div>

        {/* Filter 2: Location */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="vgn-input vgn-select"
            style={{ padding: '8px 12px', fontSize: '12px' }}
          >
            <option value="All">All Regions</option>
            <option value="Rameswaram">Rameswaram</option>
            <option value="Pamban">Pamban</option>
          </select>
        </div>

        {/* Filter 3: Category */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="vgn-input vgn-select"
            style={{ padding: '8px 12px', fontSize: '12px' }}
          >
            <option value="All">All Categories</option>
            <option value="House Construction">House Construction</option>
            <option value="Lodge Construction">Lodge Construction</option>
            <option value="Commercial Civil Build">Commercial Civil Build</option>
            <option value="Interior decoration">Interior decoration</option>
          </select>
        </div>
      </div>

      {/* Projects Catalog Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}
      >
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="vgn-card"
                onClick={() => setSelectedProject(project)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={project.image}
                    alt={project.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {project.videos && project.videos.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(26,26,46,0.8)',
                        border: '2px solid var(--vgn-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--vgn-gold)',
                        pointerEvents: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                      }}
                    >
                      <Play size={16} fill="var(--vgn-gold)" style={{ marginLeft: '2px' }} />
                    </div>
                  )}
                  <span className={`vgn-badge bg-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {project.status === 'Ready to Move-in' ? 'Ready to Handover' : project.status}
                  </span>
                </div>
                <div style={{ padding: '20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gray-500)', fontSize: '11px', marginBottom: '6px' }}>
                    <MapPin size={12} style={{ color: 'var(--vgn-gold)' }} /> {project.location}, Tamil Nadu
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>
                    {project.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', marginBottom: '10px' }}>
                    {project.type}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: '1.6', marginBottom: '15px' }}>
                    {project.desc}
                  </p>
                  <div
                    style={{
                      borderTop: '1px solid var(--gray-100)',
                      paddingTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--vgn-blue-dark)' }}>
                      {project.price}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700' }}>
                      DETAILS &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', color: 'var(--gray-500)' }}>
              <HelpCircle size={32} style={{ color: 'var(--gray-300)', marginBottom: '10px' }} />
              <p style={{ fontWeight: '600' }}>No matching projects found.</p>
              <p style={{ fontSize: '12px' }}>Try clearing filters to explore all active builds.</p>
            </div>
          )}        </div>
    </div></>
  );
}
