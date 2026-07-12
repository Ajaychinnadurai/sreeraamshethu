import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ShieldAlert, LogIn, UserPlus, Check, Eye, EyeOff } from 'lucide-react';
import { safeParseJson, saveLocalAndCloud, syncKeyFromCloud, supabase } from '../utils/storage';
import bcrypt from 'bcryptjs';

export default function Auth({ onLoginSuccess, inModal }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
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

  const handleFormSubmit = async (e) => {
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

      let user = null;
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('registered_users')
            .select('*')
            .eq('email', normalizedEmail);
          
          if (!error && data && data.length > 0) {
            const dbPassword = data[0].password;
            // Check if the stored password is a bcrypt hash (starts with $2a$ or $2b$) or plain text (legacy fallback)
            const isMatch = dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$')
              ? bcrypt.compareSync(formData.password, dbPassword)
              : formData.password === dbPassword;

            if (isMatch) {
              user = {
                name: data[0].name,
                email: data[0].email,
                phone: data[0].phone,
                password: dbPassword
              };
            }
          }
        } catch (err) {
          console.warn('Direct database login failed, falling back to local storage:', err);
        }
      }

      if (!user) {
        const users = safeParseJson(localStorage.getItem('registeredUsers'), []);
        const matched = users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (matched) {
          const dbPassword = matched.password;
          const isMatch = dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$')
            ? bcrypt.compareSync(formData.password, dbPassword)
            : formData.password === dbPassword;

          if (isMatch) {
            user = matched;
          }
        }
      }

      if (!user) {
        // User not found locally — force a fresh sync from Supabase with retries
        setSyncing(true);
        try {
          for (let attempt = 0; attempt < 3; attempt++) {
            await syncKeyFromCloud('registeredUsers');
            await new Promise(r => setTimeout(r, attempt === 0 ? 800 : 2000));

            const retryUsers = safeParseJson(localStorage.getItem('registeredUsers'), []);
            const retryMatch = retryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
            if (retryMatch) {
              const dbPassword = retryMatch.password;
              const isMatch = dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$')
                ? bcrypt.compareSync(formData.password, dbPassword)
                : formData.password === dbPassword;
              if (isMatch) {
                user = retryMatch;
                break;
              }
            }
          }
        } catch (syncErr) {
          console.warn('Sync retry failed:', syncErr);
        } finally {
          setSyncing(false);
        }
      }

      if (!user) {
        setErrorMsg('Invalid email or password. If you just signed up, please wait a moment and try again.');
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

      let userExists = false;
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('registered_users')
            .select('email')
            .eq('email', normalizedEmail);
          
          if (!error && data && data.length > 0) {
            userExists = true;
          }
        } catch (err) {
          console.warn('Direct database user exist check failed, checking local storage:', err);
        }
      }

      if (!userExists) {
        try {
          await syncKeyFromCloud('registeredUsers');
          const users = safeParseJson(localStorage.getItem('registeredUsers'), []);
          userExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
        } catch (syncErr) {
          console.warn('Signup duplicate check sync failed:', syncErr);
          const users = safeParseJson(localStorage.getItem('registeredUsers'), []);
          userExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
        }
      }

      if (userExists) {
        setErrorMsg('Account with this email already exists.');
        return;
      }

      // Hash the password securely with 10 salt rounds before saving
      const hashedPassword = bcrypt.hashSync(formData.password, 10);

      const newUser = {
        name: formData.name,
        email: normalizedEmail,
        phone: formData.phone,
        password: hashedPassword
      };

      const users = safeParseJson(localStorage.getItem('registeredUsers'), []);
      users.push(newUser);
      saveLocalAndCloud('registeredUsers', users);

      // Auto-login after successful registration
      const registeredUser = { ...newUser, role: 'client' };
      showLoginSuccess(registeredUser);
    }
  };

  // Shared form renderer (error + fields + submit button)
  const renderForm = () => (
    <>
      {syncing && (
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
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
          <div
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid #BFDBFE',
              borderTop: '2px solid #1E40AF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0
            }}
          />
          Syncing account data from server...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

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
                  autoComplete="name"
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
                  autoComplete="tel"
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
              autoComplete={isLogin ? "username" : "email"}
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
              autoComplete={isLogin ? "current-password" : "new-password"}
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
                autoComplete="new-password"
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

        <button type="submit" className="btn-vgn btn-vgn-blue" style={{ width: '100%', marginTop: '10px', gap: '8px', opacity: syncing ? 0.6 : 1 }} disabled={syncing}>
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
