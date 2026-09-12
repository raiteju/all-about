const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // ============================================
  // 👇 NEW: SEO FIELDS (Phase 1)
  // ============================================
  seoTitle: {
    type: String,
    default: '', // If empty, frontend uses category.name + " Articles"
  },
  seoDescription: {
    type: String,
    default: '', // If empty, frontend uses category.description
  },
  seoKeywords: {
    type: String,
    default: '', // If empty, frontend uses category.name
  },
  ogImage: {
    type: String,
    default: '', // If empty, frontend uses category.image
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Category', CategorySchema);