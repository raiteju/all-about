const Post = require('../models/Post');
const Category = require('../models/Category');

// ============================================
// GET TOP CATEGORIES (Public) - sorted by post count
// ============================================
const getTopCategories = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Aggregate posts grouped by category string
    const topCategories = await Post.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit },
    ]);

    if (topCategories.length === 0) {
      return res.json([]);
    }

    // Fetch matching Category metadata (slug, image) by name
    const names = topCategories.map((c) => c._id);
    const categoryMeta = await Category.find({ name: { $in: names } });

    // Merge count + metadata
    const result = topCategories.map((c) => {
      const meta = categoryMeta.find((m) => m.name === c._id);
      return {
        name: c._id,
        count: c.count,
        slug:
          meta?.slug ||
          c._id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: meta?.image || '',
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get top categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// ============================================
// GET ALL CATEGORIES (Public)
// ============================================
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // Add post count for each
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Post.countDocuments({
          category: cat.name,
          status: 'active',
        });
        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          count,
        };
      })
    );

    res.json(withCounts);
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};


// ============================================
// GET POSTS BY CATEGORY (Paginated)
// ============================================
const getPostsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Find category by slug
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Fetch posts with this category name
    const filter = { category: category.name, status: 'active' };

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName avatar username'),
      Post.countDocuments(filter),
    ]);

    res.json({
      category,
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      limit,
    });
  } catch (error) {
    console.error('Get posts by category error:', error);
    res.status(500).json({ message: 'Failed to fetch category posts' });
  }
};

module.exports = {
  getTopCategories,
  getAllCategories,
  getPostsByCategory,  // 👈 ADD THIS
};