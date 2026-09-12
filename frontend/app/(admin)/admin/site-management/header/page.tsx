'use client';

import { useEffect, useState } from 'react';
import styles from '../../admin.module.css';
import { API_URL } from '@/lib/api';

export default function HeaderManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    siteName: '',
    logo: '',
    headerLinks: [] as { label: string; href: string; order: number }[],
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-settings`);
        const data = await res.json();
        setFormData({
          siteName: data.siteName || '',
          logo: data.logo || '',
          headerLinks: data.headerLinks || [],
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/site-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save');
      }

      setMessage('✅ Header settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add a new link
  const addLink = () => {
    setFormData({
      ...formData,
      headerLinks: [
        ...formData.headerLinks,
        { label: '', href: '', order: formData.headerLinks.length + 1 },
      ],
    });
  };

  // Update a link field
  const updateLink = (index: number, field: string, value: string | number) => {
    const updated = [...formData.headerLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, headerLinks: updated });
  };

  // Remove a link
  const removeLink = (index: number) => {
    const updated = formData.headerLinks.filter((_, i) => i !== index);
    // Re-order
    updated.forEach((link, i) => (link.order = i + 1));
    setFormData({ ...formData, headerLinks: updated });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading header settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          Header Management
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Manage the site logo, name, and navigation links.
        </p>
      </div>

      {/* Success / Error Messages */}
      {message && (
        <div style={{ 
          background: '#f0fdf4', 
          color: '#166534', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          borderLeft: '4px solid #22c55e'
        }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#991b1b', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          borderLeft: '4px solid #ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Site Name */}
      <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Site Name</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            placeholder="AllAbout"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Logo URL</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="/logo.svg"
          />
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            Path to logo (e.g., <code>/logo.svg</code>) or full URL
          </p>
        </div>
      </div>

      {/* Header Links */}
      <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Navigation Links</h3>
            <p style={{ color: '#6b7280', fontSize: '13px' }}>Links shown in the header navigation bar.</p>
          </div>
          <button onClick={addLink} className={styles.btnPrimary}>
            + Add Link
          </button>
        </div>

        {formData.headerLinks.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            No links yet. Click "Add Link" to start.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formData.headerLinks.map((link, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 80px 40px', 
                  gap: '12px', 
                  alignItems: 'center' 
                }}
              >
                <input
                  type="text"
                  className={styles.formInput}
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  placeholder="Label (e.g., Home)"
                />
                <input
                  type="text"
                  className={styles.formInput}
                  value={link.href}
                  onChange={(e) => updateLink(index, 'href', e.target.value)}
                  placeholder="URL (e.g., /)"
                />
                <input
                  type="number"
                  className={styles.formInput}
                  value={link.order}
                  onChange={(e) => updateLink(index, 'order', parseInt(e.target.value))}
                  placeholder="Order"
                />
                <button
                  onClick={() => removeLink(index)}
                  className={styles.btnDanger}
                  style={{ padding: '8px', fontSize: '16px' }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.btnPrimary}
          style={{ padding: '12px 32px', fontSize: '15px', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : '💾 Save Header Settings'}
        </button>
      </div>
    </div>
  );
}