'use client';

import { useState } from 'react';
import styles from './SEOAnalysisPanel.module.css';
import { SEOResult, SEOCheck } from '@/lib/seoAnalyzer';

interface Props {
  result: SEOResult;
  focusKeyword: string;
  onFocusKeywordChange: (value: string) => void;
  seoTitle: string;
  onSeoTitleChange: (value: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (value: string) => void;
  seoKeywords: string;
  onSeoKeywordsChange: (value: string) => void;
  ogImage: string;
  onOgImageChange: (value: string) => void;
  previewTitle: string;
  previewDescription: string;
  previewSlug: string;
}

export default function SEOAnalysisPanel({
  result,
  focusKeyword,
  onFocusKeywordChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  seoKeywords,
  onSeoKeywordsChange,
  ogImage,
  onOgImageChange,
  previewTitle,
  previewDescription,
  previewSlug,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'good': return '🟢';
      case 'ok': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const statusLabel = () => {
    if (result.status === 'good') return 'Good';
    if (result.status === 'ok') return 'Needs Improvement';
    return 'Poor';
  };

  const goodCount = result.checks.filter((c) => c.status === 'good').length;
  const poorCount = result.checks.filter((c) => c.status === 'poor').length;

  const truncTitle = previewTitle.length > 60
    ? previewTitle.substring(0, 57) + '...'
    : previewTitle || 'Your post title will appear here';

  const truncDesc = previewDescription.length > 160
    ? previewDescription.substring(0, 157) + '...'
    : previewDescription || 'Your meta description preview will appear here. Write 150-160 characters to encourage clicks from search results.';

  return (
    <div className={styles.panel}>
      {/* ============ HEADER ============ */}
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>🔍</span>
          <span className={styles.title}>SEO Analysis</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.badge} ${styles[`badge_${result.status}`]}`}>
            {statusLabel()} · {result.score}/100
          </span>
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* ============ FOCUS KEYWORD (always visible) ============ */}
      <div className={styles.keywordRow}>
        <label className={styles.keywordLabel}>Focus Keyword</label>
        <input
          type="text"
          className={styles.keywordInput}
          value={focusKeyword}
          onChange={(e) => onFocusKeywordChange(e.target.value)}
          placeholder="e.g., react tutorial"
        />
      </div>

      {/* ============ SUMMARY (collapsed) ============ */}
      {!expanded && (
        <div className={styles.summary}>
          <span>🟢 {goodCount} passed</span>
          <span>🔴 {poorCount} issues</span>
          <span className={styles.summaryHint}>Click to see details</span>
        </div>
      )}

      {/* ============ EXPANDED CONTENT ============ */}
      {expanded && (
        <>
          {/* Checks list */}
          <div className={styles.checks}>
            {result.checks.map((check) => (
              <div key={check.id} className={styles.checkItem}>
                <span className={styles.checkIcon}>{statusIcon(check.status)}</span>
                <div className={styles.checkContent}>
                  <div className={styles.checkLabel}>{check.label}</div>
                  <div className={styles.checkMessage}>{check.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Meta field overrides */}
          <div className={styles.metaSection}>
            <div className={styles.metaTitle}>SEO Meta (Optional Overrides)</div>

            <div className={styles.metaField}>
              <label className={styles.metaLabel}>
                Meta Title <span className={styles.metaHint}>({(seoTitle || previewTitle).length}/60)</span>
              </label>
              <input
                type="text"
                className={styles.metaInput}
                value={seoTitle}
                onChange={(e) => onSeoTitleChange(e.target.value)}
                placeholder={previewTitle || 'Leave empty to use post title'}
                maxLength={70}
              />
            </div>

            <div className={styles.metaField}>
              <label className={styles.metaLabel}>
                Meta Description <span className={styles.metaHint}>({(seoDescription || previewDescription).length}/160)</span>
              </label>
              <textarea
                className={styles.metaTextarea}
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                placeholder={previewDescription || 'Leave empty to use post excerpt'}
                rows={3}
                maxLength={180}
              />
            </div>

            <div className={styles.metaField}>
              <label className={styles.metaLabel}>Meta Keywords</label>
              <input
                type="text"
                className={styles.metaInput}
                value={seoKeywords}
                onChange={(e) => onSeoKeywordsChange(e.target.value)}
                placeholder="comma, separated, keywords"
              />
            </div>

            <div className={styles.metaField}>
              <label className={styles.metaLabel}>OG Image URL</label>
              <input
                type="text"
                className={styles.metaInput}
                value={ogImage}
                onChange={(e) => onOgImageChange(e.target.value)}
                placeholder="Leave empty to use featured image"
              />
            </div>
          </div>

          {/* Google Preview */}
          <div className={styles.previewSection}>
            <div className={styles.previewLabel}>🔍 Google Preview</div>
            <div className={styles.googlePreview}>
              <div className={styles.googleUrl}>
                localhost:3000 › post › {previewSlug || 'your-slug'}
              </div>
              <div className={styles.googleTitle}>{truncTitle}</div>
              <div className={styles.googleDesc}>{truncDesc}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}