'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { API_URL } from '@/lib/api';

interface Subscriber {
  _id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  source: string;
  subscribedAt: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/newsletter/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscribers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subscriber?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/newsletter/subscribers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSubscribers();
    } catch (err) {
      console.error(err);
    }
  };

  // 👇 NEW: Export CSV handler
  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/newsletter/subscribers/export?status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to export');
      }

      // Get the CSV content as a blob
      const blob = await res.blob();

      // Extract filename from Content-Disposition header, or fallback
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `subscribers-${filter}-${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to export subscribers');
    } finally {
      setExporting(false);
    }
  };

  const filtered = subscribers.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const activeCount = subscribers.filter((s) => s.status === 'active').length;
  const unsubCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  if (loading) return <div>Loading subscribers...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
            Newsletter Subscribers
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {activeCount} active · {unsubCount} unsubscribed · {subscribers.length} total
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filters */}
          {(['all', 'active', 'unsubscribed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? styles.btnPrimary : styles.btnOutline}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          {/* 👇 NEW: Export CSV button */}
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

      {filtered.length === 0 ? (
        <div className={styles.tableContainer} style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>No subscribers yet.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Source</th>
                <th>Subscribed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.email}</td>
                  <td>
                    <span style={{
                      background: sub.status === 'active' ? '#ecfdf5' : '#fef3c7',
                      color: sub.status === 'active' ? '#059669' : '#d97706',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {sub.status}
                    </span>
                  </td>
                  <td>{sub.source}</td>
                  <td>{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(sub._id)}
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
    </div>
  );
}