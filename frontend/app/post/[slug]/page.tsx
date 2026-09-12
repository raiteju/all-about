import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import PostCard from '@/components/cards/PostCard';
import PostHero from '@/components/post/PostHero';
import CommentSection from '@/components/post/CommentSection';
import {
  getPostBySlug,
  getPosts,
  getPostsByAuthor,
  getTopCategories,
} from '@/lib/api';
import { formatDate } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// 👇 NEW: Dynamic Post Metadata
// ============================================
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const [postRes, settingsRes] = await Promise.all([
      fetch(`${API_URL}/api/posts/slug/${slug}`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/site-settings`, { cache: 'no-store' }),
    ]);

    if (!postRes.ok) {
      return { title: 'Post Not Found' };
    }

    const post = await postRes.json();
    const settings = settingsRes.ok ? await settingsRes.json() : {};

    const siteName = settings.siteName || 'AllAbout';

    // Fallback chain:
    // 1. post.seoTitle
    // 2. `${post.title} - ${siteName}`
    // 3. settings.defaultSeoTitle
    const title =
      post.seoTitle ||
      `${post.title} - ${siteName}` ||
      settings.defaultSeoTitle ||
      'AllAbout';

    const description =
      post.seoDescription ||
      post.excerpt ||
      settings.defaultSeoDescription ||
      'Read this post on AllAbout.';

    const keywords =
      post.seoKeywords ||
      (Array.isArray(post.tags) ? post.tags.join(', ') : '') ||
      settings.defaultSeoKeywords ||
      '';

    const ogImage =
      post.ogImage ||
      post.featuredImage ||
      settings.defaultOgImage ||
      '';

    const authorName = post.author?.firstName
      ? `${post.author.firstName} ${post.author.lastName}`
      : '';

    return {
      title,
      description,
      keywords,
      authors: authorName ? [{ name: authorName }] : undefined,
      openGraph: {
        title,
        description,
        images: ogImage ? [ogImage] : [],
        type: 'article',
        publishedTime: post.createdAt,
        authors: authorName ? [authorName] : undefined,
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
      title: 'Post - AllAbout',
    };
  }
}

// ============================================
// Page (unchanged)
// ============================================
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch (error) {
    notFound();
  }

  const allPosts = await getPosts();
  const relatedPosts = allPosts
    .filter((p: any) => p._id !== post._id && p.category === post.category)
    .slice(0, 4);

  const authorPostList = await getPostsByAuthor(post.author?._id);
  const authorPosts = authorPostList.filter((p: any) => p._id !== post._id).slice(0, 4);

  const sidebarCategories = await getTopCategories(6);

  let containerClass = styles.container;
  if (post.type === 'audio') containerClass = `${styles.container} ${styles.audioFullWidth}`;
  if (post.type === 'video') containerClass = `${styles.container} ${styles.videoFullWidth}`;

  const fallbackImage = 'https://i.pravatar.cc/150?img=5';
  const authorBio = post.author?.bio
    ? post.author.bio
    : "I'm a passionate creator sharing stories, ideas, and experiences with the world. Follow along for more exciting content!";

  const authorName = post.author?.firstName
    ? `${post.author.firstName} ${post.author.lastName}`
    : 'Author';

  return (
    <div className={containerClass}>
      <PostHero
        post={{
          ...post,
          authorName: authorName,
          authorObj: post.author,
          avatar: post.author?.avatar || fallbackImage,
          date: formatDate(post.createdAt),
          image: post.featuredImage || '',
        }}
      />

      <div className={styles.mainGrid}>
        <div>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <div
            className={styles.articleBody}
            dangerouslySetInnerHTML={{ __html: post.content || 'No content available.' }}
          />
          <CommentSection postId={post._id} />
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sidebarBox}>
            <h3 className={styles.sidebarTitle}>About</h3>
            <div className={styles.sidebarAboutImageWrapper}>
              <Image
                src={post.author?.avatar || fallbackImage}
                alt="Author"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.sidebarAbout}>
              <p className={styles.sidebarAboutText}>{authorBio}</p>
              <p className={styles.sidebarSignature}>{authorName}</p>
            </div>
          </div>

          <div className={styles.sidebarBox}>
            <h3 className={styles.sidebarTitle}>Categories</h3>
            <ul className={styles.categoryList}>
              {sidebarCategories.length === 0 ? (
                <li
                  style={{
                    padding: '12px 0',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px',
                  }}
                >
                  No categories yet
                </li>
              ) : (
                sidebarCategories.map((cat: any, idx: number) => (
                  <Link
                    key={cat.slug || idx}
                    href={`/category/${cat.slug}`}
                    className={styles.categoryItem}
                  >
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={40}
                        height={40}
                        className={styles.categoryThumb}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        🏷️
                      </div>
                    )}
                    <span className={styles.categoryName}>{cat.name}</span>
                    <span className={styles.categoryCount}>
                      {cat.count} {cat.count === 1 ? 'Article' : 'Articles'}
                    </span>
                  </Link>
                ))
              )}
            </ul>
          </div>

          <div className={styles.sidebarBox}>
            <h3 className={styles.sidebarTitle}>Tags</h3>
            <div className={styles.tagsContainer}>
              {post.tags && post.tags.length > 0 ? (
                post.tags.map((tag: string, idx: number) => {
                  const tagSlug = tag
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                  return (
                    <Link
                      key={idx}
                      href={`/tag/${tagSlug}`}
                      className={styles.tagPill}
                    >
                      {tag}
                    </Link>
                  );
                })
              ) : (
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>No tags</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Related Posts</h2>
              <p className={styles.sectionSubtitle}>
                Discover the most outstanding articles in all topics of life.
              </p>
            </div>
            <button className="btn-outline">Browse All ✎</button>
          </div>
          <div className={styles.grid4}>
            {relatedPosts.map((postItem: any) => (
              <PostCard key={postItem._id} post={postItem} variant="vertical" />
            ))}
          </div>
        </section>
      )}

      {authorPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>More from Author</h2>
              <p className={styles.sectionSubtitle}>
                Discover the most outstanding articles in all topics of life.
              </p>
            </div>
            <button className="btn-outline">Browse All ✎</button>
          </div>
          <div className={styles.grid4}>
            {authorPosts.map((postItem: any) => (
              <PostCard key={postItem._id} post={postItem} variant="vertical" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}