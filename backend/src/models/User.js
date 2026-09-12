const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // ============================================
  // 👇 CHANGED: password is now optional
  // Google OAuth users don't have a password
  // Email/password users still work the same
  // ============================================
  password: {
    type: String,
    required: false,
    default: '',
  },
  role: {
    type: String,
    enum: ['author', 'admin'],
    default: 'author',
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    github: { type: String, default: '' },
  },
  // ============================================
  // 👇 NEW: Google OAuth support
  // ============================================
  googleId: {
    type: String,
    default: null,
  },
  // FOLLOW SYSTEM
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ============================================
// ⚡ PERFORMANCE INDEXES
// ============================================

// 1. Get all authors for homepage (filter by role, sort by date)
UserSchema.index({ role: 1, createdAt: -1 });

// 2. Google ID lookup (sparse = only indexes non-null values)
UserSchema.index(
  { googleId: 1 },
  { unique: true, sparse: true }
);

// Note: `email` and `username` are already indexed via `unique: true` above.

module.exports = mongoose.model('User', UserSchema);