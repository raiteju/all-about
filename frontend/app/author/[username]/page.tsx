'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import PostCard from '@/components/cards/PostCard';
import { getAuthorProfile } from '@/lib/api';
import { API_URL } from '@/lib/api';

export default function AuthorPage() {
  const { username } = useParams();
  const [author, setAuthor] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [counts, setCounts] = useState({ articles: 0, videos: 0, audios: 0, favorites: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (username) {
        try {
          const data = await getAuthorProfile(username);
          setAuthor(data.author);
          setPosts(data.posts || []);
          setCounts(data.counts || { articles: 0, videos: 0, audios: 0, favorites: 0 });
          // Get follow status and count
          await fetchFollowStatus(data.author._id);
        } catch (err) {
          console.error('Failed to fetch author', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [username]);

  const fetchFollowStatus = async (authorId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_URL}/api/follow/${authorId}/status`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing || false);
        setFollowersCount(data.followersCount || 0);
      } else {
        // Fallback: just get count (public)
        const countRes = await fetch(`${API_URL}/api/follow/${authorId}/count`);
        if (countRes.ok) {
          const countData = await countRes.json();
          setFollowersCount(countData.followersCount || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch follow status', error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to follow authors.');
        return;
      }

      const res = await fetch(`${API_URL}/api/follow/${author._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update follow status.');
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('Something went wrong.');
    }
  };

  const filteredPosts = posts.filter((post: any) => {
    if (activeTab === 'articles') return post.type === 'article';
    if (activeTab === 'videos') return post.type === 'video';
    if (activeTab === 'audios') return post.type === 'audio';
    if (activeTab === 'favorites') return post.likes > 0;
    return true;
  });

  // Helper to render social links
  const renderSocialIcons = () => {
    const links = author?.socialLinks || {};
    return (
      <div className={styles.profileSocials}>
        {links.facebook && (
          <a href={links.facebook} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/></svg>
          </a>
        )}
        {links.twitter && (
          <a href={links.twitter} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </a>
        )}
        {links.linkedin && (
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.02 8h5v16h-5V8zm7.98 0h4.78v2.2h.07c.665-1.26 2.29-2.59 4.71-2.59 5.04 0 5.98 3.32 5.98 7.64V24h-5v-7.1c0-1.7-.03-3.88-2.37-3.88-2.37 0-2.73 1.85-2.73 3.76V24h-5V8z"/></svg>
          </a>
        )}
        {links.instagram && (
          <a href={links.instagram} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
        )}
        {links.github && (
          <a href={links.github} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        )}
      </div>
    );
  };

  if (loading) return <div className={styles.container}><p>Loading author...</p></div>;

  if (!author) return <div className={styles.container}><p>Author not found.</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.coverWrapper}>
        <Image 
          src={author.coverImage || 'https://picsum.photos/seed/coverprofile/1200/400'} 
          alt="Cover" fill priority style={{ objectFit: 'cover' }}
        />
      </div>

      <div className={styles.profileCardWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.profileLeft}>
            <div className={styles.profileAvatarWrapper}>
              <Image src={author.avatar || 'https://i.pravatar.cc/150?img=5'} alt={author.firstName} fill style={{ objectFit: 'cover' }} />
            </div>

            <div className={styles.profileInfo}>
              <h1>
                {author.firstName} {author.lastName}
                <span className={styles.verifiedBadge}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 4.5L18 4.5L18 8L20.5 10.5L18 13L18 16.5L14.5 16.5L12 19L9.5 16.5L6 16.5L6 13L3.5 10.5L6 8L6 4.5L9.5 4.5L12 2ZM10.5 15.5L16.5 9.5L15.1 8.1L10.5 12.7L8.9 11.1L7.5 12.5L10.5 15.5Z"/></svg>
                </span>
              </h1>
              <p>{author.bio || 'No bio available.'}</p>
              
              {/* Conditionally render website link only if exists */}
              {author.website && (
                <div className={styles.profileLink}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <a 
                    href={author.website.startsWith('http') ? author.website : `https://${author.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {author.website}
                  </a>
                </div>
              )}

              {/* Dynamic Social Icons */}
              {renderSocialIcons()}
            </div>
          </div>

          <div className={styles.profileRight}>
            <button 
              className={`${styles.followBtn} ${isFollowing ? styles.followBtnFollowing : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'} {followersCount > 0 && `(${followersCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Tabs */}
      <div className={styles.tabsRow}>
        <div className={styles.tabs}>
          {counts.articles > 0 && (
            <button className={`${styles.tab} ${activeTab === 'articles' ? styles.tabActive : ''}`} onClick={() => setActiveTab('articles')}>Articles ({counts.articles})</button>
          )}
          {counts.videos > 0 && (
            <button className={`${styles.tab} ${activeTab === 'videos' ? styles.tabActive : ''}`} onClick={() => setActiveTab('videos')}>Videos ({counts.videos})</button>
          )}
          {counts.audios > 0 && (
            <button className={`${styles.tab} ${activeTab === 'audios' ? styles.tabActive : ''}`} onClick={() => setActiveTab('audios')}>Audios ({counts.audios})</button>
          )}
          {counts.favorites > 0 && (
            <button className={`${styles.tab} ${activeTab === 'favorites' ? styles.tabActive : ''}`} onClick={() => setActiveTab('favorites')}>Favorites ({counts.favorites})</button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post: any) => (
            <PostCard key={post._id} post={post} variant="vertical" />
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280' }}>No posts available in this category.</p>
        )}
      </div>
    </div>
  );
}