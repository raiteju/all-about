'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { API_URL } from '@/lib/api';

interface Submission {
  _id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  adminNotes: string;
  repliedAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

const SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  support: 'Technical Support',
  feedback: 'Feedback & Suggestions',
  business: 'Business & Partnerships',
  advertising: 'Advertising & Sponsorship',
  report: 'Report an Issue',
  other: 'Other',
};

export default function AdminContact() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  // Detail modal
  const [selected, setSelected] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [listRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/contact`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/contact/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const listData = await listRes.json();
      const statsData = await statsRes.json();

      setSubmissions(listData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================
  // FILTER
  // ============================================
  const filtered = submissions.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ============================================
  // OPEN DETAIL (auto-marks as read)
  // ============================================
  const openDetail = async (submission: Submission) => {
    setSelected(submission);
    setAdminNotes(submission.adminNotes || '');

    // Auto-mark as read on backend
    if (submission.status === 'new') {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/contact/${submission._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Refresh list to update status
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ============================================
  // UPDATE STATUS
  // ============================================
  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contact/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
        if (selected && selected._id === id) {
          const updated = await res.json();
          setSelected(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================
  // SAVE NOTES
  // ============================================
  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contact/${selected._id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNotes }),
      });
      if (res.ok) {
        alert('Notes saved');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  // ============================================
  // DELETE
  // ============================================
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (selected && selected._id === id) setSelected(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================
  // EXPORT CSV
  // ============================================
  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/contact/export?status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to export');

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `contact-submissions-${filter}-${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  // ============================================
  // STATUS BADGE HELPER
  // ============================================
  const getStatusBadge = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      new: { background: '#eff6ff', color: '#00a8e8', fontWeight: 600 },
      read: { background: '#fef3c7', color: '#d97706', fontWeight: 600 },
      replied: { background: '#ecfdf5', color: '#059669', fontWeight: 600 },
      archived: { background: '#f3f4f6', color: '#6b7280', fontWeight: 600 },
    };
    return (
      <span
        style={{
          ...styles[status],
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          textTransform: 'capitalize',
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) return <div>Loading submissions...</div>;

  return (
    <div>
      {/* ============ HEADER ============ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
            Contact Submissions
          </h2>
          {stats && (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              {stats.new} new · {stats.read} read · {stats.replied} replied · {stats.archived} archived · <strong>{stats.total} total</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filter buttons */}
          {(['all', 'new', 'read', 'replied', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? styles.btnPrimary : styles.btnOutline}
              style={{ position: 'relative' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'new' && stats && stats.new > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginLeft: '6px',
                }}>
                  {stats.new}
                </span>
              )}
            </button>
          ))}

          {/* Export */}
          <button
            onClick={handleExport}
            className={styles.btnSuccess}
            disabled={exporting || filtered.length === 0}
            style={{
              opacity: exporting || filtered.length === 0 ? 0.6 : 1,
              cursor: exporting || filtered.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {exporting ? 'Exporting...' : '⬇ Export CSV'}
          </button>
        </div>
      </div>

      {/* ============ SEARCH ============ */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search by name, email, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.formInput}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* ============ LIST ============ */}
      {filtered.length === 0 ? (
        <div className={styles.tableContainer} style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>
            {search ? 'No submissions match your search.' : 'No submissions yet.'}
          </p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openDetail(s)}
                >
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>
                    CS-{s._id.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.email}</div>
                  </td>
                  <td>{SUBJECT_LABELS[s.subject] || s.subject}</td>
                  <td>{getStatusBadge(s.status)}</td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className={styles.btnDanger}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ DETAIL MODAL ============ */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  CS-{selected._id.slice(-6).toUpperCase()}
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className={styles.modalClose}
              >
                ✕
              </button>
            </div>

            {/* Contact Info */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '2px' }}>NAME</div>
                <div style={{ fontSize: '15px' }}>{selected.name}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '2px' }}>EMAIL</div>
                <a href={`mailto:${selected.email}`} style={{ color: '#00a8e8', fontSize: '15px', textDecoration: 'none' }}>
                  {selected.email}
                </a>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '2px' }}>PHONE</div>
                <div style={{ fontSize: '15px' }}>{selected.countryCode} {selected.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '2px' }}>SUBJECT</div>
                <div style={{ fontSize: '15px' }}>{SUBJECT_LABELS[selected.subject] || selected.subject}</div>
              </div>
            </div>

            {/* Message */}
            <div style={{
              background: '#f9fafb',
              borderLeft: '4px solid #00a8e8',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>MESSAGE</div>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '14px', lineHeight: 1.7 }}>
                {selected.message}
              </p>
            </div>

            {/* Status Actions */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>
                STATUS
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['new', 'read', 'replied', 'archived'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected._id, s)}
                    className={selected.status === s ? styles.btnPrimary : styles.btnOutline}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>
                ADMIN NOTES (PRIVATE)
              </div>
              <textarea
                className={styles.formInput}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add private notes about this submission..."
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className={styles.btnOutline}
                style={{ marginTop: '8px' }}
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <a
                href={`mailto:${selected.email}?subject=Re: ${SUBJECT_LABELS[selected.subject] || selected.subject}`}
                className={styles.btnPrimary}
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                📧 Reply via Email
              </a>
              <button
                onClick={() => handleDelete(selected._id)}
                className={styles.btnDanger}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}