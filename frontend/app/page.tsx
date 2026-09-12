import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import Carousel from '@/components/home/Carousel';
import BecomeBlogger from '@/components/home/BecomeBlogger';
import PostCard from '@/components/cards/PostCard';
import AuthorCard from '@/components/cards/AuthorCard';
import AudioCard from '@/components/cards/AudioCard';
import VideoCard from '@/components/cards/VideoCard';
import {
  getPosts,
  getPostsByType,
  getAllAuthors,
  getTopCategories,
} from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// Fetch site settings helper
// ============================================
async function getSiteSettings() {
  try {
    const res = await fetch(`${API_URL}/api/site-settings`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ============================================
// Dynamic Homepage Metadata
// ============================================
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/api/site-settings`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    const settings = await res.json();

    const title =
      settings.homeSeoTitle ||
      settings.defaultSeoTitle ||
      'AllAbout - Blog & Guest Post Platform';
    const description =
      settings.homeSeoDescription ||
      settings.defaultSeoDescription ||
      'Discover outstanding articles in all topics of life.';
    const keywords =
      settings.homeSeoKeywords || settings.defaultSeoKeywords || '';
    const ogImage = settings.homeOgImage || settings.defaultOgImage || '';

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: ogImage ? [ogImage] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : [],
        site: settings.defaultTwitterHandle || undefined,
      },
    };
  } catch {
    return {
      title: 'AllAbout - Blog & Guest Post Platform',
      description: 'Discover outstanding articles in all topics of life.',
    };
  }
}

// ============================================
// Homepage
// ============================================
export default async function Home() {
  // Fetch all data in parallel
  const [
    trendingPosts,
    realAudios,
    realVideos,
    authorsData,
    settings,
    topCats,
  ] = await Promise.all([
    getPosts(),
    getPostsByType('audio'),
    getPostsByType('video'),
    getAllAuthors(),
    getSiteSettings(),
    getTopCategories(5),
  ]);

  // ============================================
  // Dynamic values with fallbacks
  // ============================================
  // 👇 UPDATED: Hero now reads from `heroTitle`/`heroSubtitle` (was `editorsPickTitle`/`editorsPickSubtitle`)
  const heroTitle =
    settings?.heroTitle ||
    'Millions of people around the world showcase their thoughts';
  const heroSubtitle =
    settings?.heroSubtitle ||
    "All about bloggers - the home to the world's best bloggers and creative professionals.";
  const heroImage = settings?.heroImage || '/hero-bg.jpg';
  const heroSearchPlaceholder = settings?.heroSearchPlaceholder || 'Search';

  // Category chips: top 5 from DB, fallback to hardcoded
  const categoryChips =
    topCats && Array.isArray(topCats) && topCats.length > 0
      ? topCats.map((c: any) => ({ name: c.name, slug: c.slug }))
      : [
          { name: 'Lifestyle', slug: 'lifestyle' },
          { name: 'Food', slug: 'food' },
          { name: 'Culture', slug: 'culture' },
          { name: 'Travel', slug: 'travel' },
          { name: 'Technology', slug: 'technology' },
        ];

  const ctaTitle = settings?.ctaTitle || 'Become a Blogger!';
  const ctaDescription =
    settings?.ctaDescription ||
    'Speedily say has suitable disposal add boy. On forth doubt miles of child. Exercise joy man children rejoiced. Yet uncommonly his ten who diminution astonished.';
  const ctaButtonText = settings?.ctaButtonText || 'Register Here';
  const ctaButtonLink = settings?.ctaButtonLink || '/register';

  const trendingNowTitle = settings?.trendingNowTitle || 'Trending Now';
  const trendingNowSubtitle =
    settings?.trendingNowSubtitle ||
    'Discover the most outstanding articles in all topics of life.';

  const latestAudioTitle = settings?.latestAudioTitle || 'Latest Audio';
  const latestAudioSubtitle =
    settings?.latestAudioSubtitle ||
    'Click on the icon to enjoy the music or podcast';

  const latestVideoTitle = settings?.latestVideoTitle || 'Latest Video';
  const latestVideoSubtitle =
    settings?.latestVideoSubtitle ||
    'Discover the most outstanding articles in all topics of life.';

  const PencilIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );

  return (
    <div>
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
        image={heroImage}
        searchPlaceholder={heroSearchPlaceholder}
        categories={categoryChips}
      />

      {/* 1. Trending Now */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '30px' }}>
            <div>
              <h2 style={{ color: 'var(--primary-orange)', fontSize: '32px' }}>
                {trendingNowTitle}
              </h2>
              <p style={{ color: 'var(--text-gray)' }}>{trendingNowSubtitle}</p>
            </div>
            <button className="btn-outline">
              Browse All <PencilIcon />
            </button>
          </div>

          <Carousel>
            {trendingPosts.map((post) => (
              <div key={post._id} className="carousel-item carousel-item-trending">
                <PostCard post={post} variant="vertical" />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* 2. Newest Authors */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '30px' }}>
            <div>
              <h2 style={{ color: 'var(--primary-orange)', fontSize: '32px' }}>
                Newest Authors
              </h2>
              <p style={{ color: 'var(--text-gray)' }}>
                Say hello to future creator potentials
              </p>
            </div>
            <button className="btn-outline">
              Browse All <PencilIcon />
            </button>
          </div>

          <div className="authorsGrid">
            {authorsData.map((author) => (
              <AuthorCard key={author.username} author={author} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Latest Articles */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '30px' }}>
            <div>
              <h2 style={{ color: 'var(--primary-orange)', fontSize: '32px' }}>
                Latest Articles
              </h2>
              <p style={{ color: 'var(--text-gray)' }}>
                Discover the most outstanding articles in all topics of life.
              </p>
            </div>
            <button className="btn-outline">
              Browse All <PencilIcon />
            </button>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}
            className="articlesGrid"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {trendingPosts.slice(0, 4).map((article) => (
                <PostCard key={article._id} post={article} variant="horizontal" />
              ))}
            </div>

            <div>
              {trendingPosts[0] ? (
                <PostCard post={trendingPosts[0]} variant="featured" />
              ) : (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                  }}
                >
                  No featured article available.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <BecomeBlogger
        title={ctaTitle}
        description={ctaDescription}
        buttonText={ctaButtonText}
        buttonLink={ctaButtonLink}
      />

      {/* 5. Latest Audio */}
      <section style={{ padding: '60px 0', background: 'var(--secondary-bg)' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '30px' }}>
            <div>
              <h2 style={{ color: 'var(--primary-orange)', fontSize: '32px' }}>
                {latestAudioTitle}
              </h2>
              <p style={{ color: 'var(--text-gray)' }}>{latestAudioSubtitle}</p>
            </div>
            <button className="btn-outline">
              Listen All <PencilIcon />
            </button>
          </div>

          <Carousel>
            {realAudios.map((audio) => (
              <div key={audio._id} className="carousel-item carousel-item-media">
                <AudioCard audio={audio} />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* 6. Latest Video */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '30px' }}>
            <div>
              <h2 style={{ color: 'var(--primary-orange)', fontSize: '32px' }}>
                {latestVideoTitle}
              </h2>
              <p style={{ color: 'var(--text-gray)' }}>{latestVideoSubtitle}</p>
            </div>
            <button className="btn-outline">
              Browse All <PencilIcon />
            </button>
          </div>

          <Carousel>
            {realVideos.map((video) => (
              <div key={video._id} className="carousel-item carousel-item-media">
                <VideoCard video={video} />
              </div>
            ))}
          </Carousel>
        </div>
      </section>
    </div>
  );
}