'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './PostCard.module.css';
import { formatDate } from '@/lib/utils';

// Helper to normalize image URL
const normalizeImageUrl = (url: string) => {
  if (!url) return '';
  let normalized = url.replace(/\\/g, '/');
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
};

export default function PostCard({ post, variant = 'vertical' }: { post: any; variant?: 'vertical' | 'horizontal' | 'featured' }) {
  const router = useRouter();
  const fallbackImage = 'https://picsum.photos/seed/fallback/400/300';
  const fallbackAvatar = 'https://i.pravatar.cc/150?img=10';

  const authorName = post.author?.firstName 
    ? `${post.author.firstName} ${post.author.lastName}`
    : 'Author';
  const authorAvatar = normalizeImageUrl(post.author?.avatar) || fallbackAvatar;
  const authorUsername = post.author?.username;

  const likesCount = post.likes || 0;
  const commentsCount = post.commentsCount || 0;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authorUsername) {
      router.push(`/author/${authorUsername}`);
    }
  };

  if (variant === 'featured') {
    return (
      <Link href={`/post/${post.slug}`} className={styles.featuredCard}>
        <div className={styles.featuredImageContainer}>
          <Image 
            src={post.featuredImage || fallbackImage} 
            alt={post.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            style={{ objectFit: 'cover' }} 
          />
          <span className={styles.featuredCategoryTag}>{post.category || 'Travel'}</span>
        </div>

        <div className={styles.featuredContent}>
          <div className={styles.featuredMeta}>
            <div className={styles.author}>
              <span 
                onMouseDown={handleAuthorClick}
                className={styles.authorLink} 
                role="button" 
                tabIndex={0}
              >
                <Image src={authorAvatar} alt={authorName} width={40} height={40} className={styles.avatar} />
              </span>
              <span 
                onMouseDown={handleAuthorClick}
                className={styles.authorNameLink} 
                role="button" 
                tabIndex={0}
              >
                {authorName}
              </span>
              <span style={{ color: '#6b7280' }}>· {formatDate(post.createdAt)}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.4', margin: '0 0 12px 0', color: '#111' }}>
            {post.title}
          </h2>
          <p style={{ color: '#6b7280', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            {post.excerpt || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.'}
          </p>

          <div className={styles.featuredActions}>
            <span className={styles.likes}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              {likesCount}
            </span>
            <span className={styles.comments}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              {commentsCount}
            </span>
            <span className={styles.bookmark}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/post/${post.slug}`} className={styles.horizontalCard}>
        <div className={styles.horizontalContent}>
          <span className={styles.categoryTag}>{post.category || 'General'}</span>
          <h3 className={styles.horizontalTitle}>{post.title}</h3>
          
          <div className={styles.meta}>
            <div className={styles.author}>
              <span 
                onMouseDown={handleAuthorClick}
                className={styles.authorLink} 
                role="button" 
                tabIndex={0}
              >
                <Image src={authorAvatar} alt={authorName} width={20} height={20} className={styles.avatar} />
              </span>
              <span 
                onMouseDown={handleAuthorClick}
                className={styles.authorNameLink} 
                role="button" 
                tabIndex={0}
              >
                {authorName}
              </span>
            </div>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          
          <div className={styles.horizontalActions}>
            <span className={styles.likes}>♥ {likesCount}</span>
            <span className={styles.comments}>💬 {commentsCount}</span>
            <span className={styles.bookmark}>🔖</span>
          </div>
        </div>

        <div className={styles.horizontalImage}>
          <Image 
            src={post.featuredImage || fallbackImage} 
            alt={post.title} 
            fill 
            sizes="120px"
            style={{ objectFit: 'cover' }} 
          />
        </div>
      </Link>
    );
  }

  // VERTICAL (default)
  return (
    <Link href={`/post/${post.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <Image 
          src={post.featuredImage || fallbackImage} 
          alt={post.title} 
          fill 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: 'cover' }} 
        />
        <span className={styles.categoryTag}>{post.category || 'General'}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.meta}>
          <div className={styles.author}>
            <span 
              onMouseDown={handleAuthorClick}
              className={styles.authorLink} 
              role="button" 
              tabIndex={0}
            >
              <Image src={authorAvatar} alt={authorName} width={24} height={24} className={styles.avatar} />
            </span>
            <span 
              onMouseDown={handleAuthorClick}
              className={styles.authorNameLink} 
              role="button" 
              tabIndex={0}
            >
              {authorName}
            </span>
          </div>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <h3 className={styles.cardTitle}>{post.title}</h3>

        <div className={styles.actions}>
          <span className={styles.likes}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            {likesCount}
          </span>
          <span className={styles.comments}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            {commentsCount}
          </span>
          <span className={styles.bookmark}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}