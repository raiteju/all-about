import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// ============================================
// DYNAMIC SITEMAP GENERATOR
// Auto-updates as you add posts, categories, authors, pages, tags
// ============================================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ============================================
  // STATIC PAGES (always present)
  // ============================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/explore/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/explore/audio`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/explore/video`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  try {
    // ============================================
    // FETCH DYNAMIC CONTENT IN PARALLEL
    // ============================================
    const [postsRes, categoriesRes, authorsRes, pagesRes, tagsRes] =
      await Promise.all([
        fetch(`${API_URL}/api/posts`, { next: { revalidate: 3600 } }),
        fetch(`${API_URL}/api/categories`, { next: { revalidate: 3600 } }),
        fetch(`${API_URL}/api/auth/all`, { next: { revalidate: 3600 } }),
        fetch(`${API_URL}/api/pages/published`, {
          next: { revalidate: 3600 },
        }),
        fetch(`${API_URL}/api/posts/tags`, { next: { revalidate: 3600 } }),
      ]);

    const posts = postsRes.ok ? await postsRes.json() : [];
    const categories = categoriesRes.ok ? await categoriesRes.json() : [];
    const authors = authorsRes.ok ? await authorsRes.json() : [];
    const pages = pagesRes.ok ? await pagesRes.json() : [];
    const tags = tagsRes.ok ? await tagsRes.json() : [];

    // ============================================
    // BUILD DYNAMIC ENTRIES
    // ============================================
    const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
      url: `${SITE_URL}/post/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map(
      (cat: any) => ({
        url: `${SITE_URL}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    );

    const authorEntries: MetadataRoute.Sitemap = authors.map(
      (author: any) => ({
        url: `${SITE_URL}/author/${author.username}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    );

    const pageEntries: MetadataRoute.Sitemap = pages.map((page: any) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: new Date(page.updatedAt || page.createdAt),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

    const tagEntries: MetadataRoute.Sitemap = tags.map((tag: any) => ({
      url: `${SITE_URL}/tag/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }));

    // ============================================
    // COMBINE ALL ENTRIES
    // ============================================
    return [
      ...staticPages,
      ...postEntries,
      ...categoryEntries,
      ...authorEntries,
      ...pageEntries,
      ...tagEntries,
    ];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Return static pages even if API fails
    return staticPages;
  }
}