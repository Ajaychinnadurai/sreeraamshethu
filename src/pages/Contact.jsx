import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { safeParseJson, asArray } from '../utils/storage';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', project: 'General Inquiry', message: '' });
  const [msgSubmitted, setMsgSubmitted] = useState(false);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    // Save to inquiries
    const rawInq = safeParseJson(localStorage.getItem('sreeraam_inquiries'), []);
    const inquiries = asArray(rawInq, []);
    inquiries.push({
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      project: formData.project || 'General Inquiry',
      message: formData.message,
      date: 'Just now'
    });
    localStorage.setItem('sreeraam_inquiries', JSON.stringify(inquiries));

    // Save persistent admin notification
    const rawNotifs = safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []);
    const adminNotifs = asArray(rawNotifs, []);
    adminNotifs.unshift({
      id: Date.now() + Math.random(),
      iconName: 'mail',
      title: 'New Contact Message',
      message: `${formData.name} sent message: "${formData.message.substring(0, 40)}${formData.message.length > 40 ? '...' : ''}"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(adminNotifs));

    setMsgSubmitted(true);
  };

  const referenceNum = useMemo(() => Math.floor(1000 + Math.random() * 9000), []);

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
    <div className="container" style={{ padding: '50px 0 80px 0' }}>
      {/* Header */}
      <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
          CONTACT OFFICE
        </span>
        <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '38px', fontWeight: '800', marginBottom: '20px' }}>
          Connect with Sree Raam Shethu
        </h1>
        <p style={{ color: 'var(--gray-600)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Have an inquiry about a house build, lodge project, or interior decoration? Reach out to S.M. Sethu Pandian B.E. directly.
        </p>
      </motion.div>

      {/* Grid: 3 Contact Info Cards */}
      <motion.div
        {...stagger}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}
      >
        {[
          {
            icon: <Phone size={24} style={{ color: 'var(--vgn-gold)' }} />,
            title: 'Call Support',
            link: 'tel:+919566615030',
            linkText: '+91 9566615030',
            desc: 'Direct line to Sethu Pandian B.E.'
          },
          {
            icon: <Mail size={24} style={{ color: 'var(--vgn-gold)' }} />,
            title: 'Email Us',
            link: 'mailto:sreeraamconstruction@gmail.com',
            linkText: 'sreeraamconstruction@gmail.com',
            desc: 'Send plan files or estimation sheets.'
          },
          {
            icon: <MapPin size={24} style={{ color: 'var(--vgn-gold)' }} />,
            title: 'Headquarters',
            link: '#office',
            linkText: 'Rameswaram, India',
            desc: '12/15c Thulasi Baba Madam Street.'
          }
        ].map((item, i) => (
          <motion.div key={i} {...fadeUpChild} className="vgn-card" style={{ padding: '30px', display: 'flex', gap: '20px', alignItems: 'center', textAlign: 'left' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                background: 'var(--vgn-blue-light)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {item.icon}
            </div>
            <div>
              <h4 style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                {item.title}
              </h4>
              <a
                href={item.link}
                style={{
                  color: 'var(--vgn-blue-dark)',
                  fontWeight: '800',
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                {item.linkText}
              </a>
              <p style={{ fontSize: '11px', color: 'var(--gray-500)', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Layout: Left = Message Form, Right = HQ Details */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px'
        }}
      >
        {/* Left: Message form */}
        <div className="vgn-card" style={{ padding: '40px', background: 'var(--white)' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--vgn-blue-dark)', fontWeight: '800', textAlign: 'left', marginBottom: '8px' }}>
            Write an Inquiry
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px', textAlign: 'left', marginBottom: '30px' }}>
            Specify your site details, measurements, and structural queries.
          </p>

          {!msgSubmitted ? (
            <form onSubmit={handleMessageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Your Name</label>
                <input
                  required
                  type="text"
                  className="vgn-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Mobile Number</label>
                  <input
                    required
                    type="tel"
                    className="vgn-input"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Project Category</label>
                <select
                  className="vgn-input vgn-select"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                >
                  <option value="House Construction">House Construction</option>
                  <option value="Lodge Construction">Lodge Construction</option>
                  <option value="Commercial Civil Build">Commercial Civil Build</option>
                  <option value="Interior decoration">Interior decoration</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px' }}>Your Message</label>
                <textarea
                  required
                  rows="4"
                  className="vgn-input"
                  placeholder="Ask about floor plans, payment schedule, site visits, or custom interior woodwork..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-vgn btn-vgn-blue" style={{ marginTop: '10px', gap: '8px' }}>
                SEND MESSAGE <Send size={14} />
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <CheckCircle size={36} style={{ color: 'var(--vgn-gold)', marginBottom: '15px' }} />
              <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>
                Inquiry Logged!
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                Thank you, <strong>{formData.name}</strong>. S.M. Sethu Pandian B.E. will contact you at <strong>{formData.phone}</strong> soon. Reference: <strong>#SR-{referenceNum}</strong>.
              </p>
              <button onClick={() => setMsgSubmitted(false)} className="btn-vgn btn-vgn-outline-gold">
                Send Another Message
              </button>
            </div>
          )}
        </div>

        {/* Right: Address Details */}
        <div className="vgn-card" style={{ padding: '40px', background: 'var(--vgn-blue-dark)', color: 'var(--white)' }}>
          <h3 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>
            Rameswaram Headquarters
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.7', marginBottom: '30px' }}>
            Visit our local office to review blueprints, structural calculations, and wood samples.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <MapPin size={20} style={{ color: 'var(--vgn-gold)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h5 style={{ color: 'var(--white)', fontSize: '14px', fontWeight: '700' }}>Office Address</h5>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                  12/15c Thulasi Baba Madam Street,<br />
                  Near to Lakshmana Theertham,<br />
                  Rameswaram - 623526, Tamil Nadu, India.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <Clock size={20} style={{ color: 'var(--vgn-gold)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h5 style={{ color: 'var(--white)', fontSize: '14px', fontWeight: '700' }}>Office Hours</h5>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                  Monday to Saturday: 9:00 AM – 6:30 PM (IST)
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div
            style={{
              marginTop: '30px',
              height: '240px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              overflow: 'hidden'
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
                fontWeight: '700'
              }}
            >
              <MapPin size={14} /> GET DIRECTIONS ON GOOGLE MAPS
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
