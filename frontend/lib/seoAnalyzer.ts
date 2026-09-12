// ============================================
// SEO ANALYZER — Lean Yoast (15 checks)
// ============================================

export interface SEOInput {
  title: string;
  content: string; // HTML from Quill
  excerpt: string;
  slug: string;
  tags: string;
  focusKeyword: string;
  featuredImage: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type CheckStatus = 'good' | 'ok' | 'poor' | 'na';

export interface SEOCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
}

export interface SEOResult {
  score: number;
  status: 'good' | 'ok' | 'poor';
  checks: SEOCheck[];
}

// ============================================
// HELPER: Strip HTML to plain text
// ============================================
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

// ============================================
// HELPER: Count words
// ============================================
const countWords = (text: string): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
};

// ============================================
// HELPER: Count keyword occurrences (whole word, case insensitive)
// ============================================
const countKeyword = (text: string, keyword: string): number => {
  if (!text || !keyword) return 0;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
};

// ============================================
// HELPER: Get text from first <p> tag
// ============================================
const getFirstParagraphText = (html: string): string => {
  if (!html) return '';
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/is);
  if (pMatch) return stripHtml(pMatch[1]);
  return stripHtml(html).slice(0, 300);
};

// ============================================
// HELPER: Count HTML tags
// ============================================
const countTag = (html: string, tagName: string): number => {
  if (!html) return 0;
  const regex = new RegExp(`<${tagName}[^>]*>`, 'gi');
  const matches = html.match(regex);
  return matches ? matches.length : 0;
};

// ============================================
// HELPER: Count internal & external links
// ============================================
const countLinks = (html: string): { internal: number; external: number } => {
  if (!html) return { internal: 0, external: 0 };
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let internal = 0;
  let external = 0;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://')) {
      external++;
    } else if (href.startsWith('/') || href.startsWith('#')) {
      internal++;
    }
  }
  return { internal, external };
};

// ============================================
// HELPER: Count sentences
// ============================================
const countSentences = (text: string): number => {
  if (!text) return 0;
  const matches = text.match(/[.!?]+(?=\s|$)/g);
  return matches ? matches.length : 0;
};

// ============================================
// MAIN: analyzeSEO
// ============================================
export function analyzeSEO(input: SEOInput): SEOResult {
  const checks: SEOCheck[] = [];
  const keyword = (input.focusKeyword || '').trim().toLowerCase();
  const plainContent = stripHtml(input.content);
  const wordCount = countWords(plainContent);
  const firstPara = getFirstParagraphText(input.content);

  const finalTitle = (input.seoTitle || input.title || '').trim();
  const finalDescription = (input.seoDescription || input.excerpt || '').trim();

  // 1. Word count
  if (wordCount >= 300) {
    checks.push({ id: 'wordCount', label: 'Content length', status: 'good', message: `${wordCount} words — good length` });
  } else if (wordCount >= 150) {
    checks.push({ id: 'wordCount', label: 'Content length', status: 'ok', message: `${wordCount} words — aim for 300+` });
  } else {
    checks.push({ id: 'wordCount', label: 'Content length', status: 'poor', message: `${wordCount} words — too short (min 300)` });
  }

  // 2. Title length
  const titleLen = finalTitle.length;
  if (titleLen >= 50 && titleLen <= 60) {
    checks.push({ id: 'titleLength', label: 'Title length', status: 'good', message: `${titleLen} chars — perfect` });
  } else if ((titleLen >= 30 && titleLen < 50) || (titleLen > 60 && titleLen <= 70)) {
    checks.push({ id: 'titleLength', label: 'Title length', status: 'ok', message: `${titleLen} chars — aim for 50-60` });
  } else if (titleLen === 0) {
    checks.push({ id: 'titleLength', label: 'Title length', status: 'poor', message: 'No title set' });
  } else {
    checks.push({ id: 'titleLength', label: 'Title length', status: 'poor', message: `${titleLen} chars — out of range (50-60)` });
  }

  // 3. Meta description length
  const descLen = finalDescription.length;
  if (descLen >= 150 && descLen <= 160) {
    checks.push({ id: 'descLength', label: 'Meta description length', status: 'good', message: `${descLen} chars — perfect` });
  } else if ((descLen >= 120 && descLen < 150) || (descLen > 160 && descLen <= 180)) {
    checks.push({ id: 'descLength', label: 'Meta description length', status: 'ok', message: `${descLen} chars — aim for 150-160` });
  } else if (descLen === 0) {
    checks.push({ id: 'descLength', label: 'Meta description length', status: 'poor', message: 'No description set' });
  } else {
    checks.push({ id: 'descLength', label: 'Meta description length', status: 'poor', message: `${descLen} chars — out of range (150-160)` });
  }

  // 4-8. Keyword checks
  if (!keyword) {
    checks.push({ id: 'keywordTitle', label: 'Keyword in title', status: 'na', message: 'Set a focus keyword' });
    checks.push({ id: 'keywordDesc', label: 'Keyword in meta description', status: 'na', message: 'Set a focus keyword' });
    checks.push({ id: 'keywordFirstPara', label: 'Keyword in first paragraph', status: 'na', message: 'Set a focus keyword' });
    checks.push({ id: 'keywordSlug', label: 'Keyword in URL slug', status: 'na', message: 'Set a focus keyword' });
    checks.push({ id: 'keywordDensity', label: 'Keyword density', status: 'na', message: 'Set a focus keyword' });
  } else {
    // 4
    if (finalTitle.toLowerCase().includes(keyword)) {
      checks.push({ id: 'keywordTitle', label: 'Keyword in title', status: 'good', message: 'Focus keyword found in title' });
    } else {
      checks.push({ id: 'keywordTitle', label: 'Keyword in title', status: 'poor', message: 'Add focus keyword to title' });
    }

    // 5
    if (finalDescription.toLowerCase().includes(keyword)) {
      checks.push({ id: 'keywordDesc', label: 'Keyword in meta description', status: 'good', message: 'Focus keyword found in description' });
    } else {
      checks.push({ id: 'keywordDesc', label: 'Keyword in meta description', status: 'poor', message: 'Add focus keyword to description' });
    }

    // 6
    if (firstPara.toLowerCase().includes(keyword)) {
      checks.push({ id: 'keywordFirstPara', label: 'Keyword in first paragraph', status: 'good', message: 'Focus keyword found in opening paragraph' });
    } else {
      checks.push({ id: 'keywordFirstPara', label: 'Keyword in first paragraph', status: 'poor', message: 'Add focus keyword to first paragraph' });
    }

    // 7
    const keywordSlug = keyword.replace(/\s+/g, '-');
    if ((input.slug || '').toLowerCase().includes(keywordSlug)) {
      checks.push({ id: 'keywordSlug', label: 'Keyword in URL slug', status: 'good', message: 'Focus keyword found in slug' });
    } else {
      checks.push({ id: 'keywordSlug', label: 'Keyword in URL slug', status: 'poor', message: 'Include keyword in slug' });
    }

    // 8
    if (wordCount > 0) {
      const kwCount = countKeyword(plainContent, keyword);
      const density = (kwCount / wordCount) * 100;
      if (density >= 0.5 && density <= 2.5) {
        checks.push({ id: 'keywordDensity', label: 'Keyword density', status: 'good', message: `${density.toFixed(2)}% — good` });
      } else if (density > 0 && density < 0.5) {
        checks.push({ id: 'keywordDensity', label: 'Keyword density', status: 'ok', message: `${density.toFixed(2)}% — aim for 0.5-2.5%` });
      } else if (density > 2.5 && density <= 4) {
        checks.push({ id: 'keywordDensity', label: 'Keyword density', status: 'ok', message: `${density.toFixed(2)}% — slightly high` });
      } else if (density === 0) {
        checks.push({ id: 'keywordDensity', label: 'Keyword density', status: 'poor', message: 'Keyword not found in content' });
      } else {
        checks.push({ id: 'keywordDensity', label: 'Keyword density', status: 'poor', message: `${density.toFixed(2)}% — too high` });
      }
    } else {
      checks.push({ id: 'keywordDensity', label: 'Keyword density', status: 'na', message: 'No content yet' });
    }
  }

  // 9. H1 present
  const h1Count = countTag(input.content, 'h1');
  if (h1Count === 1) {
    checks.push({ id: 'h1', label: 'H1 heading', status: 'good', message: '1 H1 found' });
  } else if (h1Count === 0) {
    checks.push({ id: 'h1', label: 'H1 heading', status: 'poor', message: 'No H1 in content' });
  } else {
    checks.push({ id: 'h1', label: 'H1 heading', status: 'ok', message: `${h1Count} H1s found — use only one` });
  }

  // 10. H2/H3 subheadings
  const h2Count = countTag(input.content, 'h2');
  const h3Count = countTag(input.content, 'h3');
  const subheadingCount = h2Count + h3Count;
  if (subheadingCount >= 2) {
    checks.push({ id: 'subheadings', label: 'Subheadings (H2/H3)', status: 'good', message: `${subheadingCount} subheadings found` });
  } else if (subheadingCount === 1) {
    checks.push({ id: 'subheadings', label: 'Subheadings (H2/H3)', status: 'ok', message: '1 subheading — add more for structure' });
  } else {
    checks.push({ id: 'subheadings', label: 'Subheadings (H2/H3)', status: 'poor', message: 'No subheadings — break content into sections' });
  }

  // 11. Featured image
  if (input.featuredImage) {
    checks.push({ id: 'featuredImage', label: 'Featured image', status: 'good', message: 'Featured image is set' });
  } else {
    checks.push({ id: 'featuredImage', label: 'Featured image', status: 'poor', message: 'Add a featured image' });
  }

  // 12-13. Links
  const { internal, external } = countLinks(input.content);
  if (internal >= 1) {
    checks.push({ id: 'internalLinks', label: 'Internal links', status: 'good', message: `${internal} internal link${internal > 1 ? 's' : ''}` });
  } else {
    checks.push({ id: 'internalLinks', label: 'Internal links', status: 'ok', message: 'Add internal links to related content' });
  }

  if (external >= 1) {
    checks.push({ id: 'externalLinks', label: 'External links', status: 'good', message: `${external} external link${external > 1 ? 's' : ''}` });
  } else {
    checks.push({ id: 'externalLinks', label: 'External links', status: 'ok', message: 'Consider adding external sources' });
  }

  // 14. Avg sentence length
  const sentenceCount = countSentences(plainContent);
  if (sentenceCount > 0 && wordCount > 0) {
    const avgSentence = wordCount / sentenceCount;
    if (avgSentence < 20) {
      checks.push({ id: 'sentenceLength', label: 'Sentence length', status: 'good', message: `Avg ${avgSentence.toFixed(1)} words — readable` });
    } else if (avgSentence <= 25) {
      checks.push({ id: 'sentenceLength', label: 'Sentence length', status: 'ok', message: `Avg ${avgSentence.toFixed(1)} words — could be shorter` });
    } else {
      checks.push({ id: 'sentenceLength', label: 'Sentence length', status: 'poor', message: `Avg ${avgSentence.toFixed(1)} words — too long` });
    }
  } else {
    checks.push({ id: 'sentenceLength', label: 'Sentence length', status: 'na', message: 'Not enough content' });
  }

  // 15. Avg paragraph length
  const paragraphCount = countTag(input.content, 'p');
  if (paragraphCount > 0 && wordCount > 0) {
    const avgParagraph = wordCount / paragraphCount;
    if (avgParagraph < 150) {
      checks.push({ id: 'paragraphLength', label: 'Paragraph length', status: 'good', message: `Avg ${Math.round(avgParagraph)} words per para` });
    } else if (avgParagraph <= 200) {
      checks.push({ id: 'paragraphLength', label: 'Paragraph length', status: 'ok', message: `Avg ${Math.round(avgParagraph)} words — slightly long` });
    } else {
      checks.push({ id: 'paragraphLength', label: 'Paragraph length', status: 'poor', message: `Avg ${Math.round(avgParagraph)} words — split into shorter paras` });
    }
  } else {
    checks.push({ id: 'paragraphLength', label: 'Paragraph length', status: 'na', message: 'Not enough content' });
  }

  // Calculate score (exclude 'na')
  const scoredChecks = checks.filter((c) => c.status !== 'na');
  let totalPoints = 0;
  scoredChecks.forEach((c) => {
    if (c.status === 'good') totalPoints += 100;
    else if (c.status === 'ok') totalPoints += 50;
  });

  const score = scoredChecks.length > 0
    ? Math.round(totalPoints / scoredChecks.length)
    : 0;

  let status: 'good' | 'ok' | 'poor' = 'poor';
  if (score >= 80) status = 'good';
  else if (score >= 50) status = 'ok';

  return { score, status, checks };
}