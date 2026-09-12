const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  exportSubscribers,
} = require('../controllers/newsletterController');
const { newsletterLimiter } = require('../middleware/rateLimiter');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// ============================================
// PUBLIC (RATE-LIMITED)
// ============================================
router.post('/subscribe', newsletterLimiter, subscribe);
router.post('/unsubscribe', unsubscribe);

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/subscribers', protect, isAdmin, getAllSubscribers);
router.delete('/subscribers/:id', protect, isAdmin, deleteSubscriber);
router.get('/subscribers/export', protect, isAdmin, exportSubscribers);

module.exports = router;