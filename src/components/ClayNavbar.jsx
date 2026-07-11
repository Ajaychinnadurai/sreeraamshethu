import { useState, useEffect } from 'react';
import { Menu, X, Phone, User, Settings, ArrowRight, Bell, Mail, CheckCircle, FileText, Clock } from 'lucide-react';
import { asArray } from '../utils/storage';

export default function ClayNavbar({
  activePage,
  setActivePage,
  onRequestQuote,
  onRequestAuth,
  currentUser,
  onLogout,
  clientNotifications = [],
  clientUnreadCount = 0,
  markClientAllRead,
  markClientAsRead,
  dismissClientNotification,
  adminUnreadMessagesCount = 0
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showClientNotifs, setShowClientNotifs] = useState(false);

  useEffect(() => {
    const handleClose = () => setShowClientNotifs(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const navItems = (currentUser && currentUser.role === 'admin') ? [
    { id: 'home', label: 'HOME' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'sectors', label: 'DIVISIONS' },
    { id: 'about', label: 'ABOUT US' },
    { id: 'dashboard', label: 'ADMIN' }
  ] : [
    { id: 'home', label: 'HOME' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'sectors', label: 'DIVISIONS' },
    { id: 'about', label: 'ABOUT US' },
    { id: 'careers', label: 'CAREERS' },
    { id: 'contact', label: 'CONTACT' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (pageId) => {
    if (pageId === 'logout') {
      onLogout();
    } else {
      setActivePage(pageId);
    }
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderNotificationIcon = (iconName) => {
    switch (iconName) {
      case 'check': return <CheckCircle size={14} />;
      case 'file': return <FileText size={14} />;
      case 'clock': return <Clock size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const transparentMode = activePage === 'home' && !scrolled;
  const headerBgColor = scrolled ? 'var(--white)' : (transparentMode ? 'transparent' : 'var(--white)');
  const headerTextColor = transparentMode ? 'var(--white)' : 'var(--vgn-blue-dark)';
  const headerBorder = scrolled ? '1px solid var(--gray-100)' : (transparentMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--gray-100)');
  const shadow = scrolled ? '0 4px 30px rgba(26, 26, 46, 0.1)' : 'none';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: '100%',
        transition: 'all 0.3s ease',
        backgroundColor: headerBgColor,
        borderBottom: headerBorder,
        boxShadow: shadow
      }}
    >

      {/* Main Header navigation */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 30px',
          height: scrolled ? '70px' : '85px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'height 0.3s ease'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            gap: '12px'
          }}
        >
          {/* Logo image with rounded corners */}
            <img
              src="/images/logo.svg"
              alt="SREE RAAM SHETHU"
              style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0, borderRadius: '8px' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; const el = document.getElementById('navbar-inline-logo'); if (el) el.style.display = 'block'; }}
            />
            <svg id="navbar-inline-logo" width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'none' }}>
              {/* Rounded outer box */}
              <rect x="4" y="4" width="92" height="92" rx="18" stroke={transparentMode ? "var(--white)" : "var(--vgn-blue-dark)"} strokeWidth="6" fill="none" />
            
              {/* Tilted bottom ring / perspective base */}
              <path d="M 12 70 C 12 55, 88 55, 88 70 C 88 85, 12 85, 12 70 Z" fill={transparentMode ? "var(--white)" : "var(--vgn-blue-dark)"} />
            
              {/* Left Building */}
              <path d="M 19 33 C 19 32, 20 31, 21 31 L 34 31 L 34 68 L 19 62 Z" fill={transparentMode ? "var(--white)" : "var(--vgn-blue-dark)"} />
              <circle cx="25" cy="40" r="2.2" fill={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} />
              <circle cx="25" cy="48" r="2.2" fill={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} />

              {/* Middle Building with chevron bands */}
              <path d="M 38 27 L 54 18 L 54 62 L 38 71 Z" fill={transparentMode ? "var(--white)" : "var(--vgn-blue-dark)"} />
              {/* Chevron stripes (white overlays) */}
              <path d="M 38 34 L 46 30 L 54 34 L 54 39 L 46 35 L 38 39 Z" fill={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} />
              <path d="M 38 43 L 46 39 L 54 43 L 54 48 L 46 44 L 38 48 Z" fill={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} />
              <path d="M 38 52 L 46 48 L 54 52 L 54 57 L 46 53 L 38 57 Z" fill={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} />
              <path d="M 38 61 L 46 57 L 54 61 L 54 66 L 46 62 L 38 66 Z" fill={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} />

              {/* Right Building column with rounded top */}
              <path d="M 59 17 C 59 14, 65 14, 65 17 L 65 64 L 59 66 Z" fill={transparentMode ? "var(--white)" : "var(--vgn-blue-dark)"} />
              {/* White highlight inside right column */}
              <path d="M 62 17 L 62 60" stroke={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} strokeWidth="1.8" strokeLinecap="round" />
            
              {/* Pin shape extending bottom left */}
              <circle cx="15" cy="74" r="3.2" fill={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} />
              <path d="M 15 74 L 30 68" stroke={transparentMode ? "var(--vgn-blue-dark)" : "var(--white)"} strokeWidth="2.2" />
            </svg>
          {/* Logo Name & Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: '800',
                fontSize: '18px',
                lineHeight: '1.1',
                letterSpacing: '0.5px',
                color: headerTextColor
              }}
            >
              SREE RAAM SHETHU
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: '700',
                letterSpacing: '1px',
                color: transparentMode ? 'rgba(255, 255, 255, 0.7)' : 'var(--vgn-gold)',
                textTransform: 'uppercase',
                marginTop: '2px'
              }}
            >
              CONSTRUCTION &amp; INTERIORS
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '30px',
            height: '100%'
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: '600',
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '10px 0',
                  color: isActive ? 'var(--vgn-gold)' : headerTextColor,
                  position: 'relative',
                  transition: 'color 0.2s ease'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {item.label}
                  {item.id === 'dashboard' && adminUnreadMessagesCount > 0 && (
                    <span
                      style={{
                        marginLeft: '6px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        lineHeight: '1.2'
                      }}
                    >
                      {adminUnreadMessagesCount}
                    </span>
                  )}
                </span>
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: 0,
                      width: '100%',
                      height: '3px',
                      backgroundColor: 'var(--vgn-gold)',
                      borderRadius: '1.5px'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Login / Logout */}
        <div style={{ display: 'none', alignItems: 'center', gap: '15px' }} className="desktop-nav-cta">
          {currentUser ? (
            <>
              {currentUser.role === 'client' && (
                <div style={{ position: 'relative', marginRight: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowClientNotifs(!showClientNotifs);
                    }}
                    style={{
                      position: 'relative',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: transparentMode ? 'var(--white)' : 'var(--vgn-blue-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px'
                    }}
                    title="Notifications"
                  >
                    <Bell size={20} />
                    {clientUnreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '8px',
                          fontWeight: '700',
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(239,68,68,0.4)'
                        }}
                      >
                        {clientUnreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {showClientNotifs && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 15px)',
                        right: '-40px',
                        width: '320px',
                        maxHeight: '380px',
                        background: 'var(--white)',
                        borderRadius: '4px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        border: '1px solid var(--cream-200)',
                        overflow: 'hidden',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                        <strong style={{ fontSize: '12px', color: 'var(--vgn-blue-dark)' }}>Notifications</strong>
                        {clientUnreadCount > 0 && (
                          <button
                            onClick={markClientAllRead}
                            style={{ background: 'none', border: 'none', fontSize: '10px', fontWeight: '700', color: 'var(--vgn-gold)', cursor: 'pointer' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                        {asArray(clientNotifications).length > 0 ? (
                          asArray(clientNotifications).map(n => (
                            <div
                              key={n.id}
                              style={{
                                display: 'flex',
                                gap: '10px',
                                padding: '10px 16px',
                                borderBottom: '1px solid var(--gray-100)',
                                background: n.read ? 'transparent' : 'var(--vgn-blue-light)',
                                cursor: 'pointer'
                              }}
                              onClick={() => markClientAsRead(n.id)}
                            >
                              <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--vgn-blue-dark)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>
                                {renderNotificationIcon(n.iconName)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>{n.title}</div>
                                <div style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: '2px', lineHeight: '1.4' }}>{n.message}</div>
                                <div style={{ fontSize: '9px', color: 'var(--gray-400)', marginTop: '4px' }}>{n.time}</div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissClientNotification(n.id); }}
                                style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '12px', padding: '2px', alignSelf: 'flex-start' }}
                              >
                                &times;
                              </button>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '11px' }}>
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={onLogout}
                className="btn-vgn btn-vgn-outline-gold"
                style={{
                  padding: '10px 20px',
                  fontSize: '12px',
                  borderRadius: '2px',
                  color: transparentMode ? 'var(--white)' : 'var(--vgn-blue-dark)',
                  borderColor: transparentMode ? 'var(--white)' : 'var(--vgn-gold)'
                }}
              >
                LOG OUT
              </button>
            </>
          ) : (
            <button
              onClick={onRequestAuth}
              className="btn-vgn btn-vgn-gold"
              style={{
                padding: '10px 20px',
                fontSize: '12px',
                borderRadius: '2px'
              }}
            >
              LOGIN <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            border: 'none',
            background: 'none',
            color: headerTextColor,
            cursor: 'pointer'
          }}
          className="mobile-toggle"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--white)',
            borderBottom: '2px solid var(--vgn-gold)',
            padding: '20px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            boxShadow: '0 8px 30px rgba(26, 26, 46, 0.14)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    padding: '8px 0',
                    color: isActive ? 'var(--vgn-gold)' : 'var(--vgn-blue-dark)'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {item.label}
                    {item.id === 'dashboard' && adminUnreadMessagesCount > 0 && (
                      <span
                        style={{
                          marginLeft: '6px',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: '700',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          lineHeight: '1.2'
                        }}
                      >
                        {adminUnreadMessagesCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--gray-100)',
              paddingTop: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <a href="tel:+919566615030" style={{ color: 'var(--vgn-blue-dark)', textDecoration: 'none', fontWeight: '600' }}>
                Call: +91 9566615030
              </a>
              <span style={{ color: 'var(--vgn-gold)', fontWeight: '600' }}>Rameswaram</span>
            </div>
            {currentUser ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="btn-vgn btn-vgn-outline-gold"
                style={{ width: '100%', borderRadius: '2px' }}
              >
                LOG OUT
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onRequestAuth();
                }}
                className="btn-vgn btn-vgn-blue"
                style={{ width: '100%', borderRadius: '2px' }}
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Media Queries Styling */}
      <style>{`
        @media (min-width: 992px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-nav-cta {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .top-bar {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
