'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';
import { API_URL } from '@/lib/api';

interface Suggestion {
  type: 'post' | 'author' | 'category' | 'tag';
  label: string;
  slug?: string;
  username?: string;
}

interface CategoryChip {
  name: string;
  slug: string;
}

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
  searchPlaceholder: string;
  categories: CategoryChip[];
}

export default function Hero({
  title,
  subtitle,
  image,
  searchPlaceholder,
  categories,
}: HeroProps) {
  const router = useRouter();

  // ============================================
  // SEARCH STATE (same pattern as Navbar)
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <section className={styles.hero}>
      {/* Background Image */}
      {image && (
        <Image
          src={image}
          alt="Hero Background"
          fill
          priority
          className={styles.bgImage}
          sizes="100vw"
        />
      )}

      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {/* Search Bar with live suggestions */}
        <div className={styles.searchWrapper} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Search">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F7931E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {/* Suggestions dropdown */}
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
                    <span className={styles.suggestionIcon}>
                      {getIcon(suggestion.type)}
                    </span>
                    <span className={styles.suggestionLabel}>
                      {suggestion.label}
                    </span>
                    <span className={styles.suggestionType}>
                      {suggestion.type}
                    </span>
                  </div>
                ))
              ) : (
                <div className={styles.suggestionNoResults}>No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className={styles.categoriesRow}>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={styles.catPill}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}