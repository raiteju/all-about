const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  submitContact,
  getAllSubmissions,
  getSubmissionStats,
  getSubmissionById,
  updateSubmissionStatus,
  updateAdminNotes,
  deleteSubmission,
  exportSubmissions,
} = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');

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
router.post('/', contactLimiter, submitContact);

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/stats', protect, isAdmin, getSubmissionStats);
router.get('/export', protect, isAdmin, exportSubmissions);
router.get('/', protect, isAdmin, getAllSubmissions);
router.get('/:id', protect, isAdmin, getSubmissionById);
router.put('/:id/status', protect, isAdmin, updateSubmissionStatus);
router.put('/:id/notes', protect, isAdmin, updateAdminNotes);
router.delete('/:id', protect, isAdmin, deleteSubmission);

module.exports = router;