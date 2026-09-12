'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../admin.module.css';
import { API_URL } from '@/lib/api';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

// ============================================
// PLACEHOLDERS
// ============================================
const PLACEHOLDERS = [
  { tag: '{{name}}', label: 'Name' },
  { tag: '{{email}}', label: 'Email' },
  { tag: '{{phone}}', label: 'Phone' },
  { tag: '{{subject}}', label: 'Subject' },
  { tag: '{{message}}', label: 'Message' },
  { tag: '{{reference}}', label: 'Reference ID' },
  { tag: '{{siteName}}', label: 'Site Name' },
  { tag: '{{siteUrl}}', label: 'Site URL' },
];

interface ContactSettings {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAutoReplyEnabled: boolean;
  contactAutoReplyFormat: 'plain' | 'html';
  contactAutoReplySubject: string;
  contactAutoReplyBodyPlain: string;
  contactAutoReplyBodyHtml: string;
}

export default function ContactSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ContactSettings>({
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    contactAutoReplyEnabled: true,
    contactAutoReplyFormat: 'plain',
    contactAutoReplySubject: '',
    contactAutoReplyBodyPlain: '',
    contactAutoReplyBodyHtml: '',
  });

  // Refs for inserting placeholders at cursor position
  const plainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const quillRef = useRef<any>(null);

  // ============================================
  // FETCH SETTINGS
  // ============================================
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-settings`);
        const data = await res.json();
        setFormData({
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          contactAddress: data.contactAddress || '',
          contactAutoReplyEnabled: data.contactAutoReplyEnabled !== false,
          contactAutoReplyFormat: data.contactAutoReplyFormat || 'plain',
          contactAutoReplySubject:
            data.contactAutoReplySubject ||
            'We received your message - {{siteName}} (#{{reference}})',
          contactAutoReplyBodyPlain: data.contactAutoReplyBodyPlain || '',
          contactAutoReplyBodyHtml: data.contactAutoReplyBodyHtml || '',
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

  // ============================================
  // SAVE SETTINGS
  // ============================================
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    // Validate email if provided
    if (formData.contactEmail && formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail.trim())) {
        setError('Please enter a valid email address for the destination');
        setSaving(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/site-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contactEmail: formData.contactEmail.trim().toLowerCase(),
          contactPhone: formData.contactPhone.trim(),
          contactAddress: formData.contactAddress.trim(),
          contactAutoReplyEnabled: formData.contactAutoReplyEnabled,
          contactAutoReplyFormat: formData.contactAutoReplyFormat,
          contactAutoReplySubject: formData.contactAutoReplySubject.trim(),
          contactAutoReplyBodyPlain: formData.contactAutoReplyBodyPlain,
          contactAutoReplyBodyHtml: formData.contactAutoReplyBodyHtml,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save');
      }

      setMessage('✅ Contact settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // INSERT PLACEHOLDER AT CURSOR (Plain Text)
  // ============================================
  const insertPlainPlaceholder = (placeholder: string) => {
    const textarea = plainTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = formData.contactAutoReplyBodyPlain;
    const newValue =
      currentValue.substring(0, start) + placeholder + currentValue.substring(end);

    setFormData({ ...formData, contactAutoReplyBodyPlain: newValue });

    // Restore cursor position after inserted placeholder
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // ============================================
  // INSERT PLACEHOLDER AT CURSOR (Quill HTML)
  // ============================================
  const insertHtmlPlaceholder = (placeholder: string) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    const index = range ? range.index : quill.getLength();

    quill.insertText(index, placeholder, 'user');
    quill.setSelection(index + placeholder.length, 0, 'user');
  };

  const insertPlaceholder = (placeholder: string) => {
    if (formData.contactAutoReplyFormat === 'html') {
      insertHtmlPlaceholder(placeholder);
    } else {
      insertPlainPlaceholder(placeholder);
    }
  };

  // ============================================
  // QUILL CONFIG
  // ============================================
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'link',
    'list',
    'align',
  ];

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading contact settings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* ============ HEADER ============ */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          Contact Settings
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Configure where contact form submissions are sent and how they're handled.
        </p>
      </div>

      {/* ============ STATUS MESSAGES ============ */}
      {message && (
        <div
          style={{
            background: '#f0fdf4',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '4px solid #22c55e',
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '4px solid #ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* ============ DESTINATION EMAIL ============ */}
      <div
        className={styles.tableContainer}
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
          Destination Email
        </h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
          Where admin notifications are sent when someone submits the contact form.
        </p>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Admin Notification Email</label>
          <input
            type="email"
            className={styles.formInput}
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            placeholder="admin@example.com"
          />
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            💡 Leave empty to use the default SMTP_USER from environment
          </p>
        </div>
      </div>

      {/* ============ AUTO-REPLY ============ */}
      <div
        className={styles.tableContainer}
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
          Auto-Reply to Users
        </h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
          Automatically send a confirmation email to users who submit the contact form.
        </p>

        {/* Master Toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 16px',
            background: formData.contactAutoReplyEnabled ? '#f0fdf4' : '#f9fafb',
            border: `1.5px solid ${
              formData.contactAutoReplyEnabled ? '#22c55e' : '#e5e7eb'
            }`,
            borderRadius: '10px',
            transition: 'all 0.2s',
            marginBottom: '20px',
          }}
        >
          <input
            type="checkbox"
            checked={formData.contactAutoReplyEnabled}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactAutoReplyEnabled: e.target.checked,
              })
            }
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {formData.contactAutoReplyEnabled
                ? '✓ Auto-reply is ON'
                : '✗ Auto-reply is OFF'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {formData.contactAutoReplyEnabled
                ? 'Users will receive a confirmation email.'
                : 'Users will NOT receive a confirmation.'}
            </div>
          </div>
        </label>

        {/* ============ EXPANDED SETTINGS (only if enabled) ============ */}
        {formData.contactAutoReplyEnabled && (
          <div
            style={{
              padding: '20px',
              background: '#fafbfc',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
            }}
          >
            {/* ============ FORMAT SELECTOR ============ */}
            <div style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>Reply Format</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                {/* Plain Text option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    border: `2px solid ${
                      formData.contactAutoReplyFormat === 'plain'
                        ? '#00a8e8'
                        : '#e5e7eb'
                    }`,
                    background:
                      formData.contactAutoReplyFormat === 'plain'
                        ? '#eff6ff'
                        : 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flex: '1',
                    minWidth: '180px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.contactAutoReplyFormat === 'plain'}
                    onChange={() =>
                      setFormData({ ...formData, contactAutoReplyFormat: 'plain' })
                    }
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      📝 Plain Text
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Simple text with line breaks
                    </div>
                  </div>
                </label>

                {/* Custom HTML option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    border: `2px solid ${
                      formData.contactAutoReplyFormat === 'html'
                        ? '#00a8e8'
                        : '#e5e7eb'
                    }`,
                    background:
                      formData.contactAutoReplyFormat === 'html'
                        ? '#eff6ff'
                        : 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flex: '1',
                    minWidth: '180px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.contactAutoReplyFormat === 'html'}
                    onChange={() =>
                      setFormData({ ...formData, contactAutoReplyFormat: 'html' })
                    }
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      🎨 Custom HTML
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Rich text with formatting
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* ============ SUBJECT ============ */}
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>Email Subject</label>
              <input
                type="text"
                className={styles.formInput}
                value={formData.contactAutoReplySubject}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactAutoReplySubject: e.target.value,
                  })
                }
                placeholder="We received your message - {{siteName}} (#{{reference}})"
              />
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                Supports placeholders like {'{{name}}'}, {'{{reference}}'}, {'{{siteName}}'}
              </p>
            </div>

            {/* ============ BODY EDITOR ============ */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Body</label>

              {formData.contactAutoReplyFormat === 'plain' ? (
                // ============ PLAIN TEXT EDITOR ============
                <textarea
                  ref={plainTextareaRef}
                  className={styles.formInput}
                  value={formData.contactAutoReplyBodyPlain}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactAutoReplyBodyPlain: e.target.value,
                    })
                  }
                  placeholder="Hi {{name}},&#10;&#10;Thank you for contacting us! We received your message and will reply within 24-48 hours.&#10;&#10;Reference: #{{reference}}"
                  rows={12}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    padding: '14px',
                  }}
                />
              ) : (
                // ============ HTML (QUILL) EDITOR ============
                <div style={{ background: 'white', borderRadius: '8px' }}>
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.contactAutoReplyBodyHtml}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        contactAutoReplyBodyHtml: value,
                      })
                    }
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ minHeight: '280px' }}
                  />
                </div>
              )}
            </div>

            {/* ============ PLACEHOLDER HELPERS ============ */}
            <div style={{ marginTop: '16px' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                AVAILABLE PLACEHOLDERS (click to insert):
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {PLACEHOLDERS.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => insertPlaceholder(p.tag)}
                    style={{
                      padding: '6px 12px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00a8e8';
                      e.currentTarget.style.color = '#00a8e8';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.background = 'white';
                    }}
                    title={`Insert ${p.tag}`}
                  >
                    {p.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ PUBLIC CONTACT INFO ============ */}
      <div
        className={styles.tableContainer}
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
          Public Contact Info (Optional)
        </h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
          These details can be displayed on the public contact page.
        </p>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Public Phone Number</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
            placeholder="+971 50 123 4567"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Public Address</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.contactAddress}
            onChange={(e) =>
              setFormData({ ...formData, contactAddress: e.target.value })
            }
            placeholder="Dubai, UAE"
          />
        </div>
      </div>

      {/* ============ SAVE BUTTON ============ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.btnPrimary}
          style={{
            padding: '12px 32px',
            fontSize: '15px',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : '💾 Save Contact Settings'}
        </button>
      </div>
    </div>
  );
}