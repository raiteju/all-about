const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateMe, 
  upload, 
  getPublicAuthorProfile, 
  getAllAuthors,
  forgotPassword,
  resetPassword,
  googleLogin // <-- ADDED: Import googleLogin from controller
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} = require('../middleware/rateLimiter');

const router = express.Router();

// ========== RATE-LIMITED AUTH ROUTES ==========
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// ========== GOOGLE OAUTH ROUTE ==========
router.post('/google-login', googleLogin); // <-- ADDED: New Google login route

// ========== PROTECTED ROUTES ==========
router.get('/me', protect, getMe);
router.put('/me', protect, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), updateMe);

// ========== PUBLIC AUTHOR ROUTES ==========
router.get('/profile/:username', getPublicAuthorProfile);
router.get('/all', getAllAuthors);

module.exports = router;