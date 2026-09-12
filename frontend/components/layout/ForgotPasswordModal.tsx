'use client';

import { useState } from 'react';
import styles from './AuthModal.module.css';
import { API_URL } from '@/lib/api';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({ onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(data.message || 'Password reset link sent to your email!');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.subtitle}>Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          {message && (
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              color: '#166534', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              fontSize: '14px', 
              marginBottom: '16px',
              borderLeft: '4px solid #22c55e'
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              color: '#991b1b', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              fontSize: '14px', 
              marginBottom: '16px',
              borderLeft: '4px solid #ef4444'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className={styles.switchText}>
          Remember your password?{' '}
          <button onClick={onBackToLogin} className={styles.switchLink}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}