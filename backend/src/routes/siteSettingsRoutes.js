const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSiteSettings,
  updateSiteSettings,
} = require('../controllers/siteSettingsController');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// ============================================
// PUBLIC ROUTE - Get site settings
// ============================================
router.get('/', getSiteSettings);

// ============================================
// ADMIN ROUTE - Update site settings
// ============================================
router.put('/', protect, isAdmin, updateSiteSettings);

module.exports = router;