import { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, User, Settings, ArrowRight, Bell, BellRing, Mail, CheckCircle, FileText, Clock } from 'lucide-react';
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
  const bellRef = useRef(null);
  const notifPanelRef = useRef(null);

  // Close notification panel when clicking outside button AND panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showClientNotifs) {
        const isOutsideBell = bellRef.current && !bellRef.current.contains(e.target);
        const isOutsidePanel = notifPanelRef.current && !notifPanelRef.current.contains(e.target);
        if (isOutsideBell && isOutsidePanel) {
          setShowClientNotifs(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showClientNotifs]);

  // Format relative time
  const formatRelTime = (ts) => {
    const now = Date.now();
    const diff = now - (typeof ts === 'number' ? ts : new Date(ts).getTime());
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 14) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 8) return `${weeks}w ago`;
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group notifications by time
  const groupedNotifs = (() => {
    const list = asArray(clientNotifications, []);
    const groups = { today: [], yesterday: [], older: [] };
    const now = Date.now();
    const oneDay = 86400000;
    list.forEach(n => {
      const nTime = typeof n.timestamp === 'number' ? n.timestamp : (n.id || now);
      const diff = now - nTime;
      if (diff < oneDay) groups.today.push(n);
      else if (diff < oneDay * 2) groups.yesterday.push(n);
      else groups.older.push(n);
    });
    return groups;
  })();

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
          {/* Inline SVG logo — no external image dependency. Logo img removed to prevent 404 */}
            <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
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
                <div style={{ position: 'relative', marginRight: '10px' }} ref={bellRef}>
                  <button
                    onClick={() => {
                      setShowClientNotifs(prev => !prev);
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
                      ref={notifPanelRef}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 12px)',
                        right: '-60px',
                        width: '360px',
                        maxHeight: '420px',
                        background: 'var(--white)',
                        borderRadius: '12px',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(220, 200, 180, 0.2)',
                        overflow: 'hidden',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left'
                      }}
                    >
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px 18px',
                        borderBottom: '1px solid var(--gray-100)',
                        background: 'var(--bg-light)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BellRing size={14} style={{ color: 'var(--vgn-gold)' }} />
                          <strong style={{ fontSize: '13px', color: 'var(--vgn-blue-dark)' }}>
                            Notifications
                            {clientUnreadCount > 0 && (
                              <span style={{ marginLeft: '6px', color: 'var(--gray-400)', fontWeight: '600', fontSize: '11px' }}>
                                ({clientUnreadCount} new)
                              </span>
                            )}
                          </strong>
                        </div>
                        {clientUnreadCount > 0 && (
                          <button
                            onClick={markClientAllRead}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: 'var(--vgn-gold)',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                        {['today', 'yesterday', 'older'].map(groupKey => {
                          const items = groupedNotifs[groupKey];
                          if (!items || items.length === 0) return null;
                          const groupLabel = groupKey === 'today' ? 'Today' : groupKey === 'yesterday' ? 'Yesterday' : 'Older';
                          return (
                            <div key={groupKey}>
                              <div style={{
                                padding: '8px 18px 4px',
                                fontSize: '10px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                color: 'var(--gray-400)'
                              }}>
                                {groupLabel}
                              </div>
                              {items.map(n => (
                                <div
                                  key={n.id}
                                  style={{
                                    display: 'flex',
                                    gap: '10px',
                                    padding: '10px 18px',
                                    borderBottom: '1px solid var(--gray-100)',
                                    background: n.read ? 'transparent' : 'var(--vgn-blue-light)',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s ease'
                                  }}
                                  onClick={() => markClientAsRead(n.id)}
                                  onMouseEnter={(e) => {
                                    if (n.read) e.currentTarget.style.background = 'var(--bg-light)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (n.read) e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '8px',
                                    background: 'var(--vgn-blue-dark)',
                                    color: 'var(--white)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontSize: '13px',
                                    opacity: n.read ? 0.7 : 1
                                  }}>
                                    {renderNotificationIcon(n.iconName)}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: '12px',
                                      fontWeight: n.read ? '600' : '700',
                                      color: 'var(--vgn-blue-dark)'
                                    }}>
                                      {n.title}
                                    </div>
                                    <div style={{
                                      fontSize: '11px',
                                      color: 'var(--gray-500)',
                                      marginTop: '2px',
                                      lineHeight: '1.4',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}>
                                      {n.message}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '4px' }}>
                                      {formatRelTime(n.timestamp || n.id)}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); dismissClientNotification(n.id); }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--gray-400)',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      padding: '2px 4px',
                                      alignSelf: 'flex-start',
                                      borderRadius: '4px',
                                      transition: 'all 0.15s ease',
                                      lineHeight: 1,
                                      opacity: 0,
                                      transition: 'opacity 0.15s ease'
                                    }}
                                    className="notif-dismiss-btn"
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gray-600)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {asArray(clientNotifications).length === 0 && (
                          <div style={{
                            padding: '40px 18px',
                            textAlign: 'center',
                            color: 'var(--gray-400)',
                            fontSize: '12px'
                          }}>
                            <BellRing size={28} style={{ opacity: 0.3, marginBottom: '10px' }} />
                            <div style={{ fontWeight: '600' }}>No notifications yet</div>
                            <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--gray-400)' }}>
                              Updates from Sree Raam Shethu will appear here
                            </div>
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
