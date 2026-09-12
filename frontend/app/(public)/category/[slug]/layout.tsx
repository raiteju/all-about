import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Fetch category via the posts-by-category endpoint (returns category data)
    const [catRes, settingsRes] = await Promise.all([
      fetch(`${API_URL}/api/categories/${slug}/posts?limit=1`, {
        cache: 'no-store',
      }),
      fetch(`${API_URL}/api/site-settings`, { cache: 'no-store' }),
    ]);

    if (!catRes.ok) {
      // Category not found — return generic
      return {
        title: 'Category - AllAbout',
      };
    }

    const catData = await catRes.json();
    const category = catData.category;

    const settings = settingsRes.ok ? await settingsRes.json() : {};

    if (!category) {
      return { title: 'Category - AllAbout' };
    }

    const siteName = settings.siteName || 'AllAbout';

    // Fallback chain:
    // 1. category.seoTitle
    // 2. `${category.name} Articles - ${siteName}`
    // 3. settings.defaultSeoTitle
    const title =
      category.seoTitle ||
      `${category.name} Articles - ${siteName}` ||
      settings.defaultSeoTitle ||
      'AllAbout';

    const description =
      category.seoDescription ||
      category.description ||
      `Explore all posts in the ${category.name} category on ${siteName}.`;

    const keywords =
      category.seoKeywords ||
      `${category.name.toLowerCase()}, ${category.name.toLowerCase()} articles, blog`;

    const ogImage =
      category.ogImage ||
      category.image ||
      settings.defaultOgImage ||
      '';

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
      title: 'Category - AllAbout',
      description: 'Browse posts by category.',
    };
  }
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}