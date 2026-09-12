const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['article', 'audio', 'video'],
    default: 'article',
  },
  excerpt: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [String],
  featuredImage: {
    type: String,
    default: '',
  },
  audioUrl: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'draft', 'private'],
    default: 'active',
  },
  likes: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },

  // SEO FIELDS
  focusKeyword: {
    type: String,
    default: '',
  },
  seoTitle: {
    type: String,
    default: '',
  },
  seoDescription: {
    type: String,
    default: '',
  },
  seoKeywords: {
    type: String,
    default: '',
  },
  ogImage: {
    type: String,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ============================================
// ⚡ PERFORMANCE INDEXES
// ============================================

// 1. Homepage & explore all: filter by status, sort by date
PostSchema.index({ status: 1, createdAt: -1 });

// 2. Explore by type: filter by status + type, sort by date
PostSchema.index({ status: 1, type: 1, createdAt: -1 });

// 3. Category page: filter by category + status, sort by date
PostSchema.index({ category: 1, status: 1, createdAt: -1 });

// 4. Author page: filter by author + status, sort by date
PostSchema.index({ author: 1, status: 1, createdAt: -1 });

// 5. Tag page: filter by tags (multikey) + status, sort by date
PostSchema.index({ tags: 1, status: 1, createdAt: -1 });

// Note: `slug` is already indexed via `unique: true` above.

module.exports = mongoose.model('Post', PostSchema);