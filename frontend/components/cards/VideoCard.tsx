'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Cards.module.css';
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

export default function VideoCard({ video }: { video: any }) {
  const router = useRouter();
  
  const fallbackImage = 'https://picsum.photos/seed/video/400/300';
  const fallbackAvatar = 'https://i.pravatar.cc/150?img=5';

  const authorName = video.author?.firstName 
    ? `${video.author.firstName} ${video.author.lastName}`
    : 'Author';
  const authorUsername = video.author?.username;

  const authorAvatar = normalizeImageUrl(video.author?.avatar) || fallbackAvatar;
  const videoImage = normalizeImageUrl(video.image || video.featuredImage) || fallbackImage;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authorUsername) {
      router.push(`/author/${authorUsername}`);
    }
  };

  return (
    <Link href={`/post/${video.slug}`} className={styles.videoCard}>
      <div className={styles.videoImageContainer}>
        <Image 
          src={videoImage}
          alt={video.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }} 
        />
        <span className={styles.videoCategoryTag}>{video.category || 'Travel'}</span>
        <div className={styles.bookmarkIcon}>🔖</div>
        <div className={styles.videoPlayButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#111">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>

      <div className={styles.videoMeta}>
        <span 
          onMouseDown={handleAuthorClick}
          style={{ cursor: 'pointer', display: 'inline-flex' }}
        >
          <Image 
            src={authorAvatar} 
            alt={authorName} 
            width={40} 
            height={40} 
            className={styles.videoAuthorAvatar} 
          />
        </span>
        <div className={styles.videoInfo}>
          <h3 className={styles.videoTitle}>{video.title}</h3>
          <p className={styles.videoAuthorName}>
            <span 
              onMouseDown={handleAuthorClick}
              style={{ cursor: 'pointer', color: '#111', fontWeight: '500' }}
            >
              {authorName}
            </span>
            <span style={{ color: '#6b7280' }}> · {formatDate(video.createdAt)}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}