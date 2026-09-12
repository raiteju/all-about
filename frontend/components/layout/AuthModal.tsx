'use client';

import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import styles from './AuthModal.module.css';
import { registerUser, loginUser, forgotPassword, googleLogin } from '@/lib/api';

export default function AuthModal({ onClose, initialMode }: { onClose: () => void; initialMode: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: ''
  });

  // Remember Me state
  const [rememberMe, setRememberMe] = useState(false);

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // 🔐 Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await googleLogin(credentialResponse.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      onClose();
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'register') {
        await registerUser(formData);
        const loginData = await loginUser({ email: formData.email, password: formData.password });
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData));
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        alert('Account created successfully!');
        onClose();
        window.location.href = '/dashboard';
      } else if (mode === 'forgot') {
        const res = await forgotPassword(formData.email);
        setSuccessMsg(res.message);
      } else {
        const data = await loginUser({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        alert('Login successful!');
        onClose();
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {mode === 'forgot' ? (
          <>
            <button className={styles.backBtn} onClick={() => { setMode('login'); setSuccessMsg(''); setError(''); }}>← Back to Login</button>
            <h2 className={styles.title}>Reset Password</h2>
            <p className={styles.subtitle}>Enter your email and we'll send you a reset link.</p>
            
            {successMsg ? (
              <div className={styles.successMessage}>{successMsg}</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input type="email" name="email" className={styles.input} placeholder="you@example.com" onChange={handleChange} required />
                </div>
                {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </>
        ) : mode === 'login' ? (
          <>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>Login to manage your articles.</p>

            {/* 🔐 Google Login Button */}
            <div className={styles.googleBtnWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
                text="signin_with"
                width="360"
              />
            </div>

            <div className={styles.divider}>
              <span>or continue with email</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  className={styles.input} 
                  placeholder="you@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    type={showLoginPass ? "text" : "password"} 
                    name="password" 
                    className={styles.input} 
                    placeholder="••••••••" 
                    onChange={handleChange} 
                  />
                  <button 
                    type="button" 
                    className={styles.eyeBtn} 
                    onClick={() => setShowLoginPass(!showLoginPass)}
                  >
                    {showLoginPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

              <div className={styles.utilRow}>
                <label className={styles.rememberMe}>
                  <input 
                    type="checkbox" 
                    className={styles.checkbox} 
                    checked={rememberMe} 
                    onChange={handleRememberMeChange} 
                  /> Remember me
                </label>
                <button type="button" className={styles.forgotLink} onClick={() => { setMode('forgot'); setError(''); }}>Forgot Password?</button>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p className={styles.switchText}>
              Don&apos;t have an account?{' '}
              <button onClick={switchMode} className={styles.switchLink}>Register</button>
            </p>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>Register to become an author or guest blogger.</p>

            {/* 🔐 Google Signup Button */}
            <div className={styles.googleBtnWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
                text="signup_with"
                width="360"
              />
            </div>

            <div className={styles.divider}>
              <span>or continue with email</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.col}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>First Name</label>
                    <input type="text" name="firstName" className={styles.input} placeholder="John" onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.col}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name</label>
                    <input type="text" name="lastName" className={styles.input} placeholder="Doe" onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <input type="text" name="username" className={styles.input} placeholder="johndoe" onChange={handleChange} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" name="email" className={styles.input} placeholder="you@example.com" onChange={handleChange} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    type={showRegPass ? "text" : "password"} 
                    name="password" 
                    className={styles.input} 
                    placeholder="Create a strong password" 
                    onChange={handleChange} 
                  />
                  <button 
                    type="button" 
                    className={styles.eyeBtn} 
                    onClick={() => setShowRegPass(!showRegPass)}
                  >
                    {showRegPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <p className={styles.switchText}>
              Already have an account?{' '}
              <button onClick={switchMode} className={styles.switchLink}>Login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}