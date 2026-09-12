'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { getMyPosts, updatePostStatus } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // GLOBAL COUNTS STATE (Static across all pages)
  const [totalPosts, setTotalPosts] = useState(0);
  const [counts, setCounts] = useState({ articles: 0, audios: 0, videos: 0, favorites: 0 });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const token = localStorage.getItem('token');
        if (!token) return;

        const data = await getMyPosts(token, currentPage);
        
        setPosts(data.posts || []); // Table posts (Changes per page)
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        
        // GLOBAL STATS (Does not change per page)
        setTotalPosts(data.totalPosts || 0);
        setCounts(data.counts || { articles: 0, audios: 0, videos: 0, favorites: 0 });
      } catch (error) {
        console.error('Failed to fetch posts', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (postId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const updatedPost = await updatePostStatus(postId, status, token);
      setPosts((prev: any) => prev.map((p: any) => p._id === postId ? { ...p, status: updatedPost.status } : p));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(posts.filter((p: any) => p._id !== postId));
      }
    } catch (error) {
      console.error('Failed to delete post', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome! Good morning <span style={{ color: 'var(--primary-blue)' }}>{user?.firstName || 'Guest'}</span>,</h1>
        <p className={styles.welcomeSubtitle}>View your dashboard, manage your posts, subscription and edit and profile.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>📝</div>
          <div>
            <div className={styles.statNumber}>{totalPosts}</div> {/* STATIC TOTAL! */}
            <div className={styles.statLabel}>Total Posts</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>📄</div>
          <div>
            <div className={styles.statNumber}>{counts.articles || 0}</div>
            <div className={styles.statLabel}>Articles</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>🎧</div>
          <div>
            <div className={styles.statNumber}>{counts.audios || 0}</div>
            <div className={styles.statLabel}>Audios</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>🎬</div>
          <div>
            <div className={styles.statNumber}>{counts.videos || 0}</div>
            <div className={styles.statLabel}>Videos</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>📁</div>
          <div>
            <div className={styles.statNumber}>{counts.favorites || 0}</div>
            <div className={styles.statLabel}>Favorites</div>
          </div>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <div className={styles.postsTitle}>📋 Posts</div>
        <Link href="/dashboard/posts/new" className={styles.addPostBtn}>
          Add New Post
          <span>➜</span>
        </Link>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <table className={styles.postsTable}>
          <thead>
            <tr>
              <th>Posts</th>
              <th>Status</th>
              <th>Category</th>
              <th>Published Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post: any) => (
              <tr key={post._id}>
                <td>
                  <Link href={`/post/${post.slug}`} className={styles.postTitleCell}>
                    <Image src={post.featuredImage || 'https://picsum.photos/seed/fallback/60/60'} alt={post.title} width={60} height={60} className={styles.postThumb} />
                    <div className={styles.postTitleText}>{post.title}</div>
                  </Link>
                </td>
                <td>
                  <select 
                    value={post.status} 
                    onChange={(e) => handleStatusChange(post._id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                      background: post.status === 'active' ? '#ecfdf5' : '#f3f4f6',
                      color: post.status === 'active' ? '#059669' : '#6b7280',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="active">active</option>
                    <option value="private">private</option>
                  </select>
                </td>
                <td><span className={styles.categoryBadge}>{post.category}</span></td>
                <td>{formatDate(post.createdAt)}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <Link href={`/post/${post.slug}`} className={styles.viewBtn}>View 👁️</Link>
                    <Link href={`/dashboard/posts/edit/${post._id}`} className={styles.editBtn}>Edit ✓</Link>
                    <button onClick={() => handleDelete(post._id)} className={styles.deleteBtn}>Delete 🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button 
              key={page} 
              className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}