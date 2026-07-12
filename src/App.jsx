import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, MessageCircle, CheckCircle, FileText, Clock, Bell } from 'lucide-react';
import ClayNavbar from './components/ClayNavbar';
import Footer from './components/Footer';
import ClayModal from './components/ClayModal';
import ClayButton from './components/ClayButton';
import { safeParseJson, asArray } from './utils/storage';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Sectors from './pages/Sectors';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  // Safely initialize user session from localStorage
  const initialUser = (() => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error loading currentUser from localStorage:', e);
      return null;
    }
  })();

  // Safely initialize page route from localStorage, respecting role privileges
  const initialPage = (() => {
    try {
      const savedPage = localStorage.getItem('sreeraam_active_page');
      if (savedPage) {
        if (savedPage === 'dashboard') {
          if (initialUser && initialUser.role === 'admin') return 'dashboard';
          return 'home';
        }
        return savedPage;
      }
    } catch (e) {
      console.error('Error loading activePage from localStorage:', e);
    }
    return 'home';
  })();

  const [currentUser, setCurrentUser] = useState(initialUser);
  const [activePage, setActivePage] = useState(initialPage);

  // Seed default client credentials on initial load
  useEffect(() => {
    try {
      const raw = localStorage.getItem('registeredUsers');
      const users = raw ? JSON.parse(raw) : [];
      if (Array.isArray(users)) {
        if (!users.some(u => u.email.toLowerCase() === 'kumar@mail.com')) {
          users.push({
            name: 'Kumar',
            email: 'kumar@mail.com',
            phone: '9876543210',
            password: 'password'
          });
          localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
      } else {
        localStorage.setItem('registeredUsers', JSON.stringify([{
          name: 'Kumar',
          email: 'kumar@mail.com',
          phone: '9876543210',
          password: 'password'
        }]));
      }
    } catch (e) {
      console.error('Error seeding default client user:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sreeraam_active_page', activePage);
  }, [activePage]);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Client Notifications & Messaging states
  const [clientNotifications, setClientNotifications] = useState([]);
  const clientUnreadCount = clientNotifications.filter(n => !n.read).length;
  const [clientMessages, setClientMessages] = useState([]);
  const [clientNewMsg, setClientNewMsg] = useState('');
  const [clientInquiryStatus, setClientInquiryStatus] = useState(false);
  const [isClientChatOpen, setIsClientChatOpen] = useState(false);

  // Admin Floating Chat states
  const [allMessages, setAllMessages] = useState([]);
  const [selectedAdminClientEmail, setSelectedAdminClientEmail] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const adminChatContainerRef = useRef(null);

  // Auto-scroll admin chat locally
  useEffect(() => {
    if (adminChatContainerRef.current) {
      adminChatContainerRef.current.scrollTop = adminChatContainerRef.current.scrollHeight;
    }
  }, [selectedAdminClientEmail, allMessages]);

  useEffect(() => {
    if (!currentUser) {
      setClientNotifications([]);
      setClientMessages([]);
      setAllMessages([]);
      return;
    }

    if (currentUser.role === 'admin') {
      const loadAllMessages = () => {
        const raw = safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []);
        setAllMessages(asArray(raw, []));
      };
      loadAllMessages();
      const interval = setInterval(loadAllMessages, 3000);
      return () => clearInterval(interval);
    } else {
      const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
      const loadNotifs = () => {
        const saved = localStorage.getItem(key);
        if (saved) {
          setClientNotifications(JSON.parse(saved));
        } else {
          setClientNotifications([]);
          localStorage.setItem(key, JSON.stringify([]));
        }
      };

      const loadMessages = () => {
        const raw = safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []);
        const all = asArray(raw, []);
        const mine = all.filter(m => m.clientEmail === currentUser.email);
        setClientMessages(mine);
      };

      loadNotifs();
      loadMessages();
      const interval = setInterval(() => {
        loadNotifs();
        loadMessages();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const markClientAllRead = () => {
    if (!currentUser) return;
    const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
    const saved = asArray(safeParseJson(localStorage.getItem(key), []), []);
    const updated = saved.map(n => ({ ...n, read: true }));
    localStorage.setItem(key, JSON.stringify(updated));
    setClientNotifications(updated);
  };

  const markClientAsRead = (id) => {
    if (!currentUser) return;
    const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
    const saved = asArray(safeParseJson(localStorage.getItem(key), []), []);
    const updated = saved.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(key, JSON.stringify(updated));
    setClientNotifications(updated);
  };

  const dismissClientNotification = (id) => {
    if (!currentUser) return;
    const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
    const saved = asArray(safeParseJson(localStorage.getItem(key), []), []);
    const updated = saved.filter(n => n.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setClientNotifications(updated);
  };

  const handleClientSendMessage = (e) => {
    e.preventDefault();
    if (!clientNewMsg.trim() || clientInquiryStatus || !currentUser) return;
    const msg = {
      id: Date.now(),
      sender: 'client',
      clientEmail: currentUser.email,
      clientName: currentUser.name,
      text: clientNewMsg.trim(),
      time: 'Just now'
    };
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    all.push(msg);
    localStorage.setItem('sreeraam_chat_messages', JSON.stringify(all));
    setClientMessages(prev => [...prev, msg]);

    // Save persistent admin notification
    const adminNotifs = asArray(safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []), []);
    adminNotifs.unshift({
      id: Date.now() + Math.random(),
      iconName: 'message',
      title: 'New Client Message',
      message: `${currentUser.name}: ${clientNewMsg.trim().substring(0, 60)}${clientNewMsg.trim().length > 60 ? '...' : ''}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(adminNotifs));

    setClientNewMsg('');
    setClientInquiryStatus(true);

     // Simulate auto-reply
    setTimeout(() => {
      const current = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
      const hasAutoReplied = current.some(m => m.clientEmail === currentUser.email && m.text.includes('S.M. Sethu Pandian B.E. will review your note'));
      if (!hasAutoReplied) {
        const reply = {
          id: Date.now(),
          sender: 'admin',
          clientEmail: currentUser.email,
          clientName: currentUser.name,
          text: 'Thank you for your message. S.M. Sethu Pandian B.E. will review your note and respond shortly.',
          time: 'Just now'
        };
        current.push(reply);
        localStorage.setItem('sreeraam_chat_messages', JSON.stringify(current));
        setClientMessages(prev => [...prev, reply]);

        // Save client notification locally
        const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
        const clientNotifs = asArray(safeParseJson(localStorage.getItem(key), []), []);
        clientNotifs.unshift({
          id: Date.now() + Math.random(),
          iconName: 'bell',
          title: 'Auto-Reply Sent',
          message: 'Admin has been notified of your message.',
          time: 'Just now',
          read: false
        });
        localStorage.setItem(key, JSON.stringify(clientNotifs));
        setClientNotifications(clientNotifs);
      }
      setClientInquiryStatus(false);
    }, 3000);
  };

  // Group client threads for Admin chat
  const clientThreads = allMessages.reduce((acc, m) => {
    if (m.clientEmail) {
      if (!acc[m.clientEmail]) {
        acc[m.clientEmail] = { clientEmail: m.clientEmail, clientName: m.clientName || m.clientEmail, messages: [] };
      }
      acc[m.clientEmail].messages.push(m);
    }
    return acc;
  }, {});

  const threadList = Object.values(clientThreads).sort((a, b) => {
    const aLast = a.messages.length > 0 ? a.messages[a.messages.length - 1].id : 0;
    const bLast = b.messages.length > 0 ? b.messages[b.messages.length - 1].id : 0;
    return bLast - aLast;
  });

  const currentThread = threadList.find(t => t.clientEmail === selectedAdminClientEmail);

  const adminUnreadMessagesCount = allMessages.filter(m => m.sender === 'client' && !m.read).length;
  const clientUnreadMessagesCount = clientMessages.filter(m => m.sender === 'admin' && !m.read).length;

  useEffect(() => {
    if (isClientChatOpen && currentUser) {
      if (currentUser.role === 'client') {
        const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
        const updated = all.map(m => (m.clientEmail === currentUser.email && m.sender === 'admin') ? { ...m, read: true } : m);
        localStorage.setItem('sreeraam_chat_messages', JSON.stringify(updated));
        setClientMessages(updated.filter(m => m.clientEmail === currentUser.email));
      }
    }
  }, [isClientChatOpen, currentUser]);

  const handleSelectAdminThread = (email) => {
    setSelectedAdminClientEmail(email);
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    const updated = all.map(m => (m.clientEmail === email && m.sender === 'client') ? { ...m, read: true } : m);
    localStorage.setItem('sreeraam_chat_messages', JSON.stringify(updated));
    setAllMessages(updated);
  };

  const handleAdminSendMessage = (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedAdminClientEmail || !currentUser) return;
    const reply = {
      id: Date.now(),
      sender: 'admin',
      clientEmail: selectedAdminClientEmail,
      clientName: currentThread?.clientName || 'Client',
      text: adminReplyText.trim(),
      time: 'Just now'
    };
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    all.push(reply);
    localStorage.setItem('sreeraam_chat_messages', JSON.stringify(all));
    setAllMessages(all);

    // Save client notification locally so client is notified in their header bell
    const clientKey = `sreeraam_notifications_client_${selectedAdminClientEmail.toLowerCase()}`;
    const clientNotifs = asArray(safeParseJson(localStorage.getItem(clientKey), []), []);
    clientNotifs.unshift({
      id: Date.now() + Math.random(),
      iconName: 'message',
      title: 'New Admin Message',
      message: `Sethu Pandian B.E. replied: "${adminReplyText.trim().substring(0, 45)}${adminReplyText.trim().length > 45 ? '...' : ''}"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    localStorage.setItem(clientKey, JSON.stringify(clientNotifs));

    setAdminReplyText('');
  };

  const [animSpeed, setAnimSpeed] = useState(() => {
    return localStorage.getItem('sreeraam_anim_speed') || 'fast';
  });

  // Sync anim-speed attribute on root and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-anim-speed', animSpeed);
    localStorage.setItem('sreeraam_anim_speed', animSpeed);
  }, [animSpeed]);

  const pageTransitionDur = animSpeed === 'fast' ? 0.3 : animSpeed === 'normal' ? 0.5 : 0.7;

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authKey, setAuthKey] = useState(0);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({ name: '', email: '', sector: 'Lakshmana Residency Lodge', notes: '' });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteFormData.name || !quoteFormData.email) return;
    // Save inquiry to localStorage for admin dashboard
    const inquiries = asArray(safeParseJson(localStorage.getItem('sreeraam_inquiries'), []), []);
    inquiries.push({
      id: Date.now(),
      name: quoteFormData.name,
      phone: quoteFormData.email,
      project: quoteFormData.sector,
      message: quoteFormData.notes || 'Inquiry submitted via booking modal.',
      date: 'Just now'
    });
    localStorage.setItem('sreeraam_inquiries', JSON.stringify(inquiries));

    // Save persistent admin notification
    const adminNotifs = asArray(safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []), []);
    adminNotifs.unshift({
      id: Date.now() + Math.random(),
      iconName: 'mail',
      title: 'New Booking Inquiry',
      message: `${quoteFormData.name} requested quote for ${quoteFormData.sector}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(adminNotifs));

    setQuoteSubmitted(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setActivePage('home');
  };

  const handleUpdateUser = (updatedUser) => {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <Home onNavigate={setActivePage} onRequestQuote={() => setIsQuoteOpen(true)} />;
      case 'about':
        return <About />;
      case 'sectors':
        return <Sectors />;
      case 'services':
        return <Services onRequestQuote={() => setIsQuoteOpen(true)} />;
      case 'projects':
        return <Projects />;
      case 'careers':
        return <Careers currentUser={currentUser} onNavigate={setActivePage} onRequestAuth={() => {
          setAuthKey(k => k + 1);
          setIsAuthOpen(true);
        }} />;
      case 'contact':
        return <Contact />;
      case 'dashboard':
        if (!currentUser) return <Home onNavigate={setActivePage} onRequestQuote={() => setIsQuoteOpen(true)} />;
        return currentUser.role === 'admin' 
          ? <DashboardAdmin user={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
          : <Home onNavigate={setActivePage} onRequestQuote={() => setIsQuoteOpen(true)} />;
      default:
        return <Home onNavigate={setActivePage} onRequestQuote={() => setIsQuoteOpen(true)} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header & Navigation */}
      <ClayNavbar
        activePage={activePage}
        setActivePage={setActivePage}
        onRequestQuote={() => setIsQuoteOpen(true)}
        onRequestAuth={() => {
          setAuthKey(k => k + 1);
          setIsAuthOpen(true);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        clientNotifications={clientNotifications}
        clientUnreadCount={clientUnreadCount}
        markClientAllRead={markClientAllRead}
        markClientAsRead={markClientAsRead}
        dismissClientNotification={dismissClientNotification}
        adminUnreadMessagesCount={adminUnreadMessagesCount}
      />

      {/* 2. Main Page Render with Animated Page Transitions */}
      <main style={{ flexGrow: 1, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: pageTransitionDur, ease: 'easeInOut' }}
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Footer */}
      <Footer onNavigate={setActivePage} animSpeed={animSpeed} setAnimSpeed={setAnimSpeed} />

      {/* 4. Auth Modal */}
      <ClayModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        title="SREE RAAM SHETHU Portal Access"
      >
        <Auth
          key={authKey}
          inModal
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            setIsAuthOpen(false);
            setActivePage(u.role === 'admin' ? 'dashboard' : 'home');
          }}
        />
      </ClayModal>

      {/* 5. Request an Inquiry Modal */}
      <ClayModal
        isOpen={isQuoteOpen}
        onClose={() => {
          setIsQuoteOpen(false);
          setQuoteSubmitted(false);
        }}
        title="SREE RAAM SHETHU Booking & Inquiry"
      >
        <AnimatePresence mode="wait">
          {!quoteSubmitted ? (
            <motion.form
              onSubmit={handleQuoteSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>Full Name</label>
                <input
                  required
                  type="text"
                  className="vgn-input"
                  placeholder="e.g. John Doe"
                  value={quoteFormData.name}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>Email Address</label>
                <input
                  required
                  type="email"
                  className="vgn-input"
                  placeholder="e.g. john@domain.com"
                  value={quoteFormData.email}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>Project Interest</label>
                <select
                  className="vgn-input vgn-select"
                  value={quoteFormData.sector}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, sector: e.target.value })}
                >
                  <option value="Lakshmana Residency Lodge">Lakshmana Residency Lodge (Rameswaram)</option>
                  <option value="Sethu Coastal Villa Enclave">Sethu Coastal Villa Enclave (Pamban)</option>
                  <option value="Rameswaram Tourist Lodge">Rameswaram Tourist Lodge (Rameswaram)</option>
                  <option value="Thulasi Baba Mansion">Thulasi Baba Mansion (Rameswaram)</option>
                  <option value="Pamban Sea-View Resort">Pamban Sea-View Resort (Pamban)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>Specific Questions / Notes</label>
                <textarea
                  rows="3"
                  className="vgn-input"
                  placeholder="Ask about floor plans, payment schedule, site visits, or custom interior woodwork..."
                  value={quoteFormData.notes}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-vgn btn-vgn-gold" style={{ marginTop: '10px' }}>
                Submit Inquiry <Send size={14} />
              </button>
            </motion.form>
          ) : (
            <motion.div
              style={{
                padding: '30px 10px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--vgn-blue-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--vgn-gold)'
                }}
              >
                <Check size={24} />
              </div>
              <h3 style={{ fontSize: '20px', color: 'var(--vgn-blue-dark)', fontWeight: '800' }}>
                Request Registered!
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>
                Thank you, <strong>{quoteFormData.name}</strong>. Sree Raam Shethu Construction will contact you regarding <strong>{quoteFormData.sector}</strong>.
              </p>
              <button
                className="btn-vgn btn-vgn-blue"
                onClick={() => {
                  setIsQuoteOpen(false);
                  setQuoteSubmitted(false);
                }}
              >
                Close Window
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ClayModal>

      {/* 6. Floating Consultation Chat Widget */}
      {currentUser && (currentUser.role === 'client' || currentUser.role === 'admin') && (() => {
        const isMobile = windowWidth <= 576;
        return (
          <div
            style={{
              position: 'fixed',
              bottom: isMobile ? '20px' : '30px',
              right: isMobile ? '20px' : '30px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}
          >
            <AnimatePresence>
              {isClientChatOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  style={{
                    position: isMobile ? 'fixed' : 'absolute',
                    bottom: isMobile ? '95px' : '75px',
                    left: isMobile ? '20px' : 'auto',
                    right: isMobile ? '20px' : '0',
                    width: isMobile ? 'auto' : '370px',
                    height: isMobile ? 'calc(100vh - 150px)' : '500px',
                    maxHeight: isMobile ? '450px' : '500px',
                    background: 'var(--white)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(26, 26, 46, 0.22), 0 8px 24px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(220, 200, 180, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 1001
                  }}
                >
                  {/* Header */}
                  <div style={{ background: 'linear-gradient(135deg, var(--vgn-blue-dark) 0%, #0A0A18 100%)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {currentUser.role === 'admin' && selectedAdminClientEmail ? (
                      <div>
                        <button
                          onClick={() => setSelectedAdminClientEmail(null)}
                          style={{ background: 'none', border: 'none', color: 'var(--vgn-gold)', opacity: 0.9, cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                        >
                          &larr; Back to Threads
                        </button>
                        <h4 style={{ color: 'var(--white)', margin: '4px 0 0 0', fontSize: '14px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{currentThread?.clientName}</h4>
                      </div>
                    ) : (
                      <div>
                        <h4 style={{ color: 'var(--white)', margin: 0, fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{currentUser.role === 'admin' ? 'Client Inbox' : 'Direct Consultation'}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--vgn-gold)', display: 'inline-block' }} />
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '600' }}>
                            {currentUser.role === 'admin' ? 'Conversations threads' : 'S.M. Sethu Pandian B.E.'}
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setIsClientChatOpen(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--white)', opacity: 0.6, cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      &times;
                    </button>
                  </div>

                  {/* Body */}
                  {currentUser.role === 'admin' ? (
                    !selectedAdminClientEmail ? (
                      /* Admin thread list view */
                      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {threadList.length > 0 ? (
                          threadList.map(thread => {
                            const lastMsg = thread.messages[thread.messages.length - 1];
                            return (
                              <div
                                key={thread.clientEmail}
                                onClick={() => handleSelectAdminThread(thread.clientEmail)}
                                style={{
                                  padding: '14px',
                                  background: 'var(--white)',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  border: '1px solid rgba(220, 200, 180, 0.3)',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                  transition: 'all 0.2s ease',
                                  textAlign: 'left'
                                }}
                                className="chat-thread-card"
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <strong style={{ fontSize: '13px', color: 'var(--vgn-blue-dark)' }}>{thread.clientName}</strong>
                                  <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>{lastMsg ? lastMsg.time : ''}</span>
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--gray-400)', display: 'block', marginBottom: '6px' }}>{thread.clientEmail}</span>
                                {lastMsg && (
                                  <p style={{ fontSize: '11px', color: 'var(--gray-500)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {lastMsg.sender === 'admin' ? 'You: ' : ''}{lastMsg.text}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '12px', padding: '20px' }}>
                            No messages yet from clients.
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Admin thread chat view */
                      <>
                        <div ref={adminChatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {currentThread && currentThread.messages.length > 0 ? (
                            currentThread.messages.map((m, i) => {
                              const isAdmin = m.sender === 'admin';
                              return (
                                <div
                                  key={i}
                                  style={{
                                    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                                    background: isAdmin ? 'var(--vgn-blue-dark)' : 'var(--white)',
                                    color: isAdmin ? 'var(--white)' : 'var(--vgn-blue-dark)',
                                    padding: '12px 16px',
                                    borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    maxWidth: '82%',
                                    fontSize: '13px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                    textAlign: 'left',
                                    border: isAdmin ? 'none' : '1px solid rgba(220, 200, 180, 0.3)',
                                    lineHeight: '1.4'
                                  }}
                                 interviewer-comment="nice chat balloon shapes"
                                >
                                  <div>{m.text}</div>
                                  <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                    {isAdmin ? 'You • ' : `${currentThread.clientName} • `} {m.time}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '12px' }}>
                              Start typing a message below.
                            </div>
                          )}
                        </div>

                        <form onSubmit={handleAdminSendMessage} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--gray-100)', background: 'var(--white)' }}>
                          <input
                            type="text"
                            required
                            placeholder="Type reply here..."
                            className="vgn-input"
                            style={{ height: '40px', flex: 1, fontSize: '13px', borderRadius: '20px', padding: '0 16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="btn-vgn btn-vgn-blue"
                            style={{ height: '40px', width: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Send size={14} />
                          </button>
                        </form>
                      </>
                    )
                  ) : (
                    /* Client Chat View */
                    <>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {clientMessages.length > 0 ? (
                          clientMessages.map((m, i) => {
                            const isAdminReply = m.sender === 'admin';
                            return (
                              <div
                                key={i}
                                style={{
                                  alignSelf: isAdminReply ? 'flex-start' : 'flex-end',
                                  background: isAdminReply ? 'var(--white)' : 'var(--vgn-blue-dark)',
                                  color: isAdminReply ? 'var(--vgn-blue-dark)' : 'var(--white)',
                                  padding: '12px 16px',
                                  borderRadius: isAdminReply ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                                  maxWidth: '82%',
                                  fontSize: '13px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                  textAlign: 'left',
                                  border: isAdminReply ? '1px solid rgba(220, 200, 180, 0.3)' : 'none',
                                  lineHeight: '1.4'
                                }}
                              >
                                <div>{m.text}</div>
                                <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                  {isAdminReply ? 'Sethu Pandian B.E. (Admin) • ' : 'You • '} {m.time}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '12px', padding: '20px' }}>
                            Ask about structural elevation updates, teak woodwork customization, or booking schedules below.
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleClientSendMessage} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--gray-100)', background: 'var(--white)' }}>
                        <input
                          type="text"
                          required
                          placeholder="Type message here..."
                          className="vgn-input"
                          style={{ height: '40px', flex: 1, fontSize: '13px', borderRadius: '20px', padding: '0 16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                          value={clientNewMsg}
                          onChange={(e) => setClientNewMsg(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="btn-vgn btn-vgn-blue"
                          style={{ height: '40px', width: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          disabled={clientInquiryStatus}
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Floating trigger button */}
            <button
              onClick={() => setIsClientChatOpen(!isClientChatOpen)}
              style={{
                position: 'relative',
                width: isMobile ? '54px' : '60px',
                height: isMobile ? '54px' : '60px',
                borderRadius: '50%',
                background: 'var(--vgn-blue-dark)',
                border: '2px solid var(--vgn-gold)',
                boxShadow: '0 6px 25px rgba(26, 26, 46, 0.42)',
                color: 'var(--vgn-gold)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                transition: 'transform 0.2s ease'
              }}
              title="Consultation Chat"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <MessageCircle size={isMobile ? 22 : 26} />
              {((currentUser.role === 'client' && clientUnreadMessagesCount > 0) || (currentUser.role === 'admin' && adminUnreadMessagesCount > 0)) && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: '700',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.4)'
                  }}
                >
                  {currentUser.role === 'client' ? clientUnreadMessagesCount : adminUnreadMessagesCount}
                </span>
              )}
            </button>
          </div>
        );
      })()}
    </div>
  );
}

export default App;
