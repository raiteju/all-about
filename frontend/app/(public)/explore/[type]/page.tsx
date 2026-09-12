'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PostCard from '@/components/cards/PostCard';
import AudioCard from '@/components/cards/AudioCard';
import VideoCard from '@/components/cards/VideoCard';
import { getExplorePosts } from '@/lib/api';
import styles from './Explore.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fallback meta (used while settings load)
const TYPE_META: Record<string, { title: string; subtitle: string; icon: string }> = {
  articles: {
    title: 'Articles',
    subtitle: 'Discover the most outstanding articles in all topics of life.',
    icon: '📄',
  },
  article: {
    title: 'Articles',
    subtitle: 'Discover the most outstanding articles in all topics of life.',
    icon: '📄',
  },
  audio: {
    title: 'Audio',
    subtitle: 'Click on the icon to enjoy the music or podcast.',
    icon: '🎧',
  },
  audios: {
    title: 'Audio',
    subtitle: 'Click on the icon to enjoy the music or podcast.',
    icon: '🎧',
  },
  video: {
    title: 'Videos',
    subtitle: 'Discover the most outstanding videos in all topics of life.',
    icon: '🎬',
  },
  videos: {
    title: 'Videos',
    subtitle: 'Discover the most outstanding videos in all topics of life.',
    icon: '🎬',
  },
};

const PAGE_SIZE = 12;

export default function ExplorePage() {
  const params = useParams();
  const router = useRouter();

  const typeSlug = ((params.type as string) || 'articles').toLowerCase();

  // ============================================
  // SETTINGS STATE (from admin)
  // ============================================
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Determine normalized type
  const normalizedType =
    typeSlug === 'article'
      ? 'article'
      : typeSlug === 'audios'
      ? 'audio'
      : typeSlug === 'videos'
      ? 'video'
      : typeSlug;

  const isAudio = normalizedType === 'audio';
  const isVideo = normalizedType === 'video';

  // ============================================
  // FETCH SETTINGS ON MOUNT
  // ============================================
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // ============================================
  // BUILD META FROM SETTINGS (with fallback)
  // ============================================
  let meta = TYPE_META[typeSlug] || TYPE_META.articles;

  if (normalizedType === 'article' || normalizedType === 'articles') {
    meta = {
      title: settings.exploreArticlesTitle || TYPE_META.articles.title,
      subtitle:
        settings.exploreArticlesSubtitle || TYPE_META.articles.subtitle,
      icon: settings.exploreArticlesIcon || TYPE_META.articles.icon,
    };
  } else if (normalizedType === 'audio') {
    meta = {
      title: settings.exploreAudioTitle || TYPE_META.audio.title,
      subtitle: settings.exploreAudioSubtitle || TYPE_META.audio.subtitle,
      icon: settings.exploreAudioIcon || TYPE_META.audio.icon,
    };
  } else if (normalizedType === 'video') {
    meta = {
      title: settings.exploreVideoTitle || TYPE_META.video.title,
      subtitle: settings.exploreVideoSubtitle || TYPE_META.video.subtitle,
      icon: settings.exploreVideoIcon || TYPE_META.video.icon,
    };
  }

  // ============================================
  // POSTS STATE
  // ============================================
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ============================================
  // INITIAL LOAD
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setInitialLoading(true);
      setError('');
      setPosts([]);
      setPage(1);
      setHasMore(true);

      try {
        const data = await getExplorePosts(typeSlug, 1, PAGE_SIZE);
        if (!isMounted) return;
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
        setTotalPosts(data.totalPosts || 0);
        setHasMore((data.currentPage || 1) < (data.totalPages || 1));
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load posts');
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [typeSlug]);

  // ============================================
  // LOAD MORE
  // ============================================
  const loadMore = async () => {
    if (loadingMore || !hasMore || initialLoading) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getExplorePosts(typeSlug, nextPage, PAGE_SIZE);
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setPage(nextPage);
      setHasMore(nextPage < (data.totalPages || 1));
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ============================================
  // INFINITE SCROLL OBSERVER
  // ============================================
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [page, hasMore, loadingMore, initialLoading, typeSlug]);

  // ============================================
  // RENDER CARD
  // ============================================
  const renderCard = (post: any) => {
    if (isAudio) return <AudioCard key={post._id} audio={post} />;
    if (isVideo) return <VideoCard key={post._id} video={post} />;
    return <PostCard key={post._id} post={post} variant="vertical" />;
  };

  const gridClass =
    isAudio || isVideo ? styles.gridMedia : styles.gridArticles;

  return (
    <div className={styles.container}>
      {/* HERO */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>{meta.icon}</div>
          <h1 className={styles.heroTitle}>{meta.title}</h1>
          <p className={styles.heroSubtitle}>{meta.subtitle}</p>
          {totalPosts > 0 && (
            <p className={styles.heroCount}>
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} available
            </p>
          )}
        </div>

        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbChevron}>›</span>
          <Link href="/explore" className={styles.breadcrumbLink}>
            Explore
          </Link>
          <span className={styles.breadcrumbChevron}>›</span>
          <span className={styles.breadcrumbCurrent}>{meta.title}</span>
        </div>
      </div>

      {/* INITIAL LOADING */}
      {initialLoading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading {meta.title.toLowerCase()}...</p>
        </div>
      )}

      {/* ERROR */}
      {!initialLoading && error && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button
            onClick={() => router.refresh()}
            className={styles.retryBtn}
          >
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!initialLoading && !error && posts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No {meta.title.toLowerCase()} yet</h2>
          <p>Check back soon for new content.</p>
          <Link href="/" className={styles.backHomeBtn}>
            ← Back to Home
          </Link>
        </div>
      )}

      {/* GRID + INFINITE SCROLL */}
      {!initialLoading && !error && posts.length > 0 && (
        <>
          <div className={gridClass}>{posts.map(renderCard)}</div>

          <div ref={loaderRef} className={styles.infiniteLoader}>
            {loadingMore && (
              <div className={styles.infiniteLoaderInner}>
                <div className={styles.loaderSpinner}></div>
                <p className={styles.loaderText}>Loading more...</p>
              </div>
            )}
            {!hasMore && posts.length > PAGE_SIZE && (
              <p className={styles.endMessage}>
                ✨ You've reached the end — no more {meta.title.toLowerCase()}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}