const sanitizeHtml = require('sanitize-html');

// ============================================
// SANITIZE POST/CMS CONTENT (allow safe HTML only)
// Used for: post content (Quill), page content (Quill)
// ============================================
const sanitizeContent = (html) => {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'blockquote', 'pre', 'code',
      'ul', 'ol', 'li',
      'a', 'img',
      'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['class', 'style'], // allow inline classes/styles (Quill uses these)
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    // Force external links to be safe
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
      }),
    },
    // Quill uses these styles — preserve safe ones
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
      },
    },
  });
};

// ============================================
// SANITIZE PLAIN TEXT (strip ALL HTML)
// Used for: titles, excerpts, bios, descriptions, meta fields
// ============================================
const sanitizeText = (text) => {
  if (!text) return '';
  return sanitizeHtml(String(text), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

module.exports = { sanitizeContent, sanitizeText };