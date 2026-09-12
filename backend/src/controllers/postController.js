const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { cloudinary, upload } = require('../config/cloudinary');
const { sanitizeContent, sanitizeText } = require('../utils/sanitize');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, type, excerpt, content, category, tags, featuredImage, audioUrl, videoUrl } = req.body;

    // 👇 SANITIZE INPUTS
    const cleanTitle = sanitizeText(title);
    const cleanExcerpt = sanitizeText(excerpt);
    const cleanContent = sanitizeContent(content);
    const cleanCategory = sanitizeText(category);
    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => sanitizeText(t)).filter(Boolean)
      : [];

    const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const post = await Post.create({
      title: cleanTitle,
      slug,
      type,
      excerpt: cleanExcerpt,
      content: cleanContent,
      category: cleanCategory,
      tags: cleanTags,
      featuredImage,
      audioUrl,
      videoUrl,
      author: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Featured Image
const uploadFeaturedImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Audio
const uploadAudio = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'video' });
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Video
const uploadVideo = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'video' });
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all posts (ONLY ACTIVE)
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'active' }).sort({ createdAt: -1 }).populate('author', 'firstName lastName avatar username');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by type
const getPostsByType = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'active', type: req.params.type })
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName avatar username');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EXPLORE POSTS (Paginated by type)
const getExplorePosts = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const typeMap = {
      articles: 'article',
      article: 'article',
      audio: 'audio',
      audios: 'audio',
      video: 'video',
      videos: 'video',
    };

    const dbType = typeMap[type.toLowerCase()];
    if (!dbType) {
      return res
        .status(400)
        .json({ message: 'Invalid type. Use: articles, audio, or video' });
    }

    const filter = { status: 'active', type: dbType };

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName avatar username'),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      type: dbType,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL TAGS (Public, aggregated from posts)
const getAllTags = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;

    const pipeline = [
      { $match: { status: 'active' } },
      { $unwind: '$tags' },
      { $match: { tags: { $nin: [null, ''] } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ];

    if (limit > 0) pipeline.push({ $limit: limit });

    const raw = await Post.aggregate(pipeline);

    const tags = raw.map((t) => ({
      name: t._id,
      slug: t._id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      count: t.count,
    }));

    res.json(tags);
  } catch (error) {
    console.error('Get all tags error:', error);
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

// GET POSTS BY TAG (Public, paginated)
const getPostsByTag = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const allTags = await Post.distinct('tags', { status: 'active' });

    const matchingTag = allTags.find(
      (tag) =>
        tag &&
        tag
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') === slug.toLowerCase()
    );

    if (!matchingTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    const filter = { tags: matchingTag, status: 'active' };

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName avatar username'),
      Post.countDocuments(filter),
    ]);

    res.json({
      tag: matchingTag,
      slug,
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      limit,
    });
  } catch (error) {
    console.error('Get posts by tag error:', error);
    res.status(500).json({ message: 'Failed to fetch tag posts' });
  }
};

// Get posts by author
const getPostsByAuthor = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.authorId, status: 'active' }).sort({ createdAt: -1 }).populate('author', 'firstName lastName avatar username');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my posts with Pagination AND GLOBAL COUNTS
const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName avatar username');

    const totalPosts = await Post.countDocuments({ author: req.user._id });
    const articleCount = await Post.countDocuments({ author: req.user._id, type: 'article' });
    const audioCount = await Post.countDocuments({ author: req.user._id, type: 'audio' });
    const videoCount = await Post.countDocuments({ author: req.user._id, type: 'video' });
    const favoriteCount = await Post.countDocuments({ author: req.user._id, likes: { $gt: 0 } });

    res.json({ 
      posts, 
      currentPage: page, 
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      counts: { articles: articleCount, audios: audioCount, videos: videoCount, favorites: favoriteCount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DYNAMIC AUTHOR PROFILE
const getAuthorDashboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    const type = req.query.type || 'articles';
    let filterType;
    if (type === 'articles') filterType = 'article';
    else if (type === 'audios') filterType = 'audio';
    else if (type === 'videos') filterType = 'video';
    
    const filter = { author: req.params.authorId, status: 'active' };
    if (filterType) filter.type = filterType;

    const [posts, totalPosts, articleCount, videoCount, audioCount] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', 'firstName lastName avatar username'),
      Post.countDocuments(filter),
      Post.countDocuments({ author: req.params.authorId, status: 'active', type: 'article' }),
      Post.countDocuments({ author: req.params.authorId, status: 'active', type: 'video' }),
      Post.countDocuments({ author: req.params.authorId, status: 'active', type: 'audio' }),
    ]);

    const favoriteCount = await Post.countDocuments({ author: req.params.authorId, status: 'active', likes: { $gt: 0 } });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      counts: { articles: articleCount, videos: videoCount, audios: audioCount, favorites: favoriteCount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post by slug
const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'active' }).populate('author', 'firstName lastName avatar username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'firstName lastName avatar username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.likes = post.likes + 1;
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        post: post._id,
        type: 'like',
        message: 'liked your post',
      });
    }

    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update post — 👇 NOW WITH SANITIZATION
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this post' });
    }

    // 👇 SANITIZE any content/title/excerpt/category/tags in the update
    const updateData = { ...req.body };

    if (updateData.content !== undefined) {
      updateData.content = sanitizeContent(updateData.content);
    }
    if (updateData.title !== undefined) {
      updateData.title = sanitizeText(updateData.title);
      // Also regenerate slug when title changes
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (updateData.excerpt !== undefined) {
      updateData.excerpt = sanitizeText(updateData.excerpt);
    }
    if (updateData.category !== undefined) {
      updateData.category = sanitizeText(updateData.category);
    }
    if (updateData.tags !== undefined && Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.map((t) => sanitizeText(t)).filter(Boolean);
    }
    // SEO fields
    if (updateData.seoTitle !== undefined) {
      updateData.seoTitle = sanitizeText(updateData.seoTitle);
    }
    if (updateData.seoDescription !== undefined) {
      updateData.seoDescription = sanitizeText(updateData.seoDescription);
    }
    if (updateData.seoKeywords !== undefined) {
      updateData.seoKeywords = sanitizeText(updateData.seoKeywords);
    }
    if (updateData.focusKeyword !== undefined) {
      updateData.focusKeyword = sanitizeText(updateData.focusKeyword);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('author', 'firstName lastName avatar username');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Post Status
const updatePostStatus = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized to update this post' });

    post.status = req.body.status;
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized to delete this post' });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id, isRead: false })
      .populate('sender', 'firstName lastName avatar')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK NOTIFICATION AS READ
const markNotificationAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createPost, 
  getPosts, 
  getPostsByAuthor, 
  getPostsByType, 
  getExplorePosts,
  getAllTags,
  getPostsByTag,
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
};