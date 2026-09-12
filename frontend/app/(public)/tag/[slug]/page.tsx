'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PostCard from '@/components/cards/PostCard';
import { getPostsByTag } from '@/lib/api';
import styles from './Tag.module.css';

const PAGE_SIZE = 12;

export default function TagPage() {
  const params = useParams();
  const router = useRouter();

  const slug = (params.slug as string) || '';

  const [tagName, setTagName] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setInitialLoading(true);
      setError('');
      setPosts([]);
      setPage(1);
      setHasMore(true);

      try {
        const data = await getPostsByTag(slug, 1, PAGE_SIZE);
        if (!isMounted) return;
        setTagName(data.tag);
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
        setTotalPosts(data.totalPosts || 0);
        setHasMore((data.currentPage || 1) < (data.totalPages || 1));
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load tag');
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    if (slug) loadInitial();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Load more (infinite scroll)
  const loadMore = async () => {
    if (loadingMore || !hasMore || initialLoading) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getPostsByTag(slug, nextPage, PAGE_SIZE);
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setPage(nextPage);
      setHasMore(nextPage < (data.totalPages || 1));
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Intersection Observer
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
  }, [page, hasMore, loadingMore, initialLoading, slug]);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🔖</div>
          <h1 className={styles.heroTitle}>
            #{tagName || 'Tag'}
          </h1>
          <p className={styles.heroSubtitle}>
            All posts tagged with <strong>{tagName || slug}</strong>
          </p>
          {totalPosts > 0 && (
            <p className={styles.heroCount}>
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} found
            </p>
          )}
        </div>

        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbChevron}>›</span>
          <span className={styles.breadcrumbCurrent}>Tag</span>
          <span className={styles.breadcrumbChevron}>›</span>
          <span className={styles.breadcrumbCurrent}>{tagName || slug}</span>
        </div>
      </div>

      {/* Initial Loading */}
      {initialLoading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading posts...</p>
        </div>
      )}

      {/* Error */}
      {!initialLoading && error && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Tag Not Found</h2>
          <p>{error}</p>
          <Link href="/" className={styles.backHomeBtn}>
            ← Back to Home
          </Link>
        </div>
      )}

      {/* Empty */}
      {!initialLoading && !error && posts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No posts with this tag yet</h2>
          <p>Check back soon for new content.</p>
          <Link href="/" className={styles.backHomeBtn}>
            ← Back to Home
          </Link>
        </div>
      )}

      {/* Grid + Infinite Scroll */}
      {!initialLoading && !error && posts.length > 0 && (
        <>
          <div className={styles.grid}>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} variant="vertical" />
            ))}
          </div>

          <div ref={loaderRef} className={styles.infiniteLoader}>
            {loadingMore && (
              <div className={styles.infiniteLoaderInner}>
                <div className={styles.loaderSpinner}></div>
                <p className={styles.loaderText}>Loading more...</p>
              </div>
            )}
            {!hasMore && posts.length > PAGE_SIZE && (
              <p className={styles.endMessage}>
                ✨ You've reached the end
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}