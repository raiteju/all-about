'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/cards/PostCard';
import { getPostsByCategory } from '@/lib/api';
import styles from './Category.module.css';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();

  const slug = (params.slug as string) || '';

  const [category, setCategory] = useState<any>(null);
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
        const data = await getPostsByCategory(slug, 1, PAGE_SIZE);
        if (!isMounted) return;
        setCategory(data.category);
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
        setTotalPosts(data.totalPosts || 0);
        setHasMore((data.currentPage || 1) < (data.totalPages || 1));
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load category');
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    if (slug) loadInitial();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // ============================================
  // LOAD MORE (for infinite scroll)
  // ============================================
  const loadMore = async () => {
    if (loadingMore || !hasMore || initialLoading) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getPostsByCategory(slug, nextPage, PAGE_SIZE);
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
  // INTERSECTION OBSERVER
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
  }, [page, hasMore, loadingMore, initialLoading, slug]);

  return (
    <div className={styles.container}>
      {/* ============ HERO SECTION ============ */}
      <div className={styles.heroSection}>
        {/* Left: Hero content */}
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🏷️</div>
          <h1 className={styles.heroTitle}>
            {category?.name || 'Category'}
          </h1>
          <p className={styles.heroSubtitle}>
            {category?.description ||
              `Explore all posts in the ${category?.name || 'category'} category.`}
          </p>
          {totalPosts > 0 && (
            <p className={styles.heroCount}>
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} available
            </p>
          )}
        </div>

        {/* Right: Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbChevron}>›</span>
          <Link href="/category" className={styles.breadcrumbLink}>
            Categories
          </Link>
          <span className={styles.breadcrumbChevron}>›</span>
          <span className={styles.breadcrumbCurrent}>
            {category?.name || 'Category'}
          </span>
        </div>
      </div>

      {/* ============ FEATURED IMAGE ============ */}
      {category?.image && (
        <div className={styles.featuredImageWrapper}>
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      )}

      {/* ============ INITIAL LOADING ============ */}
      {initialLoading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading category...</p>
        </div>
      )}

      {/* ============ ERROR ============ */}
      {!initialLoading && error && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Category Not Found</h2>
          <p>{error}</p>
          <Link href="/" className={styles.backHomeBtn}>
            ← Back to Home
          </Link>
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!initialLoading && !error && posts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No posts in {category?.name || 'this category'}</h2>
          <p>Check back soon for new content.</p>
          <Link href="/" className={styles.backHomeBtn}>
            ← Back to Home
          </Link>
        </div>
      )}

      {/* ============ GRID + INFINITE SCROLL ============ */}
      {!initialLoading && !error && posts.length > 0 && (
        <>
          <div className={styles.gridArticles}>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} variant="vertical" />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className={styles.infiniteLoader}>
            {loadingMore && (
              <div className={styles.infiniteLoaderInner}>
                <div className={styles.loaderSpinner}></div>
                <p className={styles.loaderText}>Loading more...</p>
              </div>
            )}
            {!hasMore && posts.length > PAGE_SIZE && (
              <p className={styles.endMessage}>
                ✨ You've reached the end of {category?.name || 'this category'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}