'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import AuthModal from './AuthModal';
import { API_URL } from '@/lib/api';
import { AUTH_MODAL_EVENT, AuthModalDetail } from '@/lib/authEvents';

interface Suggestion {
  type: 'post' | 'author' | 'category' | 'tag';
  label: string;
  slug?: string;
  username?: string;
}

interface HeaderLink {
  label: string;
  href: string;
  order: number;
}

interface SiteSettings {
  siteName: string;
  logo: string;
  headerLinks: HeaderLink[];
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 👇 NEW: Listen for global "openAuthModal" events
  useEffect(() => {
    const handleOpenAuthModal = (event: Event) => {
      const customEvent = event as CustomEvent<AuthModalDetail>;
      const mode = customEvent.detail?.mode || 'login';
      setAuthMode(mode);
      setIsAuthModalOpen(true);
    };

    window.addEventListener(AUTH_MODAL_EVENT, handleOpenAuthModal);
    return () => {
      window.removeEventListener(AUTH_MODAL_EVENT, handleOpenAuthModal);
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'post' && suggestion.slug) {
      router.push(`/post/${suggestion.slug}`);
    } else if (suggestion.type === 'author' && suggestion.username) {
      router.push(`/author/${suggestion.username}`);
    } else if (suggestion.type === 'category') {
      router.push(`/category/${suggestion.label.toLowerCase()}`);
    } else if (suggestion.type === 'tag') {
      router.push(`/tag/${suggestion.label.toLowerCase()}`);
    }
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'post': return '📄';
      case 'author': return '👤';
      case 'category': return '🏷️';
      case 'tag': return '🔖';
      default: return '•';
    }
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileSearchOpen(false);
    setIsAccountMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  };

  const toggleAccount = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsAccountMenuOpen(false);
  };

  const logoUrl = settings?.logo || '/logo.svg';

  const headerLinks: HeaderLink[] =
    settings?.headerLinks && settings.headerLinks.length > 0
      ? [...settings.headerLinks].sort((a, b) => a.order - b.order)
      : [
          { label: 'Home', href: '/', order: 1 },
          { label: 'Categories', href: '/categories', order: 2 },
          { label: 'Explore', href: '/explore', order: 3 },
        ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <nav className={styles.navbar}>
        <div className={styles.leftLinks}>
          {headerLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`${styles.link} ${isLinkActive(item.href) ? styles.linkActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link href="/" className={styles.logo} aria-label="AllAbout Home">
          <Image src={logoUrl} alt="all-about logo" width={120} height={40} priority />
        </Link>

        <div className={styles.rightActions}>
          <div className={styles.searchContainer} ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F7931E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              />
            </form>

            {showSuggestions && searchQuery.length >= 2 && (
              <div className={styles.suggestionsDropdown}>
                {isSearching ? (
                  <div className={styles.suggestionLoading}>Searching...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className={styles.suggestionIcon}>{getIcon(suggestion.type)}</span>
                      <span className={styles.suggestionLabel}>{suggestion.label}</span>
                      <span className={styles.suggestionType}>{suggestion.type}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.suggestionNoResults}>No results found</div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => openAuthModal('login')} className={styles.loginBtn}>Login</button>
          <button onClick={() => openAuthModal('register')} className={styles.signupBtn}>Register</button>
        </div>
      </nav>

      {/* ================= MOBILE NAVBAR ================= */}
      <nav className={styles.mobileNavbar}>
        <Link href="/" className={styles.mobileLogo} aria-label="AllAbout Home">
          <Image src={logoUrl} alt="all-about logo" width={120} height={40} priority />
        </Link>

        <div className={styles.mobileRightActions}>
          <button className={styles.mobileIconBtn} onClick={toggleSearch} aria-label="Search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <button className={styles.mobileIconBtn} onClick={toggleAccount} aria-label="Account">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          <button className={styles.mobileIconBtn} onClick={toggleMenu} aria-label="Toggle navigation menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {isMobileSearchOpen && (
          <div className={`${styles.mobileSearchOverlay} ${styles.mobileSearchOverlayOpen}`}>
            <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
              <input
                type="text"
                placeholder="Search articles..."
                className={styles.mobileSearchInput}
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
            </form>
          </div>
        )}

        {isAccountMenuOpen && (
          <div className={`${styles.mobileAccountMenu} ${styles.mobileAccountMenuOpen}`}>
            <button onClick={() => openAuthModal('login')} className={styles.mobileAuthBtn}>Login</button>
            <button onClick={() => openAuthModal('register')} className={styles.mobileAuthBtn}>Register</button>
          </div>
        )}

        {isMobileMenuOpen && (
          <div className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`}>
            {headerLinks.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`${styles.link} ${isLinkActive(item.href) ? styles.linkActive : ''}`}
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
      )}
    </>
  );
}