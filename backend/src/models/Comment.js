const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  createdAt: { type: Date, default: Date.now },
});

// ============================================
// ⚡ PERFORMANCE INDEXES
// ============================================

// 1. Fetch comments for a post, sorted by newest first
CommentSchema.index({ postId: 1, createdAt: -1 });

// 2. Fetch nested replies (for threaded comments)
CommentSchema.index({ parentId: 1 });

// 3. Fetch all comments by a user (admin dashboard / moderation)
CommentSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);