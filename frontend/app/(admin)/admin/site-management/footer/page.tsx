'use client';

import { useEffect, useState } from 'react';
import styles from '../../admin.module.css';
import { API_URL } from '@/lib/api';

export default function FooterManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    footerAbout: '',
    footerCopyright: '',
    footerAuthorName: '',
    footerLinks: [] as { label: string; href: string; order: number }[],
    socialLinks: [] as { platform: string; url: string; order: number }[],
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-settings`);
        const data = await res.json();
        setFormData({
          footerAbout: data.footerAbout || '',
          footerCopyright: data.footerCopyright || '',
          footerAuthorName: data.footerAuthorName || '',
          footerLinks: data.footerLinks || [],
          socialLinks: data.socialLinks || [],
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

      setMessage('✅ Footer settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ========== FOOTER LINKS MANAGEMENT ==========
  const addFooterLink = () => {
    setFormData({
      ...formData,
      footerLinks: [
        ...formData.footerLinks,
        { label: '', href: '', order: formData.footerLinks.length + 1 },
      ],
    });
  };

  const updateFooterLink = (index: number, field: string, value: string | number) => {
    const updated = [...formData.footerLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, footerLinks: updated });
  };

  const removeFooterLink = (index: number) => {
    const updated = formData.footerLinks.filter((_, i) => i !== index);
    updated.forEach((link, i) => (link.order = i + 1));
    setFormData({ ...formData, footerLinks: updated });
  };

  // ========== SOCIAL LINKS MANAGEMENT ==========
  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [
        ...formData.socialLinks,
        { platform: '', url: '', order: formData.socialLinks.length + 1 },
      ],
    });
  };

  const updateSocialLink = (index: number, field: string, value: string | number) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, socialLinks: updated });
  };

  const removeSocialLink = (index: number) => {
    const updated = formData.socialLinks.filter((_, i) => i !== index);
    updated.forEach((link, i) => (link.order = i + 1));
    setFormData({ ...formData, socialLinks: updated });
  };

  const platformOptions = [
    'facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok', 'github', 'pinterest'
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading footer settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          Footer Management
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Manage footer content, links, and social media.
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

      {/* Footer Content */}
      <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          Footer Content
        </h3>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>About Text</label>
          <textarea
            className={styles.formInput}
            value={formData.footerAbout}
            onChange={(e) => setFormData({ ...formData, footerAbout: e.target.value })}
            placeholder="All about is the world's leading community..."
            rows={3}
            style={{ fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Copyright Text</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.footerCopyright}
            onChange={(e) => setFormData({ ...formData, footerCopyright: e.target.value })}
            placeholder="©2023 - 2026. All rights reserved."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Author Name</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.footerAuthorName}
            onChange={(e) => setFormData({ ...formData, footerAuthorName: e.target.value })}
            placeholder="Teju Rai"
          />
        </div>
      </div>

      {/* Footer Links */}
      <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Footer Links
            </h3>
            <p style={{ color: '#6b7280', fontSize: '13px' }}>
              Links shown at the bottom of the footer.
            </p>
          </div>
          <button onClick={addFooterLink} className={styles.btnPrimary}>
            + Add Link
          </button>
        </div>

        {formData.footerLinks.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            No footer links yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formData.footerLinks.map((link, index) => (
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
                  onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                  placeholder="Label (e.g., About)"
                />
                <input
                  type="text"
                  className={styles.formInput}
                  value={link.href}
                  onChange={(e) => updateFooterLink(index, 'href', e.target.value)}
                  placeholder="URL (e.g., /about)"
                />
                <input
                  type="number"
                  className={styles.formInput}
                  value={link.order}
                  onChange={(e) => updateFooterLink(index, 'order', parseInt(e.target.value))}
                  placeholder="Order"
                />
                <button
                  onClick={() => removeFooterLink(index)}
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

      {/* Social Links */}
      <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Social Media Links
            </h3>
            <p style={{ color: '#6b7280', fontSize: '13px' }}>
              Social media icons shown in the footer.
            </p>
          </div>
          <button onClick={addSocialLink} className={styles.btnPrimary}>
            + Add Social
          </button>
        </div>

        {formData.socialLinks.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            No social links yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formData.socialLinks.map((link, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 80px 40px',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <select
                  className={styles.formInput}
                  value={link.platform}
                  onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select Platform</option>
                  {platformOptions.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className={styles.formInput}
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
                <input
                  type="number"
                  className={styles.formInput}
                  value={link.order}
                  onChange={(e) => updateSocialLink(index, 'order', parseInt(e.target.value))}
                  placeholder="Order"
                />
                <button
                  onClick={() => removeSocialLink(index)}
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
          {saving ? 'Saving...' : '💾 Save Footer Settings'}
        </button>
      </div>
    </div>
  );
}