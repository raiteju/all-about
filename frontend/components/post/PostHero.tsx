'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';
import { toggleLike } from '@/lib/api';

// Helper to normalize image URL
const normalizeImageUrl = (url: string) => {
  if (!url) return '';
  let normalized = url.replace(/\\/g, '/');
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
};

export default function PostHero({ post }: { post: any }) {
  const router = useRouter();
  const fallbackImage = 'https://picsum.photos/seed/hero/1200/600';
  const fallbackAvatar = 'https://i.pravatar.cc/150?img=5';

  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const videoUrl = post.videoUrl;
  const youtubeEmbedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login to like this post.'); return; }
      const data = await toggleLike(post._id, token);
      setLikes(data.likes);
      setIsLiked(!isLiked);
    } catch (error) { console.error(error); }
  };

  const handleBookmark = () => setIsBookmarked(!isBookmarked);
  const handleEmailShare = () => {
    const url = window.location.href;
    window.location.href = `mailto:?subject=Check out this post&body=${encodeURIComponent(url)}`;
  };
  const handleSocialShare = (platform: string) => {
    const url = window.location.href;
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}`, '_blank');
    else if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    else if (platform === 'whatsapp') window.open(`https://wa.me/?text=${url}`, '_blank');
    setIsSocialShareOpen(false);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.authorObj?.username) {
      router.push(`/author/${post.authorObj.username}`);
    }
  };

  const SocialIcons = {
    Facebook: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    Twitter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
    LinkedIn: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>,
    WhatsApp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
  };

  // 1. AUDIO LAYOUT
  if (post.type === 'audio') {
    const audioBg = normalizeImageUrl(post.featuredImage) || fallbackImage;
    const audioAvatar = normalizeImageUrl(post.avatar) || fallbackAvatar;

    return (
      <div className={styles.audioHeroContainer}>
        <div className={styles.audioBg}>
          <Image 
            src={audioBg} 
            alt="Audio Background" 
            fill 
            sizes="100vw"
            style={{ objectFit: 'cover' }} 
          />
        </div>
        
        <div className={styles.audioOverlayCard}>
          <div className={styles.audioCardInner}>
            <div className={styles.audioThumbArea}>
              <Image 
                src={audioAvatar} 
                alt={post.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 400px"
                style={{ objectFit: 'cover' }} 
              />
            </div>

            <div className={styles.audioInfo}>
              <div className={styles.audioBreadcrumbs}>
                <div className={styles.audioBreadcrumbLinks}>
                  <Link href="/">Home</Link> › <span>Article</span> › <span className={styles.audioBreadcrumbCurrent}>{post.title}</span>
                </div>
                <span className={styles.audioCategoryTag}>{post.category || 'Music'}</span>
              </div>

              <h1 className={styles.audioTitle}>{post.title}</h1>
              <p className={styles.audioDescription}>{post.excerpt || 'Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.'}</p>
              
              {post.audioUrl && (
                <audio controls style={{ width: '100%', marginTop: '16px', marginBottom: '16px' }}>
                  <source src={post.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}

              <div className={styles.audioBottomMeta}>
                <div className={styles.audioAuthorRow}>
                  <span 
                    onMouseDown={handleAuthorClick}
                    style={{ cursor: 'pointer', display: 'inline-flex' }}
                  >
                    <Image src={audioAvatar} alt={post.authorName} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  </span>
                  <span 
                    onMouseDown={handleAuthorClick}
                    style={{ cursor: 'pointer', fontWeight: '500', color: '#111' }}
                  >
                    {post.authorName || 'Author'}
                  </span>
                  <span style={{ color: 'var(--text-gray)' }}>· {post.date}</span>
                </div>
                <div className={styles.audioStatsRow}>
                  <span onClick={handleLike} style={{ cursor: 'pointer', color: isLiked ? 'red' : 'inherit' }}>♥ {likes}</span>
                  <span>💬 {post.commentsCount || 0}</span>
                  <div className={styles.audioIcon} onClick={handleBookmark} style={{ cursor: 'pointer', color: isBookmarked ? 'red' : 'inherit' }}>🔖</div>
                  <div className={styles.audioIcon} onClick={handleEmailShare} style={{ cursor: 'pointer' }}>↗</div>
                  <div className={styles.audioIcon} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsSocialShareOpen(!isSocialShareOpen)}>
                    •••
                    {isSocialShareOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '10px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '8px', zIndex: '100', width: '170px' }}>
                        <button onClick={() => handleSocialShare('facebook')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.Facebook /> Facebook</button>
                        <button onClick={() => handleSocialShare('twitter')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.Twitter /> Twitter</button>
                        <button onClick={() => handleSocialShare('linkedin')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.LinkedIn /> LinkedIn</button>
                        <button onClick={() => handleSocialShare('whatsapp')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.WhatsApp /> WhatsApp</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. VIDEO LAYOUT
  if (post.type === 'video') {
    const videoAvatar = normalizeImageUrl(post.avatar) || fallbackAvatar;

    return (
      <div className={styles.videoHeroContainer}>
        <div className={styles.videoHeroBg}></div>

        <div className={styles.videoPlayer}>
          {youtubeEmbedUrl && (
            <iframe 
              width="100%" 
              height="100%" 
              src={youtubeEmbedUrl} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{ border: 'none', borderRadius: '24px', objectFit: 'cover' }}
            ></iframe>
          )}

          {!youtubeEmbedUrl && !videoReady && (
            <>
              <Image 
                src={post.featuredImage || fallbackImage} 
                alt={post.title} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
                style={{ objectFit: 'cover' }} 
              />
              <button onClick={() => setVideoReady(true)} className={styles.playBtn} aria-label="Play video">
                <span className={styles.playBtnInner}>
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                    <path d="M0 0L20 12L0 24V0Z" fill="#F4801F"/>
                  </svg>
                </span>
              </button>
            </>
          )}

          {!youtubeEmbedUrl && videoReady && post.videoUrl && (
            <video controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
              <source src={post.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className={styles.videoContent}>
          <span className={styles.videoTag}>{post.category || 'Travel'}</span>
          <h1 className={styles.videoTitle}>{post.title}</h1>
          <div className={styles.videoDivider}></div>

          <div className={styles.videoAuthorRow}>
            <span 
              onMouseDown={handleAuthorClick}
              style={{ cursor: 'pointer' }}
            >
              <Image src={videoAvatar} alt={post.authorName} width={46} height={46} className={styles.videoAuthorAvatar} />
            </span>
            <div>
              <span 
                onMouseDown={handleAuthorClick}
                style={{ cursor: 'pointer', fontWeight: '600', color: '#fff' }}
              >
                <p className={styles.videoAuthorName}>{post.authorName || 'Author'}</p>
              </span>
              <p className={styles.videoAuthorDate}>{post.date}</p>
            </div>
          </div>

          <div className={styles.videoStats}>
            <button className={styles.videoStatPill} onClick={handleLike} style={{ cursor: 'pointer', color: isLiked ? 'red' : 'inherit' }}>♥ {likes}</button>
            <button className={styles.videoStatPill}>💬 {post.commentsCount || 0}</button>
            <div className={styles.videoStatIcon} onClick={handleBookmark} style={{ cursor: 'pointer', color: isBookmarked ? 'red' : 'inherit' }}>🔖</div>
            <div className={styles.videoStatIcon} onClick={handleEmailShare} style={{ cursor: 'pointer' }}>↗</div>
            <div className={styles.videoStatIcon} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsSocialShareOpen(!isSocialShareOpen)}>
              •••
              {isSocialShareOpen && (
                <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '10px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '8px', zIndex: '100', width: '170px' }}>
                  <button onClick={() => handleSocialShare('facebook')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.Facebook /> Facebook</button>
                  <button onClick={() => handleSocialShare('twitter')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.Twitter /> Twitter</button>
                  <button onClick={() => handleSocialShare('linkedin')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.LinkedIn /> LinkedIn</button>
                  <button onClick={() => handleSocialShare('whatsapp')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.WhatsApp /> WhatsApp</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.videoBreadcrumbs}>
          <span>Home</span>
          <span className={styles.videoBreadcrumbChevron}>›</span>
          <span>Article</span>
          <span className={styles.videoBreadcrumbChevron}>›</span>
          <span className={styles.videoBreadcrumbCurrent}>{post.title}</span>
        </div>
      </div>
    );
  }

  // 3. ARTICLE LAYOUT
  const articleAvatar = normalizeImageUrl(post.avatar) || fallbackAvatar;

  return (
    <div>
      <div className={styles.articleBreadcrumbRow}>
        <div className={styles.articleBreadcrumbs}>
          <Link href="/" className={styles.articleBreadcrumbLink}>Home</Link>
          <span className={styles.articleBreadcrumbChevron}>›</span>
          <span className={styles.articleBreadcrumbLink}>Article</span>
          <span className={styles.articleBreadcrumbChevron}>›</span>
          <span className={styles.articleBreadcrumbCurrent}>{post.title}</span>
        </div>
        <span className={styles.articleCategoryTag}>{post.category || 'Travel'}</span>
      </div>

      <div className={styles.articleHeroWrapper}>
        <Image 
          src={post.featuredImage || fallbackImage}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className={styles.articleMetaRow}>
        <div className={styles.articleAuthor}>
          <span 
            onMouseDown={handleAuthorClick}
            style={{ cursor: 'pointer' }}
          >
            <Image src={articleAvatar} alt={post.authorName} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
          </span>
          <span 
            onMouseDown={handleAuthorClick}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.articleAuthorName}>{post.authorName || 'Author'}</span>
          </span>
          <span className={styles.articleDate}>· {post.date}</span>
        </div>
        
        <div className={styles.articleStats}>
          <button onClick={handleLike} className={styles.videoStatIcon} style={{ cursor: 'pointer', color: isLiked ? 'red' : 'inherit' }}>♥ {likes}</button>
          <button className={styles.videoStatIcon}>💬 {post.commentsCount || 0}</button>
          <div className={styles.videoStatIcon} onClick={handleBookmark} style={{ cursor: 'pointer', color: isBookmarked ? 'red' : 'inherit' }}>🔖</div>
          <div className={styles.videoStatIcon} onClick={handleEmailShare} style={{ cursor: 'pointer' }}>↗</div>
          <div className={styles.videoStatIcon} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsSocialShareOpen(!isSocialShareOpen)}>
            •••
            {isSocialShareOpen && (
              <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '10px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '8px', zIndex: '100', width: '170px' }}>
                <button onClick={() => handleSocialShare('facebook')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.Facebook /> Facebook</button>
                <button onClick={() => handleSocialShare('twitter')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.Twitter /> Twitter</button>
                <button onClick={() => handleSocialShare('linkedin')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.LinkedIn /> LinkedIn</button>
                <button onClick={() => handleSocialShare('whatsapp')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer' }}><SocialIcons.WhatsApp /> WhatsApp</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}