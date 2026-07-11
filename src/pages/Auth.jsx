import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ShieldAlert, LogIn, UserPlus, Check, Eye, EyeOff } from 'lucide-react';

export default function Auth({ onLoginSuccess, inModal }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(null); // { user, type: 'login' | 'register' }
  const successTimerRef = useRef(null);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const showLoginSuccess = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setSuccess({ user, type: 'login' });
    successTimerRef.current = setTimeout(() => onLoginSuccess(user), 1500);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const normalizedEmail = formData.email.trim().toLowerCase();

    // 1. Admin Verification
    if (isLogin && normalizedEmail === 'sreeraamshethu@admin') {
      if (formData.password === 'sethupandian@0909') {
        showLoginSuccess({ name: 'S.M. Sethu Pandian B.E. (Admin)', email: 'sreeraamshethu@admin', role: 'admin' });
      } else {
        setErrorMsg('Invalid admin password.');
      }
      return;
    }

    // 2. Client Operations
    if (isLogin) {
      // Client Login
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(normalizedEmail)) {
        setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
        return;
      }

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === formData.password);

      if (!user) {
        setErrorMsg('Invalid email or password.');
        return;
      }

      showLoginSuccess({ ...user, role: 'client' });
    } else {
      // Client Registration
      if (normalizedEmail === 'sreeraamshethu@admin') {
        setErrorMsg('This email is reserved for administration.');
        return;
      }

      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setErrorMsg('Please fill in all registration fields.');
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(normalizedEmail)) {
        setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
        return;
      }

      if (formData.password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase());

      if (userExists) {
        setErrorMsg('Account with this email already exists.');
        return;
      }

      const newUser = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        password: formData.password
      };

      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      const registeredUser = { ...newUser, role: 'client' };
      // Don't auto-login — save user to registered list only (already done above)
      setSuccess({ user: registeredUser, type: 'register' });
      successTimerRef.current = setTimeout(() => {
        setSuccess(null);
        setFormData({ name: '', email: registeredUser.email, phone: '', password: '', confirmPassword: '' });
        setIsLogin(true);
        setErrorMsg('');
      }, 1800);
    }
  };

  // Shared form renderer (error + fields + submit button)
  const renderForm = () => (
    <>
      {errorMsg && (
        <div
          style={{
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            color: '#C53030',
            padding: '12px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}
        >
          <ShieldAlert size={16} /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: inModal ? '14px' : '18px' }}>
        {!isLogin && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--gray-500)' }} />
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="vgn-input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px', textTransform: 'uppercase' }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--gray-500)' }} />
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  className="vgn-input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address / Username</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--gray-500)' }} />
            <input
              required
              type={isLogin ? "text" : "email"}
              name="email"
              placeholder={isLogin ? "Enter your email" : "Enter your email"}
              className="vgn-input"
              style={{ paddingLeft: '40px' }}
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px', textTransform: 'uppercase' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--gray-500)' }} />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              className="vgn-input"
              style={{ paddingLeft: '40px', paddingRight: '40px' }}
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                color: 'var(--gray-500)'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--vgn-blue-dark)', marginBottom: '6px', textTransform: 'uppercase' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--gray-500)' }} />
              <input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                className="vgn-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                  color: 'var(--gray-500)'
                }}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="btn-vgn btn-vgn-blue" style={{ width: '100%', marginTop: '10px', gap: '8px' }}>
          {isLogin ? (
            <>LOG IN <LogIn size={16} /></>
          ) : (
            <>SIGN UP &amp; ENTER <UserPlus size={16} /></>
          )}
        </button>
      </form>
    </>
  );

  // ─── MODAL VARIANT: Compact, form-only ───
  if (inModal) {
    if (success) {
      const isLoginSuccess = success.type === 'login';
      const gradientBg = isLoginSuccess
        ? 'linear-gradient(135deg, #0A0A18, #1A1A2E)'
        : 'linear-gradient(135deg, var(--vgn-gold), var(--vgn-gold-hover))';
      const shadowColor = isLoginSuccess
        ? 'rgba(26, 58, 92, 0.25)'
        : 'rgba(197, 160, 89, 0.25)';

      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="success"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              textAlign: 'center',
              padding: '20px 10px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Animated checkmark circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 12 }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: gradientBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: `0 8px 24px ${shadowColor}`
              }}
            >
              <motion.svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M20 6L9 17l-5-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.35, ease: 'easeOut' }}
                />
              </motion.svg>
            </motion.div>

            {/* Welcome message */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <h3 style={{ fontSize: '20px', color: 'var(--vgn-blue-dark)', fontWeight: '800', margin: 0 }}>
                {isLoginSuccess ? `Welcome back, ${success.user.name}!` : `Welcome, ${success.user.name}!`}
              </h3>
              <div style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '8px', lineHeight: '1.5' }}>
                {isLoginSuccess ? (
                  'Successfully logged in. Redirecting to your dashboard...'
                ) : (
                  <>
                    Your account has been created successfully. <br />
                    Switching to login so you can sign in.
                  </>
                )}
              </div>
            </motion.div>

            {/* Confetti dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: '8px', marginTop: '4px' }}
            >
              {['#D4AF37', isLoginSuccess ? '#2C2C48' : 'var(--vgn-gold)', '#FF6B6B', '#E8D5A3', '#FFB347'].map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -10, opacity: 0, scale: 0 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 300, damping: 10 }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: color
                  }}
                />
              ))}
            </motion.div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'flex', gap: '5px', marginTop: '15px' }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--vgn-gold)'
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ textAlign: 'left' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--vgn-blue-dark)', fontWeight: '800' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--vgn-gold)',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
          {renderForm()}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── FULL-PAGE VARIANT ───
  return (
    <div className="container" style={{ padding: '60px 0 100px 0', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="vgn-card"
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Left Side Branding Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A0A18 0%, var(--vgn-blue-dark) 100%)',
            color: 'var(--white)',
            padding: '50px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'left',
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '15px 15px', pointerEvents: 'none' }} />

          <div style={{ zIndex: 1 }}>
            <h3 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>
              Sree Raam Shethu Portal
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', lineHeight: '1.7' }}>
              Log in to view construction phase logs, check billing, download agreement sheets, and chat directly with S.M. Sethu Pandian B.E.
            </p>
          </div>

          <div style={{ zIndex: 1, marginTop: '40px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', background: 'var(--vgn-gold)', borderRadius: '50%' }} />
              <span style={{ fontSize: '12px', color: 'var(--vgn-gold)', fontWeight: '700' }}>Active Project Tracking</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '6px', height: '6px', background: 'var(--vgn-gold)', borderRadius: '50%' }} />
              <span style={{ fontSize: '12px', color: 'var(--vgn-gold)', fontWeight: '700' }}>Direct Structural Inquiries</span>
            </div>
          </div>
        </div>

        {/* Right Side Form Card */}
        <div style={{ padding: '50px 40px', background: 'var(--white)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--vgn-blue-dark)', fontWeight: '800' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--vgn-gold)',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
          {renderForm()}
        </div>
      </div>
    </div>
  );
}
