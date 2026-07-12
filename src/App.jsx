import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, MessageCircle, CheckCircle, FileText, Clock, Bell, Paperclip, Mail as MailIcon, Users as UsersIcon, Edit3, Trash2 } from 'lucide-react';
import ClayNavbar from './components/ClayNavbar';
import Footer from './components/Footer';
import ClayModal from './components/ClayModal';
import ClayButton from './components/ClayButton';
import { safeParseJson, asArray, saveLocalAndCloud, startDbSync, initializeDb, supabase, generateUniqueId } from './utils/storage';
import { playNotificationSound } from './utils/sound';
import ToastNotification from './components/ToastNotification';
import SyncStatusBar from './components/SyncStatusBar';
import QuickReplyBar from './components/QuickReplyBar';
import ChatAttachment from './components/ChatAttachment';
import { formatMessageText, renderFormattedParts } from './utils/chatUtils.jsx';
import TypingIndicator from './components/TypingIndicator';
import MessageReactions from './components/MessageReactions';
import { registerAbTestDebugShortcut } from './utils/abTest';
import { identifyUser, resetUser, trackEvent } from './utils/posthog';

// Lazy-loaded page components (code-split at build time)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Sectors = lazy(() => import('./pages/Sectors'));
const Services = lazy(() => import('./pages/Services'));
const Projects = lazy(() => import('./pages/Projects'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const Auth = lazy(() => import('./pages/Auth'));
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'));

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

  // Seed default client credentials on initial load safely
  useEffect(() => {
    initializeDb('sreeraam_projects', []);
    initializeDb('sreeraam_divisions', []);
    initializeDb('sreeraam_about_milestones', []);
    initializeDb('sreeraam_careers_jobs', []);
    initializeDb('sreeraam_inquiries', []);
    initializeDb('sreeraam_job_applications', []);
    initializeDb('sreeraam_chat_messages', []);
    initializeDb('sreeraam_notifications_admin', []);

    initializeDb('registeredUsers', []);
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'client') {
      initializeDb(`sreeraam_notifications_client_${currentUser.email.toLowerCase()}`, []);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sreeraam_active_page', activePage);
  }, [activePage]);

  // Persist user session in localStorage to preserve login state on refresh
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

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
  const [clientAttachment, setClientAttachment] = useState(null);
  const [adminAttachment, setAdminAttachment] = useState(null);
  const [showClientQuickReplies, setShowClientQuickReplies] = useState(true);
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);
  const prevNotifCount = useRef(0);

  const addToast = (notification) => {
    const id = ++toastIdCounter.current;
    setToasts(prev => [...prev, { id, ...notification, timestamp: Date.now() }]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    // Play the notification sound
    playNotificationSound();
  };

  // Detect new notifications and pop a toast
  useEffect(() => {
    if (prevNotifCount.current > 0 && clientNotifications.length > prevNotifCount.current) {
      const newNotifs = clientNotifications.slice(0, clientNotifications.length - prevNotifCount.current);
      newNotifs.forEach(n => {
        if (!n.read) {
          addToast({
            iconName: n.iconName || 'bell',
            title: n.title || 'New Notification',
            message: n.message || ''
          });
        }
      });
    }
    prevNotifCount.current = clientNotifications.length;
  }, [clientNotifications]);

  // Admin Floating Chat states
  const [allMessages, setAllMessages] = useState([]);
  const [selectedAdminClientEmail, setSelectedAdminClientEmail] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Typing indicators state (broadcasted over Realtime Channel)
  const [adminIsTyping, setAdminIsTyping] = useState(false);
  const [clientIsTyping, setClientIsTyping] = useState({}); // clientEmail -> boolean

  const typingChannelRef = useRef(null);

  // Broadcast typing status to other participants
  const sendTypingStatus = (isTyping, targetEmail = null) => {
    if (typingChannelRef.current && supabase) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          email: currentUser.email,
          role: currentUser.role,
          isTyping,
          targetEmail
        }
      });
    }
  };

  // Realtime Broadcast Listener for typing status
  useEffect(() => {
    if (!currentUser || !supabase) return;

    const channel = supabase.channel('chat-typing');
    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { email, role, isTyping, targetEmail } = payload;
        if (role === 'admin' && currentUser.role === 'client') {
          if (targetEmail?.toLowerCase() === currentUser.email.toLowerCase()) {
            setAdminIsTyping(isTyping);
          }
        } else if (role === 'client' && currentUser.role === 'admin') {
          setClientIsTyping(prev => ({ ...prev, [email.toLowerCase()]: isTyping }));
        }
      })
      .subscribe();

    typingChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
    };
  }, [currentUser]);

  // Broadcast admin typing status
  useEffect(() => {
    if (currentUser?.role !== 'admin' || !selectedAdminClientEmail) return;
    const isTyping = adminReplyText.trim().length > 0;
    sendTypingStatus(isTyping, selectedAdminClientEmail);
  }, [adminReplyText, selectedAdminClientEmail, currentUser]);

  // Broadcast client typing status
  useEffect(() => {
    if (currentUser?.role !== 'client') return;
    const isTyping = clientNewMsg.trim().length > 0;
    sendTypingStatus(isTyping);
  }, [clientNewMsg, currentUser]);
  // Play notification sound on new incoming chat messages
  const prevLastMsgId = useRef(0);
  useEffect(() => {
    if (!currentUser) return;
    
    const msgs = currentUser.role === 'admin' ? allMessages : clientMessages;
    if (msgs.length === 0) {
      prevLastMsgId.current = 0;
      return;
    }
    
    const lastMsg = msgs[msgs.length - 1];
    const otherSender = currentUser.role === 'admin' ? 'client' : 'admin';
    
    if (prevLastMsgId.current > 0 && lastMsg.id > prevLastMsgId.current && lastMsg.sender === otherSender) {
      playNotificationSound();
    }
    
    prevLastMsgId.current = lastMsg.id;
  }, [allMessages, clientMessages, currentUser]);

  const adminChatContainerRef = useRef(null);
  const clientChatContainerRef = useRef(null);

  // Auto-scroll admin chat locally
  useEffect(() => {
    if (adminChatContainerRef.current) {
      adminChatContainerRef.current.scrollTop = adminChatContainerRef.current.scrollHeight;
    }
  }, [selectedAdminClientEmail, allMessages, isClientChatOpen]);

  // Auto-scroll client chat locally
  useEffect(() => {
    if (clientChatContainerRef.current) {
      clientChatContainerRef.current.scrollTop = clientChatContainerRef.current.scrollHeight;
    }
  }, [clientMessages, isClientChatOpen]);

  // Start background database sync loop
  useEffect(() => {
    const keys = [
      'sreeraam_projects',
      'sreeraam_divisions',
      'sreeraam_about_milestones',
      'sreeraam_careers_jobs',
      'sreeraam_inquiries',
      'sreeraam_job_applications',
      'sreeraam_chat_messages',
      'registeredUsers',
      'sreeraam_notifications_admin'
    ];
    if (currentUser && currentUser.role === 'client') {
      keys.push(`sreeraam_notifications_client_${currentUser.email.toLowerCase()}`);
    }
    const stopSync = startDbSync(keys);
    return () => stopSync();
  }, [currentUser]);

  // Listen to background sync updates to update state reactively
  useEffect(() => {
    if (!currentUser) {
      setClientNotifications([]);
      setClientMessages([]);
      setAllMessages([]);
      return;
    }

    const loadData = () => {
      if (currentUser.role === 'admin') {
        const raw = safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []);
        setAllMessages(asArray(raw, []));
      } else {
        const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
        const savedNotifs = localStorage.getItem(key);
        setClientNotifications(savedNotifs ? safeParseJson(savedNotifs, []) : []);

        const rawMsgs = safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []);
        const all = asArray(rawMsgs, []);
        const mine = all.filter(m => m.clientEmail === currentUser.email);
        setClientMessages(mine);
      }
    };

    loadData();
    window.addEventListener('sreeraam_db_update', loadData);
    return () => window.removeEventListener('sreeraam_db_update', loadData);
  }, [currentUser]);

  const markClientAllRead = () => {
    if (!currentUser) return;
    const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
    const saved = asArray(safeParseJson(localStorage.getItem(key), []), []);
    const updated = saved.map(n => ({ ...n, read: true }));
    saveLocalAndCloud(key, updated);
    setClientNotifications(updated);
  };

  const markClientAsRead = (id) => {
    if (!currentUser) return;
    const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
    const saved = asArray(safeParseJson(localStorage.getItem(key), []), []);
    const updated = saved.map(n => n.id === id ? { ...n, read: true } : n);
    saveLocalAndCloud(key, updated);
    setClientNotifications(updated);
  };

  const dismissClientNotification = (id) => {
    if (!currentUser) return;
    const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
    const saved = asArray(safeParseJson(localStorage.getItem(key), []), []);
    const updated = saved.filter(n => n.id !== id);
    saveLocalAndCloud(key, updated);
    setClientNotifications(updated);
  };

  const handleQuickReplySend = (text) => {
    if (!currentUser) return;
    setClientNewMsg(text);
    // Auto-send after a brief delay for the input to update
    setTimeout(() => {
      sendMessage(text, false);
    }, 50);
  };

  const sendMessage = (text, hasAttachment) => {
    if (!text.trim() || clientInquiryStatus || !currentUser) return;
    const msg = {
      id: Date.now(),
      sender: 'client',
      clientEmail: currentUser.email,
      clientName: currentUser.name,
      text: text.trim(),
      time: 'Just now',
      attachment: hasAttachment && clientAttachment ? { ...clientAttachment } : null
    };

    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    all.push(msg);
    saveLocalAndCloud('sreeraam_chat_messages', all);
    setClientMessages(prev => [...prev, msg]);

    // Save persistent admin notification
    const adminNotifs = asArray(safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []), []);
    adminNotifs.unshift({
      id: generateUniqueId(),
      iconName: 'message',
      title: 'New Client Message',
      message: `${currentUser.name}: ${text.trim().substring(0, 60)}${text.trim().length > 60 ? '...' : ''}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    saveLocalAndCloud('sreeraam_notifications_admin', adminNotifs);

    setClientNewMsg('');
    setClientAttachment(null);
    setClientInquiryStatus(true);
    setShowClientQuickReplies(false);

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
        saveLocalAndCloud('sreeraam_chat_messages', current);
        setClientMessages(prev => [...prev, reply]);

        const key = `sreeraam_notifications_client_${currentUser.email.toLowerCase()}`;
        const clientNotifs = asArray(safeParseJson(localStorage.getItem(key), []), []);
        clientNotifs.unshift({
          id: generateUniqueId(),
          iconName: 'bell',
          title: 'Auto-Reply Sent',
          message: 'Admin has been notified of your message.',
          time: 'Just now',
          read: false
        });
        saveLocalAndCloud(key, clientNotifs);
        setClientNotifications(clientNotifs);
      }
      setClientInquiryStatus(false);
      // Re-enable quick replies after auto-reply
      setTimeout(() => setShowClientQuickReplies(true), 2000);
    }, 3000);
  };

  const handleClientSendMessage = (e) => {
    e.preventDefault();
    if (!clientNewMsg.trim() || clientInquiryStatus || !currentUser) return;
    sendMessage(clientNewMsg, !!clientAttachment);
  };

  // Thread search state
  const [threadSearchQuery, setThreadSearchQuery] = useState('');

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

  // Filter threads by search query
  const filteredThreadList = Object.values(clientThreads).filter(t => {
    if (!threadSearchQuery.trim()) return true;
    const q = threadSearchQuery.toLowerCase();
    return t.clientName?.toLowerCase().includes(q) || t.clientEmail?.toLowerCase().includes(q);
  });

  const threadList = filteredThreadList.sort((a, b) => {
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
        saveLocalAndCloud('sreeraam_chat_messages', updated);
        setClientMessages(updated.filter(m => m.clientEmail === currentUser.email));
      }
    }
  }, [isClientChatOpen, currentUser]);

  const MSG_EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  const isWithinEditWindow = (msgId) => {
    const age = Date.now() - (typeof msgId === 'number' ? msgId : 0);
    return age < MSG_EDIT_WINDOW_MS;
  };

  const handleEditMessage = (messageId, newText) => {
    if (!newText.trim() || !currentUser) return;
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    const updated = all.map(m => {
      if (m.id !== messageId) return m;
      return { ...m, text: newText.trim(), edited: true, editedAt: Date.now() };
    });
    saveLocalAndCloud('sreeraam_chat_messages', updated);
    setAllMessages(updated);
    if (currentUser.role === 'client') {
      setClientMessages(updated.filter(m => m.clientEmail === currentUser.email));
    }
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId) => {
    if (!currentUser) return;
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    const updated = all.map(m => {
      if (m.id !== messageId) return m;
      return { ...m, deleted: true, text: '', attachment: null };
    });
    saveLocalAndCloud('sreeraam_chat_messages', updated);
    setAllMessages(updated);
    if (currentUser.role === 'client') {
      setClientMessages(updated.filter(m => m.clientEmail === currentUser.email));
    }
  };

  const handleToggleReaction = (messageId, emoji) => {
    if (!currentUser) return;
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    const updated = all.map(m => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      const users = [...(reactions[emoji] || [])];
      const userIdx = users.findIndex(u => u.toLowerCase() === currentUser.email.toLowerCase());
      if (userIdx >= 0) {
        users.splice(userIdx, 1);
        if (users.length === 0) delete reactions[emoji];
        else reactions[emoji] = users;
      } else {
        reactions[emoji] = [...(reactions[emoji] || []), currentUser.email];
      }
      return { ...m, reactions };
    });
    saveLocalAndCloud('sreeraam_chat_messages', updated);
    setAllMessages(updated);
    if (currentUser.role === 'client') {
      setClientMessages(updated.filter(m => m.clientEmail === currentUser.email));
    }
  };

  const handleSelectAdminThread = (email) => {
    setSelectedAdminClientEmail(email);
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    const updated = all.map(m => (m.clientEmail === email && m.sender === 'client') ? { ...m, read: true } : m);
    saveLocalAndCloud('sreeraam_chat_messages', updated);
    setAllMessages(updated);
  };

  const handleAdminSendMessage = (e) => {
    e.preventDefault();
    if ((!adminReplyText.trim() && !adminAttachment) || !selectedAdminClientEmail || !currentUser) return;
    const reply = {
      id: Date.now(),
      sender: 'admin',
      clientEmail: selectedAdminClientEmail,
      clientName: currentThread?.clientName || 'Client',
      text: adminReplyText.trim() || '(Attachment)',
      time: 'Just now',
      attachment: adminAttachment ? { ...adminAttachment } : null
    };
    const all = asArray(safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []), []);
    all.push(reply);
    saveLocalAndCloud('sreeraam_chat_messages', all);
    setAllMessages(all);

    // Save client notification locally so client is notified in their header bell
    const clientKey = `sreeraam_notifications_client_${selectedAdminClientEmail.toLowerCase()}`;
    const clientNotifs = asArray(safeParseJson(localStorage.getItem(clientKey), []), []);
    clientNotifs.unshift({
      id: generateUniqueId(),
      iconName: 'message',
      title: 'New Admin Message',
      message: adminReplyText.trim() 
        ? `Sethu Pandian B.E. replied: "${adminReplyText.trim().substring(0, 45)}${adminReplyText.trim().length > 45 ? '...' : ''}"` 
        : 'Sethu Pandian B.E. sent an attachment.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    saveLocalAndCloud(clientKey, clientNotifs);

    setAdminReplyText('');
    setAdminAttachment(null);
  };

  const [animSpeed, setAnimSpeed] = useState(() => {
    return localStorage.getItem('sreeraam_anim_speed') || 'fast';
  });

  // Syncing attributes & registering keyboard shortcuts
  useEffect(() => {
    document.documentElement.setAttribute('data-anim-speed', animSpeed);
    localStorage.setItem('sreeraam_anim_speed', animSpeed);
  }, [animSpeed]);

  // Register A/B test debug shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const unregister = registerAbTestDebugShortcut();
    return unregister;
  }, []);

  const pageTransitionDur = animSpeed === 'fast' ? 0.3 : animSpeed === 'normal' ? 0.5 : 0.7;

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authKey, setAuthKey] = useState(0);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);    const [quoteFormData, setQuoteFormData] = useState({ name: '', email: '', sector: 'General Inquiry', notes: '' });
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
    saveLocalAndCloud('sreeraam_inquiries', inquiries);

    // Save persistent admin notification
    const adminNotifs = asArray(safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []), []);
    adminNotifs.unshift({
      id: generateUniqueId(),
      iconName: 'mail',
      title: 'New Booking Inquiry',
      message: `${quoteFormData.name} requested quote for ${quoteFormData.sector}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Just now',
      read: false
    });
    saveLocalAndCloud('sreeraam_notifications_admin', adminNotifs);

    setQuoteSubmitted(true);
  };

  const handleLogout = () => {
    trackEvent('user_logged_out', { email: currentUser?.email });
    resetUser();
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

  // ── Date grouping helper for messages ──
  const getDateGroup = (msgId) => {
    const msgDate = new Date(msgId);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return 'Today';
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return msgDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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

      {/* Sync status bar — shows retry queue and offline status */}
      <SyncStatusBar />

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
            <Suspense fallback={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="spinner" />
              </div>
            }>
              {renderActivePage()}
            </Suspense>
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
            // Identify user in PostHog
            identifyUser(u.email, {
              name: u.name,
              role: u.role,
              email: u.email
            });
            trackEvent('user_logged_in', { role: u.role, email: u.email });
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
                  <option value="House Construction">House Construction</option>
                  <option value="Lodge Construction">Lodge Construction</option>
                  <option value="Commercial Civil Build">Commercial Civil Build</option>
                  <option value="Interior decoration">Interior decoration</option>
                  <option value="General Inquiry">General Inquiry</option>
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
                        {/* Thread search */}
                        <input
                          type="text"
                          placeholder="Search clients..."
                          value={threadSearchQuery}
                          onChange={(e) => setThreadSearchQuery(e.target.value)}
                          className="vgn-input"
                          style={{ height: '36px', fontSize: '12px', padding: '8px 12px', borderRadius: '8px' }}
                        />
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
                                {clientIsTyping[thread.clientEmail.toLowerCase()] ? (
                                  <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    typing...
                                  </span>
                                ) : lastMsg && (
                                  <p style={{ fontSize: '11px', color: 'var(--gray-500)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {lastMsg.sender === 'admin' ? 'You: ' : ''}{lastMsg.text}
                                  </p>
                                )}                                  </div>
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
                              const showDateGroup = i === 0 || getDateGroup(m.id) !== getDateGroup(currentThread.messages[i - 1].id);
                              const isAdmin = m.sender === 'admin';
                              const formattedParts = !isAdmin ? formatMessageText(m.text) : m.text;
                              const canEdit = isAdmin && isWithinEditWindow(m.id);
                              const isEditing = editingMessageId === m.id;
                              return (
                                <React.Fragment key={i}>
                                  {showDateGroup && (
                                    <div style={{ textAlign: 'center', padding: '4px 0', fontSize: '10px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      {getDateGroup(m.id)}
                                    </div>
                                  )}
                                <div
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
                                  {m.deleted ? (
                                    <div style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '11px' }}>
                                      This message was deleted
                                    </div>
                                  ) : isEditing ? (
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="vgn-input"
                                        autoFocus
                                        style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '8px', flex: 1 }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleEditMessage(m.id, editText);
                                          if (e.key === 'Escape') { setEditingMessageId(null); setEditText(''); }
                                        }}
                                      />
                                      <button
                                        onClick={() => handleEditMessage(m.id, editText)}
                                        className="btn-vgn btn-vgn-gold"
                                        style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px' }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => { setEditingMessageId(null); setEditText(''); }}
                                        style={{ background: 'none', border: 'none', fontSize: '10px', color: isAdmin ? 'rgba(255,255,255,0.6)' : 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div>
                                        {!isAdmin
                                          ? renderFormattedParts(formattedParts, { linkColor: 'var(--vgn-blue-dark)' })
                                          : m.text
                                        }
                                        {m.edited && (
                                          <span style={{ fontSize: '9px', opacity: 0.5, marginLeft: '4px' }}>(edited)</span>
                                        )}
                                      </div>

                                      {/* Attachment display */}
                                      {m.attachment && (
                                        <div style={{ marginTop: '8px' }}>
                                          {m.attachment.isImage ? (
                                            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                              <img
                                                src={m.attachment.dataUrl}
                                                alt={m.attachment.name}
                                                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block' }}
                                              />
                                              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>
                                                {m.attachment.name}
                                              </div>
                                            </div>
                                          ) : (
                                            <div style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              padding: '6px 10px',
                                              background: isAdmin ? 'rgba(255,255,255,0.1)' : 'var(--bg-light)',
                                              borderRadius: '6px',
                                              fontSize: '11px'
                                            }}>
                                              <span>📄</span>
                                              <span style={{ fontWeight: '600' }}>{m.attachment.name}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Actions: edit/delete for own messages within window */}
                                      {canEdit && !m.deleted && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                          <button
                                            onClick={() => { setEditingMessageId(m.id); setEditText(m.text); }}
                                            title="Edit message"
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                          >
                                            <Edit3 size={11} /> Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteMessage(m.id)}
                                            title="Delete message"
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                          >
                                            <Trash2 size={11} /> Delete
                                          </button>
                                        </div>
                                      )}

                                      {/* Reactions */}
                                      {!m.deleted && (
                                        <MessageReactions
                                          reactions={m.reactions}
                                          currentUserEmail={currentUser?.email}
                                          onReact={(emoji) => handleToggleReaction(m.id, emoji)}
                                        />
                                      )}
                                    </>
                                  )}

                                  <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                    {isAdmin ? 'You • ' : `${currentThread.clientName} • `} {m.time}
                                  </div>
                              </div>
                              </React.Fragment>
                            );
                          })
                        ) : (
                            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '12px' }}>
                              Start typing a message below.
                            </div>
                          )}
                          {selectedAdminClientEmail && clientIsTyping[selectedAdminClientEmail.toLowerCase()] && (
                            <div style={{ alignSelf: 'flex-start', padding: '4px 12px' }}>
                              <TypingIndicator name={currentThread?.clientName || 'Client'} />
                            </div>
                          )}
                        </div>

                        <form onSubmit={handleAdminSendMessage} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--gray-100)', background: 'var(--white)' }}>
                          <ChatAttachment
                            attachment={adminAttachment}
                            onAttach={setAdminAttachment}
                            onRemove={() => setAdminAttachment(null)}
                          />
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
                      <div ref={clientChatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {clientMessages.length > 0 ? (
                          clientMessages.map((m, i) => {
                            const isAdminReply = m.sender === 'admin';
                            const formattedParts = isAdminReply ? formatMessageText(m.text) : m.text;
                            const canEdit = !isAdminReply && isWithinEditWindow(m.id);
                            const isEditing = editingMessageId === m.id;
                            const showDateGroup = i === 0 || getDateGroup(m.id) !== getDateGroup(clientMessages[i - 1].id);
                            return (
                              <React.Fragment key={i}>
                                {showDateGroup && (
                                  <div style={{ textAlign: 'center', padding: '4px 0', fontSize: '10px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {getDateGroup(m.id)}
                                  </div>
                                )}
                              <div
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
                                {m.deleted ? (
                                  <div style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '11px' }}>
                                    This message was deleted
                                  </div>
                                ) : isEditing ? (
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="vgn-input"
                                      autoFocus
                                      style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '8px', flex: 1 }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleEditMessage(m.id, editText);
                                        if (e.key === 'Escape') { setEditingMessageId(null); setEditText(''); }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleEditMessage(m.id, editText)}
                                      className="btn-vgn btn-vgn-gold"
                                      style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px' }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => { setEditingMessageId(null); setEditText(''); }}
                                      style={{ background: 'none', border: 'none', fontSize: '10px', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {/* Message text with rich formatting */}
                                    <div>
                                      {isAdminReply
                                        ? renderFormattedParts(formattedParts, { linkColor: 'var(--vgn-blue-dark)' })
                                        : m.text
                                      }
                                      {m.edited && (
                                        <span style={{ fontSize: '9px', opacity: 0.5, marginLeft: '4px' }}>(edited)</span>
                                      )}
                                    </div>

                                    {/* Attachment display */}
                                    {m.attachment && (
                                      <div style={{ marginTop: '8px' }}>
                                        {m.attachment.isImage ? (
                                          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                            <img
                                              src={m.attachment.dataUrl}
                                              alt={m.attachment.name}
                                              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block' }}
                                            />
                                            <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>
                                              {m.attachment.name}
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 10px',
                                            background: isAdminReply ? 'var(--bg-light)' : 'rgba(255,255,255,0.1)',
                                            borderRadius: '6px',
                                            fontSize: '11px'
                                          }}>
                                            <span>📄</span>
                                            <span style={{ fontWeight: '600' }}>{m.attachment.name}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Actions: edit/delete for own messages within window */}
                                    {canEdit && !m.deleted && (
                                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                        <button
                                          onClick={() => { setEditingMessageId(m.id); setEditText(m.text); }}
                                          title="Edit message"
                                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                                          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                        >
                                          <Edit3 size={11} /> Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteMessage(m.id)}
                                          title="Delete message"
                                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                        >
                                          <Trash2 size={11} /> Delete
                                        </button>
                                      </div>
                                    )}

                                    {/* Reactions */}
                                    {!m.deleted && (
                                      <MessageReactions
                                        reactions={m.reactions}
                                        currentUserEmail={currentUser?.email}
                                        onReact={(emoji) => handleToggleReaction(m.id, emoji)}
                                      />
                                    )}
                                  </>
                                )}

                                <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                  {isAdminReply ? 'Sethu Pandian B.E. (Admin) • ' : 'You • '} {m.time}
                                </div>                                  </div>
                                </React.Fragment>
                              );
                            })
                          ) : (
                          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '12px', padding: '20px' }}>
                            Ask about structural elevation updates, teak woodwork customization, or booking schedules below.
                          </div>
                        )}
                      </div>

                      {/* Typing indicator */}
                      <AnimatePresence>
                        {adminIsTyping && !clientInquiryStatus && (
                          <div style={{ padding: '0 12px' }}>
                            <TypingIndicator name="Sethu Pandian B.E." />
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Quick reply bar */}
                      <QuickReplyBar
                        onSend={handleQuickReplySend}
                        lastMessageText={clientMessages.length > 0 ? clientMessages[clientMessages.length - 1].text : ''}
                        isVisible={showClientQuickReplies && !clientInquiryStatus}
                      />

                      <form onSubmit={handleClientSendMessage} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--gray-100)', background: 'var(--white)' }}>
                        <ChatAttachment
                          attachment={clientAttachment}
                          onAttach={setClientAttachment}
                          onRemove={() => setClientAttachment(null)}
                          disabled={clientInquiryStatus}
                        />
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

      {/* 7. Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}

export default App;
