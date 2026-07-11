import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, User, Send, CheckCircle } from 'lucide-react';

export default function Careers({ currentUser, onNavigate }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem('sreeraam_careers_jobs');
    let parsedJobs = [];
    if (savedJobs) {
      const raw = JSON.parse(savedJobs);
      parsedJobs = Array.isArray(raw) ? raw : [];
    } else {
      parsedJobs = [
        { id: 1, title: 'Site Construction Supervisor', dept: 'Civil Construction', location: 'Rameswaram Site', desc: 'Oversee concrete foundation laying, reinforcement welding quality checks, and manage masonry work schedules.' },
        { id: 2, title: 'Bespoke Carpenter / Installer', dept: 'Interior decoration', location: 'Rameswaram Office / Site', desc: 'Custom teak wood frame fittings, modular kitchen cabinet installations, and modular wardrobe carpentry works.' },
        { id: 3, title: 'Structural CAD Drafter', dept: 'Engineering & Design', location: 'Rameswaram Head Office', desc: 'Prepare 2D/3D building plans, structural elevations, and coordinate approval documents with municipal specifications.' }
      ];
      localStorage.setItem('sreeraam_careers_jobs', JSON.stringify(parsedJobs));
    }
    setJobs(parsedJobs);
    if (parsedJobs.length > 0) {
      setFormData(prev => ({ ...prev, role: parsedJobs[0].title }));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    // Save application to localStorage for complete operational capability
    const savedApps = localStorage.getItem('sreeraam_job_applications');
    const rawApps = savedApps ? JSON.parse(savedApps) : [];
    const currentApps = Array.isArray(rawApps) ? rawApps : [];
    currentApps.push({
      id: Date.now(),
      ...formData,
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem('sreeraam_job_applications', JSON.stringify(currentApps));

    // Save persistent admin notification
    const rawAdminNotifs = JSON.parse(localStorage.getItem('sreeraam_notifications_admin') || '[]');
    const adminNotifs = Array.isArray(rawAdminNotifs) ? rawAdminNotifs : [];
    adminNotifs.unshift({
      id: Date.now() + Math.random(),
      iconName: 'clipboard',
      title: 'New Job Application',
      message: `${formData.name} applied for ${formData.role}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(adminNotifs));
    
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ padding: '50px 0 80px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
          WORK WITH US
        </span>
        <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '38px', fontWeight: '800', marginBottom: '20px' }}>
          Build Your Career with Sree Raam Shethu
        </h1>
        <p style={{ color: 'var(--gray-600)', maxWidth: '600px', margin: '0 auto', fontSize: '15px', lineHeight: '1.7' }}>
          Join Rameswaram's leading construction and interior design team. We offer growth opportunities, direct hands-on civil project experience, and regular incentives.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px'
        }}
      >
        {/* Left: Open Roles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '10px' }}>
            Current Opportunities
          </h2>
          {jobs.map((job, idx) => (
            <div key={idx} className="vgn-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--vgn-blue-light)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Briefcase size={20} style={{ color: 'var(--vgn-gold)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--vgn-blue-dark)', margin: 0 }}>
                    {job.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    {job.dept} &bull; {job.location}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '15px' }}>
                {job.desc}
              </p>
              <button
                onClick={() => {
                  if (!currentUser) {
                    alert('You must log in to submit a job application. Redirecting to the Login portal...');
                    onNavigate('auth');
                    return;
                  }
                  setFormData({ ...formData, role: job.title });
                  const element = document.getElementById('apply-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-vgn btn-vgn-outline-gold"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {/* Right: Apply Form */}
        <div id="apply-section" className="vgn-card" style={{ padding: '40px', background: 'var(--white)', textAlign: 'left', height: 'fit-content' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--vgn-blue-dark)', fontWeight: '800', marginBottom: '8px' }}>
            Submit Resume
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '30px' }}>
            Provide your details below and we will get back to you.
          </p>

          <AnimatePresence mode="wait">
            {!currentUser ? (
              <motion.div
                key="auth-lock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '30px 10px', border: '1px dashed var(--gray-200)', borderRadius: '4px' }}
              >
                <User size={36} style={{ color: 'var(--vgn-gold)', marginBottom: '15px' }} />
                <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>
                  Authentication Required
                </h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Please log in with a client account to submit your resume and background profile.
                </p>
                <button onClick={() => onNavigate('auth')} className="btn-vgn btn-vgn-blue" style={{ width: '100%' }}>
                  Log In / Register
                </button>
              </motion.div>
            ) : !submitted ? (
              <motion.form
                key="apply-form"
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Full Name</label>
                  <input
                    required
                    type="text"
                    className="vgn-input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Email Address</label>
                  <input
                    required
                    type="email"
                    className="vgn-input"
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Desired Role</label>
                  <select
                    className="vgn-input vgn-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {jobs.map((job) => (
                      <option key={job.id || job.title} value={job.title}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Tell us about your background</label>
                  <textarea
                    rows="4"
                    className="vgn-input"
                    placeholder="Specify your years of civil/woodwork experience, local sites managed, and when you can join Sree Raam Shethu..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ resize: 'none' }}
                  />
                </div>

                <button type="submit" className="btn-vgn btn-vgn-blue" style={{ marginTop: '10px', gap: '8px' }}>
                  SUBMIT PROFILE <Send size={14} />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="submitted-success"
                style={{ textAlign: 'center', padding: '30px 10px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle size={36} style={{ color: 'var(--vgn-gold)', marginBottom: '15px' }} />
                <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>
                  Application Uploaded!
                </h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Thank you, <strong>{formData.name}</strong>. We received your application for the <strong>{formData.role}</strong> position.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-vgn btn-vgn-outline-gold">
                  Submit Another Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
