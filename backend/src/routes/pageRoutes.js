const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllPages,
  getPublishedPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} = require('../controllers/pageController');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/published', getPublishedPages);
router.get('/slug/:slug', getPageBySlug);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================
router.get('/', protect, isAdmin, getAllPages);
router.get('/:id', protect, isAdmin, getPageById);
router.post('/', protect, isAdmin, createPage);
router.put('/:id', protect, isAdmin, updatePage);
router.delete('/:id', protect, isAdmin, deletePage);

module.exports = router;