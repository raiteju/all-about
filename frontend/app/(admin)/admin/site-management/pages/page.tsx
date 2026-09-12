'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../admin.module.css';
import { API_URL } from '@/lib/api';

interface Page {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'published' | 'draft';
  showInFooter: boolean;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch pages');
      const data = await res.json();
      setPages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchPages();
      } else {
        alert('Failed to delete page');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading pages...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
            Pages Management
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Manage static pages like About, Support, Contact, etc.
          </p>
        </div>
        <Link
          href="/admin/site-management/pages/new"
          className={styles.btnPrimary}
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          + Create New Page
        </Link>
      </div>

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

      {pages.length === 0 ? (
        <div className={styles.tableContainer} style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No pages yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Create your first page to get started.
          </p>
          <Link
            href="/admin/site-management/pages/new"
            className={styles.btnPrimary}
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            + Create Your First Page
          </Link>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Footer</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page._id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{page.title}</div>
                    {page.excerpt && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {page.excerpt.substring(0, 60)}
                        {page.excerpt.length > 60 && '...'}
                      </div>
                    )}
                  </td>
                  <td>
  <code style={{ 
    background: '#f3f4f6', 
    padding: '2px 8px', 
    borderRadius: '4px',
    fontSize: '12px'
  }}>
    /{page.slug}
  </code>
</td>
                  <td>
                    <span style={{
                      background: page.status === 'published' ? '#ecfdf5' : '#fef3c7',
                      color: page.status === 'published' ? '#059669' : '#d97706',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {page.status}
                    </span>
                  </td>
                  <td>
                    {page.showInFooter ? (
                      <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>
                    ) : (
                      <span style={{ color: '#d1d5db', fontSize: '18px' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        href={`/admin/site-management/pages/${page._id}`}
                        className={styles.btnOutline}
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(page._id)}
                        className={styles.btnDanger}
                      >
                        Delete
                      </button>
                    </div>
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