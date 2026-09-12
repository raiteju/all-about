import Image from 'next/image';
import Link from 'next/link';
import styles from './Cards.module.css';

// Helper to normalize image URL
const normalizeImageUrl = (url: string) => {
  if (!url) return '';
  let normalized = url.replace(/\\/g, '/');
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
};

export default function AuthorCard({ author }: { author: any }) {
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Author';
  const fallbackCover = 'https://picsum.photos/seed/authorcover/400/200';
  const fallbackAvatar = 'https://i.pravatar.cc/150?img=5';

  const avatarUrl = normalizeImageUrl(author.avatar) || fallbackAvatar;
  const coverUrl = normalizeImageUrl(author.coverImage || author.cover) || fallbackCover;

  return (
    <Link href={`/author/${author.username}`} className={styles.authorCard}>
      <div className={styles.authorCover}>
        <Image 
          src={coverUrl}
          alt={`${authorName} profile cover`} 
          fill 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#fff', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '600' }}>
          {author.postsCount || 0} →
        </div>
      </div>
      
      <div className={styles.authorAvatarWrapper}>
        <Image 
          src={avatarUrl}
          alt={`${authorName} profile avatar`} 
          width={80} 
          height={80} 
          className={styles.authorAvatar} 
        />
      </div>

      <h3 className={styles.authorName}>{authorName}</h3>
      <p className={styles.authorHandle}>@{author.username}</p>
    </Link>
  );
}