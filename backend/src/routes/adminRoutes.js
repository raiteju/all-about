const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  exportUsers, // 👈 NEW
  getAllPosts,
  deletePostAsAdmin,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage, // 👈 NEW
  uploadImage, // 👈 NEW
  getComments,
  deleteComment,
} = require('../controllers/adminController');
const { upload } = require('../config/cloudinary'); // 👈 NEW

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// All admin routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.get('/users/export', exportUsers); // 👈 NEW (must be before /:userId)
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Posts
router.get('/posts', getAllPosts);
router.delete('/posts/:postId', deletePostAsAdmin);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);

// General admin image upload (for hero/CTA/OG images)
router.post('/upload-image', upload.single('image'), uploadImage);

// 👇 NEW: Category Image Upload (must be BEFORE /:categoryId routes to avoid conflict)
router.post(
  '/categories/upload-image',
  upload.single('image'),
  uploadCategoryImage
);

router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

// Comments
router.get('/comments', getComments);
router.delete('/comments/:commentId', deleteComment);

module.exports = router;