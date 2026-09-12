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
      settings.categoriesSeoTitle ||
      `All Categories - ${settings.siteName || 'AllAbout'}`;
    const description =
      settings.categoriesSeoDescription ||
      'Explore content by topic. Browse all categories and discover posts that match your interests.';
    const keywords = settings.categoriesSeoKeywords || 'categories, topics';
    const ogImage = settings.categoriesOgImage || settings.defaultOgImage || '';

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
      title: 'All Categories - AllAbout',
      description:
        'Explore content by topic. Browse all categories and discover posts that match your interests.',
    };
  }
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}