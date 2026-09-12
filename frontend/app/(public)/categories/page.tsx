'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Categories.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const totalPosts = categories.reduce((sum, c) => sum + (c.count || 0), 0);

  return (
    <div className={styles.container}>
      {/* ============ HERO SECTION ============ */}
      <div className={styles.heroSection}>
        {/* Left: Hero content */}
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🏷️</div>
          <h1 className={styles.heroTitle}>All Categories</h1>
          <p className={styles.heroSubtitle}>
            Explore content by topic. Browse all categories and discover posts that match your interests.
          </p>
          {!loading && categories.length > 0 && (
            <p className={styles.heroCount}>
              {categories.length} {categories.length === 1 ? 'category' : 'categories'} ·{' '}
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} total
            </p>
          )}
        </div>

        {/* Right: Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbChevron}>›</span>
          <span className={styles.breadcrumbCurrent}>Categories</span>
        </div>
      </div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading categories...</p>
        </div>
      )}

      {/* ============ ERROR ============ */}
      {!loading && error && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Failed to load categories</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!loading && !error && categories.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No categories yet</h2>
          <p>Categories will appear here once they're added.</p>
          <Link href="/" className={styles.backHomeBtn}>
            ← Back to Home
          </Link>
        </div>
      )}

      {/* ============ CATEGORY GRID ============ */}
      {!loading && !error && categories.length > 0 && (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className={styles.categoryCard}
            >
              {/* Image or Icon */}
              <div className={styles.categoryImageWrapper}>
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className={styles.categoryImagePlaceholder}>🏷️</div>
                )}
                <span className={styles.categoryCount}>
                  {cat.count} {cat.count === 1 ? 'post' : 'posts'}
                </span>
              </div>

              {/* Content */}
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <p className={styles.categoryDescription}>
                  {cat.description || `Explore all posts in ${cat.name}`}
                </p>
                <span className={styles.categoryArrow}>View posts →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}