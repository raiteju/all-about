'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ExploreHome.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TypeCard {
  slug: string;
  title: string;
  description: string;
  icon: string;
  visible: boolean;
  order: number;
  count: number;
}

export default function ExploreHomePage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // ============================================
  // FETCH SETTINGS + COUNTS
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings first
        const settingsRes = await fetch(`${API_URL}/api/site-settings`);
        const settingsData = settingsRes.ok ? await settingsRes.json() : {};
        setSettings(settingsData);
        setSettingsLoaded(true);

        // Then fetch counts for all 3 types in parallel
        const types = ['articles', 'audio', 'video'];
        const results = await Promise.all(
          types.map((t) =>
            fetch(`${API_URL}/api/posts/explore/${t}?page=1&limit=1`)
              .then((r) => (r.ok ? r.json() : { totalPosts: 0 }))
              .catch(() => ({ totalPosts: 0 }))
          )
        );

        const newCounts: Record<string, number> = {};
        types.forEach((t, idx) => {
          newCounts[t] = results[idx].totalPosts || 0;
        });
        setCounts(newCounts);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ============================================
  // BUILD TYPE CARDS FROM SETTINGS
  // ============================================
  const TYPES: TypeCard[] = [
    {
      slug: 'articles',
      title: settings.exploreArticlesTitle || 'Articles',
      description:
        settings.exploreArticlesDescription ||
        'Read in-depth stories, tutorials, and insights from our community of writers.',
      icon: settings.exploreArticlesIcon || '📄',
      visible: settings.exploreArticlesVisible !== false,
      order: settings.exploreArticlesOrder ?? 1,
      count: counts['articles'] || 0,
    },
    {
      slug: 'audio',
      title: settings.exploreAudioTitle || 'Audio',
      description:
        settings.exploreAudioDescription ||
        'Listen to podcasts, music, and audio stories from talented creators.',
      icon: settings.exploreAudioIcon || '🎧',
      visible: settings.exploreAudioVisible !== false,
      order: settings.exploreAudioOrder ?? 2,
      count: counts['audio'] || 0,
    },
    {
      slug: 'video',
      title: settings.exploreVideoTitle || 'Videos',
      description:
        settings.exploreVideoDescription ||
        'Watch engaging video content across all topics of life.',
      icon: settings.exploreVideoIcon || '🎬',
      visible: settings.exploreVideoVisible !== false,
      order: settings.exploreVideoOrder ?? 3,
      count: counts['video'] || 0,
    },
  ];

  // Filter visible + sort by order
  const visibleTypes = TYPES.filter((t) => t.visible).sort(
    (a, b) => a.order - b.order
  );

  const totalPosts = visibleTypes.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className={styles.container}>
      {/* ============ HERO SECTION ============ */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🧭</div>
          <h1 className={styles.heroTitle}>Explore</h1>
          <p className={styles.heroSubtitle}>
            Discover content by type. Browse articles, listen to audio, or watch videos from
            creators around the world.
          </p>
          {!loading && totalPosts > 0 && (
            <p className={styles.heroCount}>
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} total
            </p>
          )}
        </div>

        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbChevron}>›</span>
          <span className={styles.breadcrumbCurrent}>Explore</span>
        </div>
      </div>

      {/* ============ TYPE CARDS GRID ============ */}
      {settingsLoaded && visibleTypes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280',
          }}
        >
          <p>No content types are currently visible.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {visibleTypes.map((type) => (
            <Link
              key={type.slug}
              href={`/explore/${type.slug}`}
              className={styles.typeCard}
            >
              <div className={styles.typeCardIcon}>{type.icon}</div>

              <div className={styles.typeCardContent}>
                <h2 className={styles.typeCardTitle}>{type.title}</h2>
                <p className={styles.typeCardDescription}>{type.description}</p>

                <div className={styles.typeCardFooter}>
                  <span className={styles.typeCardCount}>
                    {loading
                      ? '...'
                      : `${type.count} ${
                          type.count === 1 ? 'post' : 'posts'
                        }`}
                  </span>
                  <span className={styles.typeCardArrow}>
                    Browse {type.title} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}