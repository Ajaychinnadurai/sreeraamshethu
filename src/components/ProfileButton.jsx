import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, LogOut, Edit2, Save, X } from 'lucide-react';

export default function ProfileButton({ user, onLogout, onUpdateUser, roleLabel = 'User', footerLabel = '' }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const profileRef = useRef(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  const openEditModal = () => {
    setEditForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    setShowEditModal(true);
    setShowProfile(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.email.trim()) return;
    const updatedUser = { ...user, name: editForm.name.trim(), email: editForm.email.trim(), phone: editForm.phone.trim() };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    if (onUpdateUser) onUpdateUser(updatedUser);
    setShowEditModal(false);
  };

  return (
    <>
      <div style={{ position: 'relative' }} ref={profileRef}>
        <button
          onClick={() => setShowProfile(!showProfile)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-light)',
            border: '1px solid var(--gray-100)',
            borderRadius: '6px',
            padding: '5px 10px 5px 5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={user.name}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--vgn-blue-dark), var(--vgn-blue-medium))',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '800',
              letterSpacing: '0.5px',
              flexShrink: 0
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>
            {user.name}
          </span>
          <ChevronDown size={12} style={{ color: 'var(--gray-400)', transition: 'transform 0.2s ease', transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>

        {showProfile && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '260px',
              background: 'var(--white)',
              borderRadius: '6px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              border: '1px solid var(--gray-100)',
              overflow: 'hidden',
              zIndex: 9999
            }}
          >
            {/* Profile Header */}
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                borderBottom: '1px solid var(--gray-100)',
                background: 'var(--bg-light)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--vgn-blue-dark), var(--vgn-blue-medium))',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  margin: '0 auto 12px auto'
                }}
              >
                {initials}
              </div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--vgn-blue-dark)' }}>{user.name}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--gray-500)' }}>{roleLabel}</p>
            </div>

            {/* Profile Details */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--vgn-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--vgn-blue-dark)' }}>
                  <User size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>{user.email}</div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>Email ID</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--vgn-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--vgn-blue-dark)' }}>
                  <User size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--vgn-blue-dark)' }}>{user.phone || '—'}</div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>Mobile</div>
                </div>
              </div>
            </div>

            {/* Edit + Logout Actions */}
            <div
              style={{
                padding: '10px 12px',
                borderTop: '1px solid var(--gray-100)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              {/* Edit Profile Button */}
              <button
                onClick={openEditModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  height: '34px',
                  background: 'var(--vgn-blue-light)',
                  border: '1px solid var(--gray-100)',
                  borderRadius: '4px',
                  color: 'var(--vgn-blue-dark)',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Edit2 size={13} />
                EDIT PROFILE
              </button>

              {footerLabel && (
                <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontStyle: 'italic', textAlign: 'center' }}>
                  {footerLabel}
                </span>
              )}
              <button
                onClick={() => { onLogout(); setShowProfile(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  height: '34px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={13} />
                LOG OUT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal Overlay */}
      {showEditModal && (
        <div
          onClick={() => setShowEditModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--gray-100)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--vgn-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vgn-blue-dark)' }}>
                  <Edit2 size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--vgn-blue-dark)' }}>Edit Profile</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  className="vgn-input"
                  style={{ height: '42px' }}
                  placeholder="Your full name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="vgn-input"
                  style={{ height: '42px' }}
                  placeholder="your@email.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="vgn-input"
                  style={{ height: '42px' }}
                  placeholder="e.g. 9876543210"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn-vgn btn-vgn-blue"
                style={{ height: '42px', gap: '8px', marginTop: '8px' }}
              >
                <Save size={16} />
                SAVE CHANGES
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
