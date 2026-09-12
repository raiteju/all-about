'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteMgmtOpen, setSiteMgmtOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/');
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(parsed);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Auto-open Site Management dropdown if on its pages
  useEffect(() => {
    if (pathname.startsWith('/admin/site-management')) {
      setSiteMgmtOpen(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/posts', label: 'Posts', icon: '📝' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/comments', label: 'Comments', icon: '💬' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { href: '/admin/contact', label: 'Contact', icon: '📬' }, // 👈 NEW
];

  // Site Management sub-items
  const siteMgmtItems = [
  { href: '/admin/site-management/header', label: 'Header Management', icon: '🎨' },
  { href: '/admin/site-management/footer', label: 'Footer Management', icon: '🦶' },
  { href: '/admin/site-management/pages', label: 'Pages Management', icon: '📄' },
  { href: '/admin/site-management/contact', label: 'Contact Settings', icon: '📬' },
  { href: '/admin/site-management/seo-settings', label: 'Homepage & SEO', icon: '🔍' }, // 👈 NEW
];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      {/* Mobile Hamburger Button */}
      <button
        className={styles.mobileMenuBtn}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.sidebarLogo} onClick={closeMobileMenu}>
            <Image
              src="/logo.svg"
              alt="AllAbout Admin"
              width={140}
              height={45}
              priority
            />
          </Link>
          <button
            className={styles.mobileCloseBtn}
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.sidebarLink} ${
                pathname === item.href ? styles.sidebarLinkActive : ''
              }`}
              onClick={closeMobileMenu}
            >
              <span className={styles.sidebarIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Site Management Dropdown */}
          <div className={styles.sidebarDropdown}>
            <button
              className={`${styles.sidebarLink} ${
                pathname.startsWith('/admin/site-management') ? styles.sidebarLinkActive : ''
              }`}
              onClick={() => setSiteMgmtOpen(!siteMgmtOpen)}
            >
              <span className={styles.sidebarIcon}>⚙️</span>
              Site Management
              <span className={`${styles.dropdownArrow} ${siteMgmtOpen ? styles.dropdownArrowOpen : ''}`}>
                ▾
              </span>
            </button>
            {siteMgmtOpen && (
              <div className={styles.sidebarSubMenu}>
                {siteMgmtItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.sidebarSubLink} ${
                      pathname === item.href ? styles.sidebarSubLinkActive : ''
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className={styles.sidebarSubIcon}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.sidebarLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.adminMain}>
        <header className={styles.adminHeader}>
          <h1 className={styles.adminTitle}>
            {navItems.find((item) => item.href === pathname)?.label ||
             siteMgmtItems.find((item) => item.href === pathname)?.label ||
             'Dashboard'}
          </h1>
          <div className={styles.adminUser}>
            <span className={styles.adminUserName}>{user.firstName} {user.lastName}</span>
            <span className={styles.adminBadge}>Admin</span>
          </div>
        </header>
        <div className={styles.adminContent}>{children}</div>
      </main>
    </div>
  );
}