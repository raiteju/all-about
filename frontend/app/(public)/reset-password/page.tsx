'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import styles from './ResetPassword.module.css';

// 👇 Inner component that uses useSearchParams (must be inside Suspense)
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // If no token or email, show error
  if (!token || !email) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorEmoji}>⚠️</div>
          <h1 className={styles.errorTitle}>Invalid Reset Link</h1>
          <p className={styles.errorText}>This reset link is invalid or expired.</p>
          <Link href="/" className={styles.errorHomeLink}>
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Set New Password</h1>
          <p className={styles.subtitle}>Create a new password for your account</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* New Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            <span className={styles.hint}>Must be at least 6 characters</span>
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✓</span>
              {message}
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>✕</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <p className={styles.footer}>
          Remember your password?{' '}
          <Link href="/" className={styles.backLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// 👇 Default export wraps the inner component in Suspense (fixes the build error)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}