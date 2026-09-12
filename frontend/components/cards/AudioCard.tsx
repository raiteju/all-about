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

export default function AudioCard({ audio }: { audio: any }) {
  const fallbackImage = 'https://picsum.photos/seed/audio/400/300';
  const audioImage = normalizeImageUrl(audio.featuredImage) || fallbackImage;

  return (
    <Link href={`/post/${audio.slug}`} className={styles.audioCard}>
      <div className={styles.audioImageContainer}>
        <Image 
          src={audioImage} 
          alt={audio.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }} 
        />
        <span className={styles.audioCategoryTag}>Music</span>
        
        <div className={styles.playButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
        </div>
      </div>

      <div className={styles.audioContent}>
        <h3 className={styles.audioTitle}>{audio.title}</h3>
        <p className={styles.audioDescription}>{audio.excerpt || 'Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.'}</p>
        
        <div className={styles.audioStats}>
          <div className={styles.statPills}>
            <span className={styles.statPill}>♥ {audio.likes || 0}</span>
            <span className={styles.statPill}>💬 {audio.commentsCount || 0}</span>
          </div>
          <div className={styles.audioBookmark}>🔖</div>
        </div>
      </div>
    </Link>
  );
}