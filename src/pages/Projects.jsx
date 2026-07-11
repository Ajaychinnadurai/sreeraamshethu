import { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, Filter, Phone, Download, HelpCircle, CheckCircle } from 'lucide-react';
import { safeParseJson, asArray } from '../utils/storage';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Brochure request states
  const [brochureRequested, setBrochureRequested] = useState(false);
  const [brochureEmail, setBrochureEmail] = useState('');

  const [projectsData, setProjectsData] = useState([]);

  useEffect(() => {
    const savedProj = localStorage.getItem('sreeraam_projects');
    const parsed = safeParseJson(savedProj, null);
    if (parsed !== null) {
      setProjectsData(asArray(parsed, []));
    } else {
      const defaults = [
        { id: 1, name: 'Lakshmana Residency Lodge', location: 'Rameswaram', status: 'Ongoing', category: 'Lodge Construction', price: 'Premium Commercial Fit', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=800&q=80', type: 'Modern Lodge & Guest House', area: '8,500 Sq. Ft. Built-up', units: '18 Rooms + Lounge', rera: 'Local Municipal Approved', desc: 'Multistory lodge construction featuring standard Dravidian columns base and high-strength concrete framing near Lakshmana Theertham.', details: 'Lakshmana Residency Lodge is strategically designed to accommodate seasonal pilgrims. Situated in the heart of Rameswaram, it is engineered for multi-story load bearing capacity with localized Dravidian structural columns. Features include concrete framing, energy-saving plumbing lines, and rainwater storage tanks.' },
        { id: 2, name: 'Sethu Coastal Villa Enclave', location: 'Pamban', status: 'Ongoing', category: 'House Construction', price: 'High-Quality Civil Build', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', area: '3,200 Sq. Ft.', units: '3 BHK Dual Floor', rera: 'Panchayat Approved', desc: 'Seaside luxury villas constructed using premium local red clay roof tiles and wind-resistant framing structures.', details: 'Situated on the coastal border of Pamban, this residential custom house build uses specialized anti-corrosive concrete reinforcement to resist salt air. The roof features traditional eco-friendly red clay tiles over a reinforced structural slab, integrating natural cooling layouts.' },
        { id: 3, name: 'Rameswaram Tourist Lodge Complex', location: 'Rameswaram', status: 'Ready to Handover', category: 'Lodge Construction', price: 'Completed Turnkey Project', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=cover&w=800&q=80', type: 'Commercial Lodges', area: '12,000 Sq. Ft.', units: '24 Guest Rooms', rera: 'Municipal Certified', desc: 'Finished premium lodge suites offering spacious ventilation, safety compliance, and parking layouts.', details: 'A completed commercial lodge project offering ready occupancy. Features include high-end ceramic flooring, central ventilation shafts, structural firefighting clearance doors, and dedicated parking allocations for tourist buses.' },
        { id: 4, name: 'Thulasi Baba Mansion', location: 'Rameswaram', status: 'Ready to Handover', category: 'House Construction', price: 'Completed Site', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', area: '2,800 Sq. Ft.', units: '4 BHK Independent', rera: 'Approved Plan', desc: 'Double story signature bungalow featuring premium teak wood entryways and modern modular layout specs.', details: 'This custom house project incorporates fine interior decoration works. Finished with teak wood frame work, modular granite counter kitchen, fall ceilings with integrated LED lighting, and high-quality premium paint coat.' },
        { id: 5, name: 'Pamban Sea-View Resort Lodge', location: 'Pamban', status: 'Upcoming', category: 'Lodge Construction', price: 'Planning Phase', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=cover&w=800&q=80', type: 'Boutique Lodge Enclave', area: '15,000 Sq. Ft.', units: '30 Deluxe Rooms', rera: 'Approvals Pending', desc: 'Upcoming double-winged tourist lodge offering direct sea views, modern recreational zones, and structural integrity audits.', details: 'An upcoming luxury lodge project in Pamban. Engineered with specialized deep pile foundations to address seaside soil shifting, it features structural balconies and expansive dining lounges.' },
        { id: 6, name: 'Temple View Arcade', location: 'Rameswaram', status: 'Completed', category: 'Commercial Civil Build', price: 'Fully Handed Over', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=cover&w=800&q=80', type: 'Commercial Building', area: '6,400 Sq. Ft.', units: '8 Retail Outlets', rera: 'Municipal Approved', desc: 'Premium retail block housing local handicraft stores, complete with heavy-duty structural concrete slabs.', details: 'A fully delivered commercial building civil construction. The block includes modular retail shutters, heavy-duty electrical wiring panels, and a high-load concrete terrace floor optimized for future vertical expansion.' }
      ];
      setProjectsData(defaults);
      localStorage.setItem('sreeraam_projects', JSON.stringify(defaults));
    }
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
    setBrochureRequested(true);
    setTimeout(() => {
      setBrochureRequested(false);
      setBrochureEmail('');
    }, 4500);
  };

  if (selectedProject) {
    return (
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
          {/* Gallery / Image Frame */}
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
              <img
                src={selectedProject.image}
                alt={selectedProject.name}
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
              <span className={`vgn-badge bg-${selectedProject.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {selectedProject.status}
              </span>
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
      </div>
    );
  }

  return (
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
          )}
      </div>
    </div>
  );
}
