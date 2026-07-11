import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, ClipboardCheck, ArrowUpRight, MessageCircle, Plus, Edit2, Trash2, Save, X, Info, Bell, Search, ArrowUpDown, Send } from 'lucide-react';
import ProfileButton from '../components/ProfileButton';

function EmptyState({ icon, title, subtitle }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '32px 20px',
        background: 'var(--bg-light)',
        borderRadius: '6px',
        border: '1px dashed var(--gray-200)'
      }}
    >
      <div style={{ color: 'var(--gray-300)', marginBottom: '12px' }}>
        {icon}
      </div>
      <h4 style={{ fontWeight: '700', fontSize: '14px', color: 'var(--gray-500)', margin: '0 0 4px 0' }}>
        {title}
      </h4>
      <p style={{ fontSize: '12px', color: 'var(--gray-400)', margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

export default function DashboardAdmin({ user, onLogout, onUpdateUser }) {
  // Navigation tabs for Admin dashboard
  const [activeTab, setActiveTab] = useState('inquiries');

  // Toast notification state
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  // Alert notification system (bell icon)
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationPanelRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (item) => {
    const saved = JSON.parse(localStorage.getItem('sreeraam_notifications_admin') || '[]');
    const newNotif = { id: Date.now() + Math.random(), read: false, ...item };
    const updated = [newNotif, ...saved];
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(updated));
    setNotifications(updated);
  };

  const markAllRead = () => {
    const saved = JSON.parse(localStorage.getItem('sreeraam_notifications_admin') || '[]');
    const updated = saved.map(n => ({ ...n, read: true }));
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(updated));
    setNotifications(updated);
  };

  const markAsRead = (id) => {
    const saved = JSON.parse(localStorage.getItem('sreeraam_notifications_admin') || '[]');
    const updated = saved.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(updated));
    setNotifications(updated);
  };

  const dismissNotification = (id) => {
    const saved = JSON.parse(localStorage.getItem('sreeraam_notifications_admin') || '[]');
    const updated = saved.filter(n => n.id !== id);
    localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(updated));
    setNotifications(updated);
  };

  const renderNotificationIcon = (iconName) => {
    switch (iconName) {
      case 'mail': return <Mail size={14} />;
      case 'users': return <Users size={14} />;
      case 'clipboard': return <ClipboardCheck size={14} />;
      case 'message': return <MessageCircle size={14} />;
      default: return <Bell size={14} />;
    }
  };

  // Close notification panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const showToast = (message, type = 'success') => {
    const id = ++toastIdCounter.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // -------------------- CRUD DATABASES --------------------
  const [clients, setClients] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [careers, setCareers] = useState([]);
  const [applications, setApplications] = useState([]);



  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Sort
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  const sortOptions = {
    projects: [
      { value: 'name', label: 'Name' },
      { value: 'status', label: 'Status' },
      { value: 'category', label: 'Category' },
      { value: 'location', label: 'Location' }
    ],
    divisions: [
      { value: 'title', label: 'Title' },
      { value: 'metrics', label: 'Metrics' }
    ],
    milestones: [
      { value: 'year', label: 'Year' },
      { value: 'title', label: 'Title' }
    ],
    careers: [
      { value: 'title', label: 'Title' },
      { value: 'dept', label: 'Department' },
      { value: 'location', label: 'Location' }
    ]
  };

  const getCurrentSortOptions = () => {
    if (activeTab === 'projects') return sortOptions.projects;
    if (activeTab === 'divisions') return sortOptions.divisions;
    if (activeTab === 'about') return sortOptions.milestones;
    if (activeTab === 'careers') return sortOptions.careers;
    return [];
  };

  // Filter helpers
  const filterItems = (items, fields) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      fields.some(field => {
        const val = item[field];
        if (Array.isArray(val)) return val.some(v => v.toLowerCase().includes(q));
        return val && val.toString().toLowerCase().includes(q);
      })
    );
  };

  const sortItems = (items, field, order) => {
    if (!field) return items;
    return [...items].sort((a, b) => {
      const aVal = (a[field] || '').toString().toLowerCase();
      const bVal = (b[field] || '').toString().toLowerCase();
      if (order === 'asc') return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    });
  };

  const filteredProjects = sortItems(filterItems(projects, ['name', 'category', 'location', 'status', 'type', 'desc']), sortBy, sortOrder);
  const filteredDivisions = sortItems(filterItems(divisions, ['title', 'metrics', 'desc', 'services']), sortBy, sortOrder);
  const filteredMilestones = sortItems(filterItems(milestones, ['year', 'title', 'desc']), sortBy, sortOrder);
  const filteredCareers = sortItems(filterItems(careers, ['title', 'dept', 'location', 'desc']), sortBy, sortOrder);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (ids) => {
    if (ids.length > 0 && ids.every(id => selectedIds.includes(id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  const handleBatchDelete = (key, ids, data, setter, label, confirmMsg) => {
    if (ids.length === 0) return;
    if (!window.confirm(confirmMsg || `Delete ${ids.length} ${label}?`)) return;
    const updated = data.filter(item => !ids.includes(item.id));
    saveDatabase(key, updated, setter, `${ids.length} ${label} deleted`);
    setSelectedIds([]);
  };

  // Form edit models
  const [editingItem, setEditingItem] = useState(null); // holds project, division, job, or milestone structure
  const [isAdding, setIsAdding] = useState(false);

  // Default seed databases (same as pages)
  const defaultProjects = [
    { id: 1, name: 'Laxmana Residency Lodge', location: 'Rameswaram', status: 'Ongoing', category: 'Lodge Construction', price: 'Premium Commercial Fit', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=cover&w=800&q=80', type: 'Modern Lodge & Guest House', area: '8,500 Sq. Ft. Built-up', units: '18 Rooms + Lounge', rera: 'Local Municipal Approved', desc: 'Multistory lodge construction featuring standard Dravidian columns base and high-strength concrete framing near Laxmana Theertham.', details: 'Laxmana Residency Lodge is strategically designed to accommodate seasonal pilgrims. Situated in the heart of Rameswaram, it is engineered for multi-story load bearing capacity with localized Dravidian structural columns. Features include concrete framing, energy-saving plumbing lines, and rainwater storage tanks.' },
    { id: 2, name: 'Sethu Coastal Villa Enclave', location: 'Pamban', status: 'Ongoing', category: 'House Construction', price: 'High-Quality Civil Build', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', area: '3,200 Sq. Ft.', units: '3 BHK Dual Floor', rera: 'Panchayat Approved', desc: 'Seaside luxury villas constructed using premium local red clay roof tiles and wind-resistant framing structures.', details: 'Situated on the coastal border of Pamban, this residential custom house build uses specialized anti-corrosive concrete reinforcement to resist salt air. The roof features traditional eco-friendly red clay tiles over a reinforced structural slab, integrating natural cooling layouts.' },
    { id: 3, name: 'Rameswaram Tourist Lodge Complex', location: 'Rameswaram', status: 'Ready to Handover', category: 'Lodge Construction', price: 'Completed Turnkey Project', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=cover&w=800&q=80', type: 'Commercial Lodges', area: '12,00,0 Sq. Ft.', units: '24 Guest Rooms', rera: 'Municipal Certified', desc: 'Finished premium lodge suites offering spacious ventilation, safety compliance, and parking layouts.', details: 'A completed commercial lodge project offering ready occupancy. Features include high-end ceramic flooring, central ventilation shafts, structural firefighting clearance doors, and dedicated parking allocations for tourist buses.' },
    { id: 4, name: 'Thulasi Baba Mansion', location: 'Rameswaram', status: 'Ready to Handover', category: 'House Construction', price: 'Completed Site', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=cover&w=800&q=80', type: 'Custom House Builds', area: '2,800 Sq. Ft.', units: '4 BHK Independent', rera: 'Approved Plan', desc: 'Double story signature bungalow featuring premium teak wood entryways and modern modular layout specs.', details: 'This custom house project incorporates fine interior decoration works. Finished with teak wood frame work, modular granite counter kitchen, fall ceilings with integrated LED lighting, and high-quality premium paint coat.' },
    { id: 5, name: 'Pamban Sea-View Resort Lodge', location: 'Pamban', status: 'Upcoming', category: 'Lodge Construction', price: 'Planning Phase', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=cover&w=800&q=80', type: 'Boutique Lodge Enclave', area: '15,000 Sq. Ft.', units: '30 Deluxe Rooms', rera: 'Approvals Pending', desc: 'Upcoming double-winged tourist lodge offering direct sea views, modern recreational zones, and structural integrity audits.', details: 'An upcoming luxury lodge project in Pamban. Engineered with specialized deep pile foundations to address seaside soil shifting, it features structural balconies and expansive dining lounges.' },
    { id: 6, name: 'Temple View Arcade', location: 'Rameswaram', status: 'Completed', category: 'Commercial Civil Build', price: 'Fully Handed Over', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=cover&w=800&q=80', type: 'Commercial Building', area: '6,400 Sq. Ft.', units: '8 Retail Outlets', rera: 'Municipal Approved', desc: 'Premium retail block housing local handicraft stores, complete with heavy-duty structural concrete slabs.', details: 'A fully delivered commercial building civil construction. The block includes modular retail shutters, heavy-duty electrical wiring panels, and a high-load concrete terrace floor optimized for future vertical expansion.' }
  ];

  const defaultDivisions = [
    { id: 1, title: 'House Construction', metrics: 'Custom Built Villas & Homes', desc: 'Specialized residential builders in Rameswaram. We construct premium independent houses, bungalows, and dual-floor villas optimized for local weather and foundation structures.', services: ['Custom architectural design & drafting', 'Foundation pile works for sandy regions', 'Traditional red clay roof tiles framing', 'Complete turn-key civil contracting'] },
    { id: 2, title: 'Lodge Construction', metrics: 'Commercial Guest Houses & Lodges', desc: 'Expert construction of tourist lodges and guest houses near Rameswaram temple corridors. We coordinate plan approvals, safety certifications, and room layout optimization.', services: ['Multi-room tourist lodge planning', 'Municipal building approval coordination', 'Heavy-duty load bearing civil concrete', 'Commercial plumbing & ventilation setups'] },
    { id: 3, title: 'Commercial Civil Build', metrics: 'Office & Retail Shopping Blocks', desc: 'Constructing commercial centers, retail outlets, and multi-purpose properties. Focused on solid foundations, safety clearances, and durable building envelopes.', services: ['Reinforced concrete column arrays', 'Heavy electrical wiring conduit planning', 'Fire-safe building code compliance', 'High-density concrete floor installations'] },
    { id: 4, title: 'Interior decoration', metrics: 'Premium Modular & Wood Styling', desc: 'Custom wooden cabinetry, modular kitchens, fall ceilings, and high-quality paint coatings to deliver completed elegant living spaces.', services: ['Premium granite modular kitchen setups', 'Teak wood main entry frame installations', 'Bespoke walk-in wardrobes & cabinetry', 'Modern gypsum board false ceilings & lights'] }
  ];

  const defaultMilestones = [
    { id: 1, year: 'Engineering Focus', title: 'Solid Academic Foundation', desc: 'Managed by S.M. Sethu Pandian B.E. (Civil Engineering), aligning structural calculation codes with ground reality.' },
    { id: 2, year: 'Custom Housing', title: 'Local Villa Specialists', desc: 'Established deep expertise in Rameswaram coastal weatherproofing, choosing premium red clay tiles and anti-corrosive concrete reinforcement.' },
    { id: 3, year: 'Lodge Builds', title: 'Tourist Infrastructure', desc: 'Contracted multi-room lodge structures near Laxmana Theertham and spiritual pathways, handling licensing and zoning approvals.' },
    { id: 4, year: 'Complete Decors', title: 'Turnkey Handover', desc: 'Offering modular kitchens, structural false ceilings, and premium carpentry finishes under one single management.' }
  ];

  const defaultCareers = [
    { id: 1, title: 'Site Construction Supervisor', dept: 'Civil Construction', location: 'Rameswaram Site', desc: 'Oversee concrete foundation laying, reinforcement welding quality checks, and manage masonry work schedules.' },
    { id: 2, title: 'Bespoke Carpenter / Installer', dept: 'Interior decoration', location: 'Rameswaram Office / Site', desc: 'Custom teak wood frame fittings, modular kitchen cabinet installations, and modular wardrobe carpentry works.' },
    { id: 3, title: 'Structural CAD Drafter', dept: 'Engineering & Design', location: 'Rameswaram Head Office', desc: 'Prepare 2D/3D building plans, structural elevations, and coordinate approval documents with municipal specifications.' }
  ];

  // -------------------- LIFECYCLE --------------------
  useEffect(() => {
    // 1. Clients
    setClients(JSON.parse(localStorage.getItem('registeredUsers') || '[]'));

    // 2. Inquiries
    const defaultInq = [
      { id: 101, name: 'Anand Krishnan', phone: '9566615030', project: 'Sethu Coastal Villa Enclave', message: 'Requested schedule for roof slab reinforcement inspect.', date: 'Today' },
      { id: 102, name: 'Rajesh Kumar', phone: '9845012345', project: 'Laxmana Residency Lodge', message: 'Inquiry regarding plumbing layout specs and bathroom modular fittings.', date: 'Yesterday' }
    ];
    const savedInq = localStorage.getItem('sreeraam_inquiries');
    if (savedInq) {
      setInquiries(JSON.parse(savedInq));
    } else {
      setInquiries(defaultInq);
      localStorage.setItem('sreeraam_inquiries', JSON.stringify(defaultInq));
    }

    // 3. Projects CRUD
    const savedProj = localStorage.getItem('sreeraam_projects');
    if (savedProj) {
      setProjects(JSON.parse(savedProj));
    } else {
      setProjects(defaultProjects);
      localStorage.setItem('sreeraam_projects', JSON.stringify(defaultProjects));
    }

    // 4. Divisions CRUD
    const savedDivs = localStorage.getItem('sreeraam_divisions');
    if (savedDivs) {
      setDivisions(JSON.parse(savedDivs));
    } else {
      setDivisions(defaultDivisions);
      localStorage.setItem('sreeraam_divisions', JSON.stringify(defaultDivisions));
    }

    // 5. About Milestones CRUD
    const savedMiles = localStorage.getItem('sreeraam_about_milestones');
    if (savedMiles) {
      setMilestones(JSON.parse(savedMiles));
    } else {
      setMilestones(defaultMilestones);
      localStorage.setItem('sreeraam_about_milestones', JSON.stringify(defaultMilestones));
    }

    // 6. Careers CRUD
    const savedJobs = localStorage.getItem('sreeraam_careers_jobs');
    if (savedJobs) {
      setCareers(JSON.parse(savedJobs));
    } else {
      setCareers(defaultCareers);
      localStorage.setItem('sreeraam_careers_jobs', JSON.stringify(defaultCareers));
    }

    // 7. Candidate Applications
    setApplications(JSON.parse(localStorage.getItem('sreeraam_job_applications') || '[]'));

    // Load notifications from localStorage, fallback to generating them if empty
    const savedNotifs = localStorage.getItem('sreeraam_notifications_admin');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    } else {
      const notifSavedInq = JSON.parse(localStorage.getItem('sreeraam_inquiries') || '[]');
      const notifSavedApps = JSON.parse(localStorage.getItem('sreeraam_job_applications') || '[]');
      const notifRegUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const initialNotifs = [];
      notifSavedInq.forEach(inq => {
        initialNotifs.push({
          id: Date.now() + Math.random(),
          iconName: 'mail',
          title: 'New Callback Request',
          message: `${inq.name} inquired about ${inq.project}`,
          time: inq.date || 'Today',
          read: false
        });
      });
      if (notifRegUsers.length > 0) {
        const latest = notifRegUsers[notifRegUsers.length - 1];
        initialNotifs.push({
          id: Date.now() + Math.random() + 100,
          iconName: 'users',
          title: 'New Client Registration',
          message: `${latest.name} (${latest.email}) registered`,
          time: 'Recently',
          read: false
        });
      }
      notifSavedApps.forEach(app => {
        initialNotifs.push({
          id: Date.now() + Math.random() + 200,
          iconName: 'clipboard',
          title: 'New Job Application',
          message: `${app.name} applied for ${app.role}`,
          time: 'Recently',
          read: false
        });
      });
      setNotifications(initialNotifs);
      localStorage.setItem('sreeraam_notifications_admin', JSON.stringify(initialNotifs));
    }
  }, []);

  const saveDatabase = (key, data, setter, successMsg = 'Record saved successfully') => {
    localStorage.setItem(key, JSON.stringify(data));
    setter(data);
    setEditingItem(null);
    setIsAdding(false);
    showToast(successMsg);
  };

  // -------------------- INQUIRIES ACTIONS --------------------
  const handleResolveInquiry = (id) => {
    const updated = inquiries.filter(inq => inq.id !== id);
    saveDatabase('sreeraam_inquiries', updated, setInquiries, 'Inquiry resolved');
  };

  const handleResolveApplication = (id) => {
    const updated = applications.filter(app => app.id !== id);
    saveDatabase('sreeraam_job_applications', updated, setApplications, 'Application archived');
  };

  // -------------------- PROJECTS CRUD --------------------
  const handleEditProject = (proj) => {
    setEditingItem({ ...proj, type: 'project' });
    setIsAdding(false);
  };

  const handleAddProjectInit = () => {
    setEditingItem({
      id: Date.now(),
      name: '',
      location: 'Rameswaram',
      status: 'Ongoing',
      category: 'House Construction',
      price: 'Quotation Cost Sheet',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=cover&w=800&q=80',
      type: 'Custom Civil Build',
      area: '2,500 Sq. Ft.',
      units: '3 BHK',
      rera: 'Pending approval',
      desc: '',
      details: '',
      typeField: 'project' // identify type
    });
    setIsAdding(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    let updated;
    if (isAdding) {
      updated = [...projects, editingItem];
    } else {
      updated = projects.map(p => p.id === editingItem.id ? editingItem : p);
    }
    saveDatabase('sreeraam_projects', updated, setProjects, isAdding ? 'Project created' : 'Project updated');
  };

  const handleDeleteProject = (id) => {
    if (!window.confirm('Delete this project?')) return;
    const updated = projects.filter(p => p.id !== id);
    saveDatabase('sreeraam_projects', updated, setProjects, 'Project deleted');
  };

  // -------------------- DIVISIONS CRUD --------------------
  const handleEditDivision = (div) => {
    setEditingItem({ ...div, typeField: 'division' });
    setIsAdding(false);
  };

  const handleAddDivisionInit = () => {
    setEditingItem({
      id: Date.now(),
      title: '',
      metrics: '',
      desc: '',
      services: ['', '', '', ''],
      typeField: 'division'
    });
    setIsAdding(true);
  };

  const handleSaveDivision = (e) => {
    e.preventDefault();
    let updated;
    if (isAdding) {
      updated = [...divisions, editingItem];
    } else {
      updated = divisions.map(d => d.id === editingItem.id ? editingItem : d);
    }
    saveDatabase('sreeraam_divisions', updated, setDivisions, isAdding ? 'Division created' : 'Division updated');
  };

  const handleDeleteDivision = (id) => {
    if (!window.confirm('Delete this division?')) return;
    const updated = divisions.filter(d => d.id !== id);
    saveDatabase('sreeraam_divisions', updated, setDivisions, 'Division deleted');
  };

  // -------------------- ABOUT MILESTONES CRUD --------------------
  const handleEditMilestone = (mile) => {
    setEditingItem({ ...mile, typeField: 'milestone' });
    setIsAdding(false);
  };

  const handleAddMilestoneInit = () => {
    setEditingItem({
      id: Date.now(),
      year: '',
      title: '',
      desc: '',
      typeField: 'milestone'
    });
    setIsAdding(true);
  };

  const handleSaveMilestone = (e) => {
    e.preventDefault();
    let updated;
    if (isAdding) {
      updated = [...milestones, editingItem];
    } else {
      updated = milestones.map(m => m.id === editingItem.id ? editingItem : m);
    }
    saveDatabase('sreeraam_about_milestones', updated, setMilestones, isAdding ? 'Milestone created' : 'Milestone updated');
  };

  const handleDeleteMilestone = (id) => {
    if (!window.confirm('Delete this milestone?')) return;
    const updated = milestones.filter(m => m.id !== id);
    saveDatabase('sreeraam_about_milestones', updated, setMilestones, 'Milestone deleted');
  };

  // -------------------- CAREERS CRUD --------------------
  const handleEditCareer = (job) => {
    setEditingItem({ ...job, typeField: 'career' });
    setIsAdding(false);
  };

  const handleAddCareerInit = () => {
    setEditingItem({
      id: Date.now(),
      title: '',
      dept: 'Civil Construction',
      location: 'Rameswaram Site',
      desc: '',
      typeField: 'career'
    });
    setIsAdding(true);
  };

  const handleSaveCareer = (e) => {
    e.preventDefault();
    let updated;
    if (isAdding) {
      updated = [...careers, editingItem];
    } else {
      updated = careers.map(c => c.id === editingItem.id ? editingItem : c);
    }
    saveDatabase('sreeraam_careers_jobs', updated, setCareers, isAdding ? 'Career created' : 'Career updated');
  };

  const handleDeleteCareer = (id) => {
    if (!window.confirm('Delete this role?')) return;
    const updated = careers.filter(c => c.id !== id);
    saveDatabase('sreeraam_careers_jobs', updated, setCareers, 'Career deleted');
  };

  const fadeUp = {
    initial: { opacity: 0, y: 25 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '-50px' },
    transition: { staggerChildren: 0.06 }
  };

  const fadeUpChild = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <div className="container" style={{ padding: '40px 0 80px 0', textAlign: 'left' }}>
      {/* 1. Header with Title & Log Out */}
      <motion.div
        {...fadeUp}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '35px',
          borderBottom: '1px solid var(--gray-100)',
          paddingBottom: '20px'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--vgn-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ADMINISTRATIVE HUB
          </span>
          <h1 style={{ color: 'var(--vgn-blue-dark)', fontSize: '32px', fontWeight: '800', marginTop: '5px' }}>
            {user.name}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '2px' }}>
            System ID: {user.email} &bull; Security Level: CRUD FULL ACCESS
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User Avatar Profile */}
          <ProfileButton user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} roleLabel="Administrator" footerLabel="CRUD FULL ACCESS" />

          {/* Notification Bell */}
          <div style={{ position: 'relative' }} ref={notificationPanelRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative',
                background: 'var(--bg-light)',
                border: '1px solid var(--gray-100)',
                borderRadius: '4px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--vgn-blue-dark)',
                transition: 'all 0.2s ease'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
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
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '340px',
                  maxHeight: '400px',
                  background: 'var(--white)',
                  borderRadius: '6px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  border: '1px solid var(--gray-100)',
                  overflow: 'hidden',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--gray-100)'
                  }}
                >
                  <strong style={{ fontSize: '13px', color: 'var(--vgn-blue-dark)' }}>
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </strong>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--vgn-gold)',
                        cursor: 'pointer'
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--gray-100)',
                          background: n.read ? 'transparent' : 'var(--vgn-blue-light)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onClick={() => {
                          markAsRead(n.id);
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            background: 'var(--vgn-blue-dark)',
                            color: 'var(--white)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '14px'
                          }}
                        >
                          {renderNotificationIcon(n.iconName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px', lineHeight: '1.4' }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '4px' }}>
                            {n.time}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gray-400)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '2px',
                            alignSelf: 'flex-start'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '12px' }}>
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Database Stats Panel */}
      <motion.div
        {...stagger}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}
      >
        {[
          { icon: <Mail style={{ color: 'var(--vgn-gold)' }} />, label: 'Callback Inquiries', value: inquiries.length },
          { icon: <Users style={{ color: 'var(--vgn-gold)' }} />, label: 'Registered Clients', value: clients.length },
          { icon: <ArrowUpRight style={{ color: 'var(--vgn-gold)' }} />, label: 'Active Projects', value: projects.length },
          { icon: <ClipboardCheck style={{ color: 'var(--vgn-gold)' }} />, label: 'Active Divisions', value: divisions.length }
        ].map((item, i) => (
          <motion.div key={i} {...fadeUpChild} className="vgn-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--vgn-blue-light)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--gray-500)', display: 'block' }}>{item.label}</span>
              <strong style={{ fontSize: '16px', color: 'var(--vgn-blue-dark)', display: 'block' }}>{item.value}</strong>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Sub-Console Tab Selector */}
      <motion.div
        {...fadeUp}
        style={{
          display: 'flex',
          background: 'var(--white)',
          padding: '6px',
          borderRadius: '4px',
          border: '1px solid var(--gray-100)',
          gap: '5px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}
      >
        {[
          { id: 'inquiries', label: 'Callbacks & Clients' },
          { id: 'projects', label: 'Projects CRUD' },
          { id: 'divisions', label: 'Divisions CRUD' },
          { id: 'about', label: 'About Us CRUD' },
          { id: 'careers', label: 'Careers CRUD' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setEditingItem(null);
              setIsAdding(false);
              setSearchQuery('');
              setSelectedIds([]);
              setSortBy('');
              setSortOrder('asc');
            }}
            style={{
              padding: '10px 18px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              background: activeTab === tab.id ? 'var(--vgn-blue-dark)' : 'transparent',
              color: activeTab === tab.id ? 'var(--white)' : 'var(--vgn-blue-dark)',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* 3.5 Search & Sort Controls (hidden on inquiries tab) */}
      {activeTab !== 'inquiries' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '24px' }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              className="vgn-input"
              placeholder={`Search ${activeTab === 'projects' ? 'projects' : activeTab === 'divisions' ? 'divisions' : activeTab === 'about' ? 'milestones' : 'careers'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '42px', paddingLeft: '40px', fontSize: '13px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-400)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                &times;
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                height: '32px',
                padding: '0 28px 0 10px',
                fontSize: '12px',
                border: '1px solid var(--gray-200)',
                borderRadius: '4px',
                background: 'var(--white)',
                color: sortBy ? 'var(--vgn-blue-dark)' : 'var(--gray-400)',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '14px'
              }}
            >
              <option value="">None</option>
              {getCurrentSortOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {sortBy && (
              <button
                onClick={toggleSortOrder}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '32px',
                  padding: '0 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '4px',
                  background: 'var(--white)',
                  color: 'var(--vgn-blue-dark)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <ArrowUpDown size={14} />
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>
            )}

            {sortBy && (
              <button
                onClick={() => { setSortBy(''); setSortOrder('asc'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-400)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px'
                }}
              >
                Clear sort
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 4. CRUD Editors */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'grid',
          gridTemplateColumns: editingItem ? '1fr 1fr' : '1fr',
          gap: '40px',
          alignItems: 'start'
        }}
      >
        {/* LEFT COLUMN: Lists & Tables */}
        <div>
          {/* TAB 1: Inquiries & Client Directories */}
          {activeTab === 'inquiries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div>
                <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800', marginBottom: '15px' }}>
                  Callbacks &amp; Enquiries Log
                </h3>
                {inquiries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="vgn-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <strong>{inq.name} ({inq.phone})</strong>
                          <span style={{ fontSize: '10px', background: 'var(--vgn-blue-light)', color: 'var(--vgn-blue-dark)', padding: '2px 8px', borderRadius: '2px', fontWeight: '700' }}>
                            {inq.project}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--gray-700)' }}>"{inq.message}"</p>
                        <button
                          onClick={() => handleResolveInquiry(inq.id)}
                          className="btn-vgn btn-vgn-blue"
                          style={{ height: '30px', fontSize: '10px', padding: '0 12px', marginTop: '10px' }}
                        >
                          Mark Resolved
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Mail size={32} />} title="All Clear!" subtitle="No pending callback requests at this time." />
                )}
              </div>

              <div>
                <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800', marginBottom: '15px' }}>
                  Registered Clients Directory
                </h3>
                <div className="vgn-card" style={{ padding: '20px' }}>
                  {clients.length > 0 ? (
                    clients.map((c, idx) => (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: idx < clients.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                          {c.email} &bull; {c.phone}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState icon={<Users size={32} />} title="No Clients Yet" subtitle="Registered users will appear here once they sign up." />
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800', marginBottom: '15px' }}>
                  Candidate Job Applications
                </h3>
                {applications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {applications.map((app) => (
                      <div key={app.id} className="vgn-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <strong>{app.name}</strong>
                          <span style={{ fontSize: '10px', background: 'var(--vgn-blue-light)', color: 'var(--vgn-blue-dark)', padding: '2px 8px', borderRadius: '2px', fontWeight: '700' }}>
                            {app.role}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '8px' }}>
                          Email: {app.email}
                        </div>
                        {app.notes && (
                          <p style={{ fontSize: '12px', color: 'var(--gray-700)', fontStyle: 'italic', background: 'var(--bg-light)', padding: '8px 12px', borderRadius: '4px', margin: '0 0 10px 0' }}>
                            "{app.notes}"
                          </p>
                        )}
                        <button
                          onClick={() => handleResolveApplication(app.id)}
                          className="btn-vgn btn-vgn-blue"
                          style={{ height: '30px', fontSize: '10px', padding: '0 12px' }}
                        >
                          Archive Profile
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<ClipboardCheck size={32} />} title="No Applications Yet" subtitle="Job applications submitted through the Careers page will appear here." />
                )}
              </div>
            </div>
          )}



          {/* TAB 3: Projects CRUD */}
          {activeTab === 'projects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filteredProjects.length > 0 && filteredProjects.every(p => selectedIds.includes(p.id))}
                    onChange={() => toggleSelectAll(filteredProjects.map(p => p.id))}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)' }}
                  />
                  <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800' }}>Project Records</h3>
                </div>
                <button onClick={handleAddProjectInit} className="btn-vgn btn-vgn-gold" style={{ height: '32px', fontSize: '11px', padding: '0 12px', gap: '4px' }}>
                  <Plus size={12} /> Add Project
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    background: '#fef2f2',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#991b1b'
                  }}
                >
                  <span>{selectedIds.length} selected</span>
                  <button
                    onClick={() => handleBatchDelete('sreeraam_projects', selectedIds, projects, setProjects, 'projects', `Delete ${selectedIds.length} selected projects?`)}
                    className="btn-vgn btn-vgn-outline-gold"
                    style={{ height: '28px', fontSize: '10px', padding: '0 10px', borderColor: '#ef4444', color: '#ef4444', marginLeft: 'auto' }}
                  >
                    <Trash2 size={12} /> Delete Selected
                  </button>
                </div>
              )}

              {filteredProjects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {filteredProjects.map((proj) => (
                    <div key={proj.id} className="vgn-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(proj.id)}
                        onChange={() => toggleSelect(proj.id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'var(--vgn-blue-dark)', fontWeight: '800', fontSize: '14px' }}>{proj.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                          {proj.category} &bull; {proj.location} &bull; {proj.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => handleEditProject(proj)} className="btn-vgn btn-vgn-blue" style={{ height: '32px', width: '32px', padding: 0 }} title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteProject(proj.id)} className="btn-vgn btn-vgn-outline-gold" style={{ height: '32px', width: '32px', padding: 0 }} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <EmptyState icon={<Search size={32} />} title="No Results" subtitle="Try a different search term or clear the filter." />
              ) : (
                <EmptyState icon={<ArrowUpRight size={32} />} title="No Projects Yet" subtitle="Add your first project using the Add Project button above." />
              )}
            </div>
          )}

          {/* TAB 3: Divisions CRUD */}
          {activeTab === 'divisions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filteredDivisions.length > 0 && filteredDivisions.every(d => selectedIds.includes(d.id))}
                    onChange={() => toggleSelectAll(filteredDivisions.map(d => d.id))}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)' }}
                  />
                  <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800' }}>Execution Divisions</h3>
                </div>
                <button onClick={handleAddDivisionInit} className="btn-vgn btn-vgn-gold" style={{ height: '32px', fontSize: '11px', padding: '0 12px', gap: '4px' }}>
                  <Plus size={12} /> Add Division
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    background: '#fef2f2',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#991b1b'
                  }}
                >
                  <span>{selectedIds.length} selected</span>
                  <button
                    onClick={() => handleBatchDelete('sreeraam_divisions', selectedIds, divisions, setDivisions, 'divisions', `Delete ${selectedIds.length} selected divisions?`)}
                    className="btn-vgn btn-vgn-outline-gold"
                    style={{ height: '28px', fontSize: '10px', padding: '0 10px', borderColor: '#ef4444', color: '#ef4444', marginLeft: 'auto' }}
                  >
                    <Trash2 size={12} /> Delete Selected
                  </button>
                </div>
              )}

              {filteredDivisions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {filteredDivisions.map((div) => (
                    <div key={div.id} className="vgn-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(div.id)}
                        onChange={() => toggleSelect(div.id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'var(--vgn-blue-dark)', fontWeight: '800', fontSize: '14px' }}>{div.title}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                          {div.metrics}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => handleEditDivision(div)} className="btn-vgn btn-vgn-blue" style={{ height: '32px', width: '32px', padding: 0 }} title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteDivision(div.id)} className="btn-vgn btn-vgn-outline-gold" style={{ height: '32px', width: '32px', padding: 0 }} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : divisions.length > 0 ? (
                <EmptyState icon={<Search size={32} />} title="No Results" subtitle="Try a different search term or clear the filter." />
              ) : (
                <EmptyState icon={<ClipboardCheck size={32} />} title="No Divisions Yet" subtitle="Add your first division using the Add Division button above." />
              )}
            </div>
          )}

          {/* TAB 4: About Us Milestones CRUD */}
          {activeTab === 'about' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filteredMilestones.length > 0 && filteredMilestones.every(m => selectedIds.includes(m.id))}
                    onChange={() => toggleSelectAll(filteredMilestones.map(m => m.id))}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)' }}
                  />
                  <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800' }}>About Milestones</h3>
                </div>
                <button onClick={handleAddMilestoneInit} className="btn-vgn btn-vgn-gold" style={{ height: '32px', fontSize: '11px', padding: '0 12px', gap: '4px' }}>
                  <Plus size={12} /> Add Milestone
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    background: '#fef2f2',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#991b1b'
                  }}
                >
                  <span>{selectedIds.length} selected</span>
                  <button
                    onClick={() => handleBatchDelete('sreeraam_about_milestones', selectedIds, milestones, setMilestones, 'milestones', `Delete ${selectedIds.length} selected milestones?`)}
                    className="btn-vgn btn-vgn-outline-gold"
                    style={{ height: '28px', fontSize: '10px', padding: '0 10px', borderColor: '#ef4444', color: '#ef4444', marginLeft: 'auto' }}
                  >
                    <Trash2 size={12} /> Delete Selected
                  </button>
                </div>
              )}

              {filteredMilestones.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {filteredMilestones.map((mile) => (
                    <div key={mile.id} className="vgn-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(mile.id)}
                        onChange={() => toggleSelect(mile.id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'var(--vgn-blue-dark)', fontWeight: '800', fontSize: '14px' }}>{mile.year}: {mile.title}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>{mile.desc}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => handleEditMilestone(mile)} className="btn-vgn btn-vgn-blue" style={{ height: '32px', width: '32px', padding: 0 }} title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteMilestone(mile.id)} className="btn-vgn btn-vgn-outline-gold" style={{ height: '32px', width: '32px', padding: 0 }} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : milestones.length > 0 ? (
                <EmptyState icon={<Search size={32} />} title="No Results" subtitle="Try a different search term or clear the filter." />
              ) : (
                <EmptyState icon={<Info size={32} />} title="No Milestones Yet" subtitle="Add your first milestone using the Add Milestone button above." />
              )}
            </div>
          )}

          {/* TAB 5: Careers CRUD */}
          {activeTab === 'careers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filteredCareers.length > 0 && filteredCareers.every(c => selectedIds.includes(c.id))}
                    onChange={() => toggleSelectAll(filteredCareers.map(c => c.id))}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)' }}
                  />
                  <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800' }}>Careers Openings</h3>
                </div>
                <button onClick={handleAddCareerInit} className="btn-vgn btn-vgn-gold" style={{ height: '32px', fontSize: '11px', padding: '0 12px', gap: '4px' }}>
                  <Plus size={12} /> Add Role
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    background: '#fef2f2',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#991b1b'
                  }}
                >
                  <span>{selectedIds.length} selected</span>
                  <button
                    onClick={() => handleBatchDelete('sreeraam_careers_jobs', selectedIds, careers, setCareers, 'careers', `Delete ${selectedIds.length} selected careers?`)}
                    className="btn-vgn btn-vgn-outline-gold"
                    style={{ height: '28px', fontSize: '10px', padding: '0 10px', borderColor: '#ef4444', color: '#ef4444', marginLeft: 'auto' }}
                  >
                    <Trash2 size={12} /> Delete Selected
                  </button>
                </div>
              )}

              {filteredCareers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {filteredCareers.map((job) => (
                    <div key={job.id} className="vgn-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(job.id)}
                        onChange={() => toggleSelect(job.id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--vgn-blue-dark)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'var(--vgn-blue-dark)', fontWeight: '800', fontSize: '14px' }}>{job.title}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                          {job.dept} &bull; {job.location}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => handleEditCareer(job)} className="btn-vgn btn-vgn-blue" style={{ height: '32px', width: '32px', padding: 0 }} title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteCareer(job.id)} className="btn-vgn btn-vgn-outline-gold" style={{ height: '32px', width: '32px', padding: 0 }} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : careers.length > 0 ? (
                <EmptyState icon={<Search size={32} />} title="No Results" subtitle="Try a different search term or clear the filter." />
              ) : (
                <EmptyState icon={<Users size={32} />} title="No Open Roles" subtitle="Add your first job opening using the Add Role button above." />
              )}
            </div>
        )}
      </div>

        {/* RIGHT COLUMN: Edit Forms */}
        <div>
          {editingItem ? (
            <div className="vgn-card" style={{ padding: '30px', background: 'var(--white)', borderTop: '4px solid var(--vgn-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: 'var(--vgn-blue-dark)', fontSize: '18px', fontWeight: '800' }}>
                  {isAdding ? 'Add New Record' : 'Modify Record'}
                </h3>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsAdding(false);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* PROJECT EDITOR FORM */}
              {activeTab === 'projects' && (
                <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>PROJECT NAME</label>
                    <input
                      required
                      type="text"
                      className="vgn-input"
                      style={{ height: '40px' }}
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>LOCATION (SPECIFIC ADDRESS)</label>
                      <textarea
                        className="vgn-input"
                        style={{ height: '60px', resize: 'none', padding: '10px 12px' }}
                        placeholder="e.g. Near to Laxmana Theertham, Rameswaram - 623526"
                        value={editingItem.location || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>STATUS PHASE / METRIC</label>
                      <input
                        type="text"
                        className="vgn-input"
                        style={{ height: '40px' }}
                        placeholder="e.g. Ongoing, Completed, Ready to Handover"
                        value={editingItem.status || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>BUILD CATEGORY</label>
                      <input
                        type="text"
                        className="vgn-input"
                        style={{ height: '40px' }}
                        placeholder="e.g. House Construction, Lodge Construction"
                        value={editingItem.category || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>PRICE / LABELS</label>
                      <input
                        type="text"
                        className="vgn-input"
                        style={{ height: '40px' }}
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>SUPER AREA</label>
                      <input
                        type="text"
                        className="vgn-input"
                        style={{ height: '40px' }}
                        value={editingItem.area || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, area: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>RERA / PLAN LICENSE</label>
                    <input
                      type="text"
                      className="vgn-input"
                      style={{ height: '40px' }}
                      value={editingItem.rera || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, rera: e.target.value })}
                    />
                  </div>

                   <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>PROJECT COVER IMAGE</label>
                    
                    {editingItem.image && (
                      <div style={{ marginBottom: '10px', position: 'relative', width: '120px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                        <img src={editingItem.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, image: '' })}
                          style={{
                            position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'var(--white)',
                            border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', fontSize: '10px', lineHeight: 1
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingItem({ ...editingItem, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                        id="admin-image-upload"
                      />
                      <label
                        htmlFor="admin-image-upload"
                        className="btn-vgn btn-vgn-outline-gold"
                        style={{
                          height: '40px', padding: '0 16px', display: 'inline-flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', fontSize: '11px', fontWeight: '700', margin: 0
                        }}
                      >
                        Upload Local File
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>or enter web link:</span>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        className="vgn-input"
                        style={{ height: '40px', flex: '1 1 200px' }}
                        value={editingItem.image && editingItem.image.startsWith('data:') ? '' : (editingItem.image || '')}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>SHORT BRIEF</label>
                    <textarea
                      rows="2"
                      className="vgn-input"
                      value={editingItem.desc || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                      style={{ resize: 'none', padding: '10px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>FULL SPECIFICATION DETAILS</label>
                    <textarea
                      rows="3"
                      className="vgn-input"
                      value={editingItem.details || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, details: e.target.value })}
                      style={{ resize: 'none', padding: '10px' }}
                    />
                  </div>

                  <button type="submit" className="btn-vgn btn-vgn-blue" style={{ height: '40px', gap: '8px', marginTop: '10px' }}>
                    <Save size={16} /> SAVE PROJECT
                  </button>
                </form>
              )}

              {/* DIVISION EDITOR FORM */}
              {activeTab === 'divisions' && (
                <form onSubmit={handleSaveDivision} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>DIVISION TITLE</label>
                    <input
                      required
                      type="text"
                      className="vgn-input"
                      style={{ height: '40px' }}
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>METRICS LABEL</label>
                    <input
                      required
                      type="text"
                      className="vgn-input"
                      style={{ height: '40px' }}
                      value={editingItem.metrics || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, metrics: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>DESCRIPTION</label>
                    <textarea
                      rows="3"
                      className="vgn-input"
                      value={editingItem.desc || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                      style={{ resize: 'none', padding: '10px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '8px' }}>CORE SERVICES (4 ITEMS)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          type="text"
                          className="vgn-input"
                          style={{ height: '36px' }}
                          placeholder={`Service Pillar #${idx + 1}`}
                          value={editingItem.services[idx] || ''}
                          onChange={(e) => {
                            const copy = [...editingItem.services];
                            copy[idx] = e.target.value;
                            setEditingItem({ ...editingItem, services: copy });
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn-vgn btn-vgn-blue" style={{ height: '40px', gap: '8px', marginTop: '10px' }}>
                    <Save size={16} /> SAVE DIVISION
                  </button>
                </form>
              )}

              {/* ABOUT MILESTONE EDITOR FORM */}
              {activeTab === 'about' && (
                <form onSubmit={handleSaveMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>YEAR / KEY LABEL</label>
                    <input
                      required
                      type="text"
                      className="vgn-input"
                      style={{ height: '40px' }}
                      placeholder="e.g. 2026 or Technical Focus"
                      value={editingItem.year || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>MILESTONE TITLE</label>
                    <input
                      required
                      type="text"
                      className="vgn-input"
                      style={{ height: '40px' }}
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>DESCRIPTION</label>
                    <textarea
                      rows="4"
                      className="vgn-input"
                      value={editingItem.desc || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                      style={{ resize: 'none', padding: '10px' }}
                    />
                  </div>

                  <button type="submit" className="btn-vgn btn-vgn-blue" style={{ height: '40px', gap: '8px', marginTop: '10px' }}>
                    <Save size={16} /> SAVE MILESTONE
                  </button>
                </form>
              )}

              {/* CAREERS EDITOR FORM */}
              {activeTab === 'careers' && (
                <form onSubmit={handleSaveCareer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>JOB ROLE TITLE</label>
                    <input
                      required
                      type="text"
                      className="vgn-input"
                      style={{ height: '40px' }}
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>DEPARTMENT</label>
                      <input
                        type="text"
                        className="vgn-input"
                        style={{ height: '40px' }}
                        placeholder="e.g. Civil Construction, Design"
                        value={editingItem.dept || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, dept: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>LOCATION</label>
                      <input
                        required
                        type="text"
                        className="vgn-input"
                        style={{ height: '40px' }}
                        value={editingItem.location || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px' }}>JOB ROLE DESCRIPTION</label>
                    <textarea
                      rows="4"
                      className="vgn-input"
                      value={editingItem.desc || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                      style={{ resize: 'none', padding: '10px' }}
                    />
                  </div>

                  <button type="submit" className="btn-vgn btn-vgn-blue" style={{ height: '40px', gap: '8px', marginTop: '10px' }}>
                    <Save size={16} /> SAVE ROLE
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed var(--gray-200)',
                padding: '40px',
                borderRadius: '6px',
                textAlign: 'center',
                color: 'var(--gray-400)',
                background: 'var(--bg-light)'
              }}
            >
              <Info size={32} style={{ margin: '0 auto 12px auto', color: 'var(--gray-300)' }} />
              <h4 style={{ fontWeight: '750', fontSize: '14px', color: 'var(--gray-500)', marginBottom: '4px' }}>No Record Selected</h4>
              <p style={{ fontSize: '11px' }}>
                Select any item on the left panel using the Edit button to edit it, or click Add to create a new one.
              </p>
            </div>
        )}
      </div>
    </motion.div>

      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                pointerEvents: 'auto',
                background: toast.type === 'success' ? 'var(--vgn-gold)' : '#ef4444',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                maxWidth: '320px',
                backdropFilter: 'blur(4px)'
              }}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  lineHeight: 1,
                  padding: 0,
                  marginLeft: 'auto',
                  flexShrink: 0
                }}
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
