import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import ContactForm from '@/components/forms/ContactForm';
import styles from './Page.module.css';

interface PageData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  seoMeta: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch page data
async function getPage(slug: string): Promise<PageData | null> {
  try {
    const res = await fetch(`${API_URL}/api/pages/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return null;
  }
}

// Dynamic SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.seoMeta?.title || `${page.title} - AllAbout`,
    description: page.seoMeta?.description || page.excerpt || '',
    keywords: page.seoMeta?.keywords || '',
    openGraph: {
      title: page.seoMeta?.title || page.title,
      description: page.seoMeta?.description || page.excerpt || '',
      images: page.featuredImage ? [page.featuredImage] : [],
      type: 'article',
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  // Special case: Contact page shows a form at the bottom
  const isContactPage = slug === 'contact';

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span className={styles.breadcrumbChevron}>›</span>
        <span className={styles.breadcrumbCurrent}>{page.title}</span>
      </div>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.pageTitle}>{page.title}</h1>
        {page.excerpt && <p className={styles.pageExcerpt}>{page.excerpt}</p>}
      </div>

      {/* Featured Image */}
      {page.featuredImage && (
        <div className={styles.featuredImageWrapper}>
          <Image
            src={page.featuredImage}
            alt={page.title}
            fill
            priority
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 900px"
          />
        </div>
      )}

      {/* Content */}
      <div className={styles.contentWrapper}>
        <div
          className={styles.pageContent}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      {/* Special: Contact form on contact page */}
      {isContactPage && (
        <div className={styles.contactFormSection}>
          <ContactForm />
        </div>
      )}

      {/* Last Updated */}
      <div className={styles.metaFooter}>
        <span className={styles.metaText}>
          Last updated:{' '}
          {new Date(page.updatedAt || page.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}