import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/api/site-settings`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    const settings = await res.json();

    const title =
      settings.exploreSeoTitle ||
      `Explore - ${settings.siteName || 'AllAbout'}`;
    const description =
      settings.exploreSeoDescription ||
      'Discover content by type. Browse articles, listen to audio, or watch videos.';
    const keywords = settings.exploreSeoKeywords || 'explore, articles, audio, videos';
    const ogImage = settings.exploreOgImage || settings.defaultOgImage || '';

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
      title: 'Explore - AllAbout',
      description: 'Discover content by type.',
    };
  }
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}