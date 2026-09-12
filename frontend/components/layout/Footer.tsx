'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './Footer.module.css';
import { subscribeToNewsletter } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FooterLink {
  label: string;
  href: string;
  order: number;
}

interface SocialLink {
  platform: string;
  url: string;
  order: number;
}

interface SiteSettings {
  footerAbout: string;
  footerCopyright: string;
  footerAuthorName: string;
  footerLinks: FooterLink[];
  socialLinks: SocialLink[];
}

interface TopCategory {
  name: string;
  count: number;
  slug: string;
  image: string;
}

// ============================================
// SOCIAL ICON HELPER - Returns SVG per platform
// ============================================
function getSocialIcon(platform: string) {
  const p = platform.toLowerCase();
  switch (p) {
    case 'facebook':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.02 8h5v16h-5V8zm7.98 0h4.78v2.2h.07c.665-1.26 2.29-2.59 4.71-2.59 5.04 0 5.98 3.32 5.98 7.64V24h-5v-7.1c0-1.7-.03-3.88-2.37-3.88-2.37 0-2.73 1.85-2.73 3.76V24h-5V8z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case 'github':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);

  // 👇 NEW: Newsletter form state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeError, setSubscribeError] = useState('');

  // Fetch site settings + top categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch site settings
        const settingsRes = await fetch(`${API_URL}/api/site-settings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }

        // Fetch top 5 categories
        const catRes = await fetch(`${API_URL}/api/categories/top?limit=5`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setTopCategories(catData);
        }
      } catch (err) {
        console.error('Failed to fetch footer data:', err);
      }
    };
    fetchData();
  }, []);

  // ============================================
  // 👇 NEW: NEWSLETTER FORM HANDLER
  // ============================================
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscribeMessage('');
    setSubscribeError('');

    try {
      const data = await subscribeToNewsletter(email, 'footer');
      setSubscribeMessage(data.message || 'Thank you for subscribing! 🎉');
      setEmail('');
      setTimeout(() => setSubscribeMessage(''), 5000);
    } catch (err: any) {
      setSubscribeError(err.message || 'Failed to subscribe. Please try again.');
      setTimeout(() => setSubscribeError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback values (used before settings load or if API fails)
  const footerAbout =
    settings?.footerAbout ||
    "All about is the world's leading community for creatives to share, grow, and get hired.";
  const footerCopyright = settings?.footerCopyright || '©2023 - 2026. All rights reserved.';
  const footerAuthorName = settings?.footerAuthorName || 'Teju Rai';

  // Footer links (sorted by order) with fallback
  const footerLinks: FooterLink[] =
    settings?.footerLinks && settings.footerLinks.length > 0
      ? [...settings.footerLinks].sort((a, b) => a.order - b.order)
      : [
          { label: 'About', href: '/about', order: 1 },
          { label: 'Category', href: '/category', order: 2 },
          { label: 'Support', href: '/support', order: 3 },
          { label: 'Contact', href: '/contact', order: 4 },
        ];

  // Social links (sorted by order)
  const socialLinks: SocialLink[] =
    settings?.socialLinks && settings.socialLinks.length > 0
      ? [...settings.socialLinks].sort((a, b) => a.order - b.order)
      : [];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Brand Column */}
          <div className={styles.brand}>
            <Link href="/" aria-label="AllAbout Home">
              <Image
                src="/logo.svg"
                alt="all-about logo"
                width={120}
                height={40}
                priority
              />
            </Link>

            {/* Dynamic About Text */}
            <p className={styles.brandText}>{footerAbout}</p>

            {/* Dynamic Social Icons */}
            {socialLinks.length > 0 && (
              <div className={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={social.platform}
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore Column (Post Types) */}
          <div>
            <h3 className={styles.columnTitle}>Explore</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/explore/articles" className={styles.linkItem}>
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/explore/audio" className={styles.linkItem}>
                  Audio
                </Link>
              </li>
              <li>
                <Link href="/explore/video" className={styles.linkItem}>
                  Video
                </Link>
              </li>
            </ul>
          </div>

          {/* Category Column (Dynamic Top 5) */}
          <div>
            <h3 className={styles.columnTitle}>Category</h3>
            <ul className={styles.linksList}>
              {topCategories.length === 0 ? (
                <>
                  <li className={styles.linkItem}>Loading...</li>
                </>
              ) : (
                topCategories.map((cat, index) => (
                  <li key={index}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className={styles.linkItem}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className={styles.newsletterTitle}>Subscribe to our Newsletter</h3>
            <p className={styles.newsletterText}>
              Don&apos;t miss any updates on allabout...
            </p>

            {/* 👇 UPDATED: Form is now wired to the API */}
            <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <div className={styles.emailIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>

              <input
                type="email"
                placeholder="Your email"
                className={styles.emailInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />

              <button
                type="submit"
                className={styles.subscribeBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Subscribe'}
              </button>
            </form>

            {/* 👇 NEW: Feedback messages */}
            {subscribeMessage && (
              <p className={styles.subscribeMessage}>{subscribeMessage}</p>
            )}
            {subscribeError && (
              <p className={styles.subscribeError}>{subscribeError}</p>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            {footerCopyright} Made by{' '}
            <span className={styles.authorName}>{footerAuthorName}</span> with
            <svg
              width="18"
              height="18"
              viewBox="0 0 32 32"
              style={{
                margin: '0 4px',
                verticalAlign: 'middle',
                filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.3))',
              }}
            >
              <defs>
                <linearGradient id="3dHeart" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF5C5C', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#B30000', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                fill="url(#3dHeart)"
                d="M23.6,2c-3.363,0-6.258,2.736-7.599,5.594C14.658,4.736,11.762,2,8.4,2C3.762,2,0,5.762,0,10.4c0,8.284,10.805,15.307,14.732,17.904 c0.27,0.179,0.602,0.179,0.872,0C19.195,25.707,30,18.684,30,10.4C30,5.762,26.238,2,23.6,2z"
              />
              <path
                fill="rgba(255,255,255,0.4)"
                d="M7.2,5.2c-1.5,0-2.7,1.2-2.7,2.7c0,0.5,0.4,0.9,0.9,0.9s0.9-0.4,0.9-0.9c0-0.5,0.4-0.9,0.9-0.9s0.9-0.4,0.9-0.9S7.7,5.2,7.2,5.2z"
              />
            </svg>
            and precision
          </p>

          {/* Dynamic Legal Links */}
          <div className={styles.legalLinks}>
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={styles.legalLink}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}