'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { API_URL } from '@/lib/api';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchComments();
      else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>All Comments</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Content</th>
              <th>Author</th>
              <th>Post</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment: any) => (
              <tr key={comment._id}>
                <td style={{ maxWidth: '300px' }}>{comment.content}</td>
                <td>{comment.author?.firstName} {comment.author?.lastName}</td>
                <td>
                  <Link href={`/post/${comment.postId?.slug}`} style={{ color: '#00a8e8', textDecoration: 'none' }}>
                    {comment.postId?.title || 'Post deleted'}
                  </Link>
                </td>
                <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(comment._id)} className={styles.btnDanger}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}