const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    default: '',
  },
  featuredImage: {
    type: String,
    default: '',
  },
  seoMeta: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published',
  },
  showInFooter: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Page', PageSchema);