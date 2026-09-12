const express = require('express');
const { 
  createPost, 
  getPosts, 
  getPostsByAuthor, 
  getPostsByType, 
  getExplorePosts,
  getAllTags,      // 👈 NEW
  getPostsByTag,   // 👈 NEW
  getMyPosts, 
  getPostBySlug, 
  getPostById, 
  toggleLike, 
  updatePost, 
  updatePostStatus, 
  deletePost, 
  getMyNotifications, 
  uploadFeaturedImage, 
  uploadAudio, 
  uploadVideo, 
  markNotificationAsRead, 
  getAuthorDashboard 
} = require('../controllers/postController');
const { getComments, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.route('/').get(getPosts);
router.route('/slug/:slug').get(getPostBySlug);
router.route('/author/:authorId').get(getPostsByAuthor);
router.route('/type/:type').get(getPostsByType);
router.route('/explore/:type').get(getExplorePosts);

// 👇 NEW: Tag routes (must come BEFORE /:id to avoid conflict)
router.route('/tags').get(getAllTags);
router.route('/tag/:slug').get(getPostsByTag);

router.route('/dashboard/:authorId').get(getAuthorDashboard);
router.route('/notifications/my').get(protect, getMyNotifications);
router.route('/notifications/read/:id').put(protect, markNotificationAsRead);

// Comment Routes
router.route('/:id/comments').get(getComments).post(protect, createComment);

// Like Route
router.route('/:id/like').post(protect, toggleLike);

// Single Post by ID (For Edit)
router.route('/id/:id').get(getPostById);

// Upload Featured Image (Protected)
router.route('/upload/featured-image').post(protect, upload.single('featuredImage'), uploadFeaturedImage);
router.route('/upload/audio').post(protect, upload.single('audio'), uploadAudio);
router.route('/upload/video').post(protect, upload.single('video'), uploadVideo);

// Status Update (Protected)
router.route('/:id/status').put(protect, updatePostStatus);

// Protected routes
router.route('/').post(protect, createPost);
router.route('/my').get(protect, getMyPosts);
router.route('/:id').put(protect, updatePost).delete(protect, deletePost);

module.exports = router;