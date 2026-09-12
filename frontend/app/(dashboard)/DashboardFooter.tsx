'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './dashboard/dashboard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FooterLink {
  label: string;
  href: string;
  order: number;
}

interface SiteSettings {
  footerCopyright: string;
  footerAuthorName: string;
  footerLinks: FooterLink[];
}

export default function DashboardFooter() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch footer settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Fallback values (used before settings load)
  const footerCopyright =
    settings?.footerCopyright || '©2023 - 2026. All rights reserved.';
  const footerAuthorName = settings?.footerAuthorName || 'Teju Rai';

  // Fallback links if admin hasn't configured any
  const footerLinks: FooterLink[] =
    settings?.footerLinks && settings.footerLinks.length > 0
      ? [...settings.footerLinks].sort((a, b) => a.order - b.order)
      : [
          { label: 'About', href: '/about', order: 1 },
          { label: 'Category', href: '/category', order: 2 },
          { label: 'Support', href: '/support', order: 3 },
          { label: 'Contact', href: '/contact', order: 4 },
        ];

  return (
    <footer className={styles.dashboardFooter}>
      <p className={styles.copyrightText}>
        {footerCopyright} Made by{' '}
        <span className={styles.authorName}>{footerAuthorName}</span> with ❤️
      </p>

      <div className={styles.footerLinks}>
        {/* target="_blank" opens public pages in new tab so author doesn't lose dashboard state */}
        {footerLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            target="_blank"
            className={styles.footerLink}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}