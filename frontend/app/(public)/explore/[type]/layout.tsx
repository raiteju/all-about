import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const normalizedType = (type || 'articles').toLowerCase();

  try {
    const res = await fetch(`${API_URL}/api/site-settings`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    const settings = await res.json();

    // Determine which SEO set to use based on type
    let title = '';
    let description = '';
    let keywords = '';
    let ogImage = '';

    if (normalizedType === 'audio' || normalizedType === 'audios') {
      title =
        settings.exploreAudioSeoTitle ||
        `Audio - ${settings.siteName || 'AllAbout'}`;
      description =
        settings.exploreAudioSeoDescription ||
        'Click on the icon to enjoy the music or podcast.';
      keywords = settings.exploreAudioSeoKeywords || 'audio, podcast, music';
      ogImage = settings.exploreAudioOgImage || settings.defaultOgImage || '';
    } else if (normalizedType === 'video' || normalizedType === 'videos') {
      title =
        settings.exploreVideoSeoTitle ||
        `Videos - ${settings.siteName || 'AllAbout'}`;
      description =
        settings.exploreVideoSeoDescription ||
        'Discover the most outstanding videos in all topics of life.';
      keywords = settings.exploreVideoSeoKeywords || 'videos, watch, creators';
      ogImage = settings.exploreVideoOgImage || settings.defaultOgImage || '';
    } else {
      // articles (default)
      title =
        settings.exploreArticlesSeoTitle ||
        `Articles - ${settings.siteName || 'AllAbout'}`;
      description =
        settings.exploreArticlesSeoDescription ||
        'Discover the most outstanding articles in all topics of life.';
      keywords =
        settings.exploreArticlesSeoKeywords || 'articles, blog, stories';
      ogImage = settings.exploreArticlesOgImage || settings.defaultOgImage || '';
    }

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
      },
    };
  } catch {
    return {
      title: `Explore - AllAbout`,
      description: 'Discover outstanding content.',
    };
  }
}

export default function ExploreTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}