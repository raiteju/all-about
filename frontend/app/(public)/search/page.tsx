'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/api';
import styles from './Search.module.css';

interface Post {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string;
  type: string;
  createdAt: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
  };
  categories: string[];
  tags: string[];
}

interface Author {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  bio: string;
}

interface SearchResult {
  posts: Post[];
  authors: Author[];
  categories: string[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  searchTerm: string;
  appliedFilters: {
    type: string;
    category: string | null;
    author: string | null;
    sort: string;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';
  const categoryParam = searchParams.get('category') || '';
  const authorParam = searchParams.get('author') || '';
  const sortParam = searchParams.get('sort') || 'latest';
  const pageParam = parseInt(searchParams.get('page') || '1');

  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedAuthor, setSelectedAuthor] = useState(authorParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, selectedType, selectedCategory, selectedAuthor, selectedSort, currentPage]);

  const fetchResults = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        q: query,
        type: selectedType,
        sort: selectedSort,
        page: currentPage.toString(),
        limit: '20'
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedAuthor) params.append('author', selectedAuthor);

      const res = await fetch(`${API_URL}/api/search/global?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Search failed');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    router.push(`/search?${newParams}`);
    
    // Update state
    if (key === 'type') setSelectedType(value);
    else if (key === 'category') setSelectedCategory(value);
    else if (key === 'author') setSelectedAuthor(value);
    else if (key === 'sort') setSelectedSort(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', page.toString());
    router.push(`/search?${newParams}`);
    setCurrentPage(page);
  };

  if (!query) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <h1 className={styles.emptyTitle}>Search for Anything</h1>
          <p className={styles.emptyText}>Enter a search term to find articles, authors, and more.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchResults} className={styles.retryBtn}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!results || results.total === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noResultsState}>
          <span className={styles.noResultsIcon}>😕</span>
          <h2>No results found</h2>
          <p>We couldn't find anything matching "{query}"</p>
          <p className={styles.noResultsHint}>Try adjusting your search term or filters</p>
          <button onClick={() => router.push('/')} className={styles.backHomeBtn}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Search Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Search Results</h1>
        <p className={styles.subtitle}>
          Found <strong>{results.total}</strong> results for "{results.searchTerm}"
        </p>
      </div>

      <div className={styles.content}>
        {/* Filters Sidebar */}
        <aside className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Content Type</label>
            <select
              value={selectedType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort By</label>
            <select
              value={selectedSort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {results.categories.length > 0 && (
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Categories</label>
              <div className={styles.categoryTags}>
                {results.categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.categoryTag} ${selectedCategory === cat ? styles.active : ''}`}
                    onClick={() => handleFilterChange('category', selectedCategory === cat ? '' : cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.authors.length > 0 && (
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Authors</label>
              <div className={styles.authorList}>
                {results.authors.map((author) => (
                  <button
                    key={author._id}
                    className={`${styles.authorItem} ${selectedAuthor === author.username ? styles.active : ''}`}
                    onClick={() => handleFilterChange('author', selectedAuthor === author.username ? '' : author.username)}
                  >
                    <span className={styles.authorAvatar}>
                      {author.avatar ? (
                        <Image src={author.avatar} alt={author.firstName} width={24} height={24} />
                      ) : (
                        <span className={styles.authorInitial}>
                          {author.firstName?.[0]}{author.lastName?.[0]}
                        </span>
                      )}
                    </span>
                    <span className={styles.authorName}>
                      {author.firstName} {author.lastName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Results Grid */}
        <main className={styles.results}>
          {results.posts.map((post) => (
            <Link href={`/post/${post.slug}`} key={post._id} className={styles.postCard}>
              {post.featuredImage && (
                <div className={styles.postImage}>
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    width={300}
                    height={200}
                    className={styles.postImageSrc}
                  />
                  <span className={styles.postType}>{post.type}</span>
                </div>
              )}
              <div className={styles.postContent}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                {post.summary && (
                  <p className={styles.postSummary}>{post.summary}</p>
                )}
                <div className={styles.postMeta}>
                  <span className={styles.postAuthor}>
                    {post.author?.firstName} {post.author?.lastName}
                  </span>
                  <span className={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className={styles.postViews}>👁️ {post.viewsCount}</span>
                  <span className={styles.postLikes}>❤️ {post.likesCount}</span>
                </div>
                {post.categories && post.categories.length > 0 && (
                  <div className={styles.postCategories}>
                    {post.categories.slice(0, 3).map((cat) => (
                      <span key={cat} className={styles.postCategoryTag}>{cat}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {results.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === results.totalPages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}