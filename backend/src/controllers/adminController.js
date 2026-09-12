const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const { sanitizeText } = require('../utils/sanitize');

// ============================================
// DASHBOARD STATS
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalCategories = await Category.countDocuments();

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'firstName lastName avatar username');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName username avatar email role createdAt');

    const articles = await Post.countDocuments({ type: 'article' });
    const videos = await Post.countDocuments({ type: 'video' });
    const audios = await Post.countDocuments({ type: 'audio' });

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalCategories,
        articles,
        videos,
        audios,
      },
      recentPosts,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['author', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EXPORT USERS AS CSV
const exportUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let filter = {};
    if (role === 'author') filter = { role: 'author' };
    else if (role === 'admin') filter = { role: 'admin' };

    const users = await User.find(filter).sort({ createdAt: -1 }).select('-password -__v');

    const headers = [
      'First Name', 'Last Name', 'Username', 'Email', 'Role', 'Bio', 'Website', 'Registered At',
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = users.map((u) => [
      escapeCSV(u.firstName),
      escapeCSV(u.lastName),
      escapeCSV(u.username),
      escapeCSV(u.email),
      escapeCSV(u.role),
      escapeCSV(u.bio || ''),
      escapeCSV(u.website || ''),
      escapeCSV(u.createdAt ? new Date(u.createdAt).toISOString() : ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const date = new Date().toISOString().split('T')[0];
    const filename = `users-${role || 'all'}-${date}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Failed to export users' });
  }
};

// ============================================
// POST MANAGEMENT
// ============================================
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'firstName lastName avatar username');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePostAsAdmin = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CATEGORY MANAGEMENT — 👇 WITH SANITIZATION
// ============================================
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName username');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image, seoTitle, seoDescription, seoKeywords, ogImage } = req.body;

    const cleanName = sanitizeText(name);
    const cleanDescription = sanitizeText(description || '');
    const cleanSeoTitle = sanitizeText(seoTitle || '');
    const cleanSeoDescription = sanitizeText(seoDescription || '');
    const cleanSeoKeywords = sanitizeText(seoKeywords || '');

    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: cleanName,
      slug,
      description: cleanDescription,
      image,
      seoTitle: cleanSeoTitle,
      seoDescription: cleanSeoDescription,
      seoKeywords: cleanSeoKeywords,
      ogImage: ogImage || '',
      createdBy: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, image, seoTitle, seoDescription, seoKeywords, ogImage } = req.body;

    const cleanName = sanitizeText(name);
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        name: cleanName,
        slug,
        description: sanitizeText(description || ''),
        image,
        seoTitle: sanitizeText(seoTitle || ''),
        seoDescription: sanitizeText(seoDescription || ''),
        seoKeywords: sanitizeText(seoKeywords || ''),
        ogImage: ogImage || '',
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD CATEGORY IMAGE
const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Upload category image error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};

// UPLOAD GENERAL ADMIN IMAGE
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};

// ============================================
// COMMENT MANAGEMENT
// ============================================
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName avatar username')
      .populate('postId', 'title slug');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  exportUsers,
  getAllPosts,
  deletePostAsAdmin,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  uploadImage,
  getComments,
  deleteComment,
};