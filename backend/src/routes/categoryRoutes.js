const express = require('express');
const router = express.Router();
const {
  getTopCategories,
  getAllCategories,
  getPostsByCategory,  // 👈 NEW
} = require('../controllers/categoryController');

// ============================================
// PUBLIC ROUTES
// ============================================

// Get top N categories (sorted by post count)
// Usage: /api/categories/top?limit=5
router.get('/top', getTopCategories);

// Get all categories with post counts
router.get('/', getAllCategories);

// Get posts by category slug (paginated)
// Usage: /api/categories/:slug/posts?page=1&limit=12
router.get('/:slug/posts', getPostsByCategory);  // 👈 NEW

module.exports = router;