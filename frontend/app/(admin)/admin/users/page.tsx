'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { API_URL } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'author' | 'admin'>('all');
  const [exporting, setExporting] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Failed to update role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Failed to delete user');
      }
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
        `${API_URL}/api/admin/users/export?role=${roleFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to export');
      }

      // Get the CSV as a blob
      const blob = await res.blob();

      // Extract filename from Content-Disposition header (or fallback)
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `users-${roleFilter}-${new Date().toISOString().split('T')[0]}.csv`;
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
      alert(err.message || 'Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  // Apply role filter for display
  const filteredUsers = users.filter((u: any) => {
    if (roleFilter === 'all') return true;
    return u.role === roleFilter;
  });

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
            All Users
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {users.filter((u: any) => u.role === 'author').length} authors ·{' '}
            {users.filter((u: any) => u.role === 'admin').length} admins ·{' '}
            {users.length} total
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filter buttons */}
          {(['all', 'author', 'admin'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={roleFilter === f ? styles.btnPrimary : styles.btnOutline}
            >
              {f === 'all' ? 'All' : f === 'author' ? 'Authors' : 'Admins'}
            </button>
          ))}

          {/* 👇 NEW: Export CSV button */}
          <button
            onClick={handleExport}
            className={styles.btnSuccess}
            disabled={exporting || filteredUsers.length === 0}
            style={{
              opacity: exporting || filteredUsers.length === 0 ? 0.6 : 1,
              cursor: exporting || filteredUsers.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {exporting ? 'Exporting...' : '⬇ Export CSV'}
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => (
                <tr key={user._id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>@{user.username}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className={styles.btnDanger}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}