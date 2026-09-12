'use client';

import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import { API_URL } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data.stats);
        setRecentPosts(data.recentPosts || []);
        setRecentUsers(data.recentUsers || []);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Loading dashboard...</p></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
    { label: 'Total Posts', value: stats?.totalPosts || 0, icon: '📝' },
    { label: 'Total Comments', value: stats?.totalComments || 0, icon: '💬' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: '🏷️' },
    { label: 'Articles', value: stats?.articles || 0, icon: '📄' },
    { label: 'Videos', value: stats?.videos || 0, icon: '🎥' },
    { label: 'Audios', value: stats?.audios || 0, icon: '🎵' },
  ];

  return (
    <div>
      <div className={styles.statsGrid}>
        {statCards.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div style={{ fontSize: '28px' }}>{stat.icon}</div>
            <div className={styles.statNumber}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ marginBottom: '12px' }}>Recent Posts</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>No recent posts</td></tr>
                ) : (
                  recentPosts.map((post: any) => (
                    <tr key={post._id}>
                      <td>{post.title}</td>
                      <td>{post.author?.firstName} {post.author?.lastName}</td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '12px' }}>Recent Users</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>No recent users</td></tr>
                ) : (
                  recentUsers.map((user: any) => (
                    <tr key={user._id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td><span className={user.role === 'admin' ? styles.adminBadge : styles.statLabel}>{user.role}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}