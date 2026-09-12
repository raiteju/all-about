import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// ============================================
// ROBOTS.TXT GENERATOR
// Tells search engines what to crawl / not crawl
// ============================================
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/api/',
          '/_next/',
        ],
      },
      // Optional: Block AI crawlers if you want
      // Uncomment to block:
      // {
      //   userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai'],
      //   disallow: '/',
      // },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}