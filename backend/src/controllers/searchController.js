const Post = require('../models/Post');
const User = require('../models/User');

// ============================================
// GLOBAL SEARCH - Advanced Search with Filters
// ============================================
const globalSearch = async (req, res) => {
  try {
    const { 
      q, 
      type, 
      category, 
      author, 
      sort = 'relevance',
      limit = 20, 
      page = 1 
    } = req.query;
    
    // Validate search term
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        message: 'Search term must be at least 2 characters' 
      });
    }

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(q, 'i');

    // Build search query
    let searchQuery = {
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
        { summary: searchRegex }
      ],
      status: 'active'
    };

    // Apply filters
    if (type && type !== 'all') {
      searchQuery.type = type;
    }

    if (category) {
      searchQuery.categories = { $in: [category] };
    }

    if (author) {
      // Find author by username first
      const authorUser = await User.findOne({ 
        username: author,
        role: 'author'
      });
      if (authorUser) {
        searchQuery.author = authorUser._id;
      }
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'relevance':
        // For relevance, we need to weight matches
        // For now, just use text score
        sortOptions = { score: { $meta: 'textScore' } };
        break;
      case 'latest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { viewsCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Get posts with search
    const posts = await Post.find(searchQuery)
      .populate('author', 'firstName lastName username avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Post.countDocuments(searchQuery);

    // Get related authors (who match search term)
    const authorSearchRegex = new RegExp(q, 'i');
    const authors = await User.find({
      $or: [
        { firstName: authorSearchRegex },
        { lastName: authorSearchRegex },
        { username: authorSearchRegex },
        { bio: authorSearchRegex }
      ],
      role: 'author'
    }).select('firstName lastName username avatar bio');

    // Get matching categories from posts
    const categories = await Post.distinct('categories', {
      categories: searchRegex,
      status: 'active'
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.json({
      posts,
      authors: authors.slice(0, 5),
      categories: categories.slice(0, 10),
      total,
      page: parseInt(page),
      totalPages,
      limit: parseInt(limit),
      searchTerm: q,
      appliedFilters: {
        type: type || 'all',
        category: category || null,
        author: author || null,
        sort: sort || 'relevance'
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Search failed',
      error: error.message 
    });
  }
};

// ============================================
// SEARCH SUGGESTIONS (Autocomplete)
// ============================================
const searchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchRegex = new RegExp(q, 'i');

    // Get matching post titles
    const posts = await Post.find({
      title: searchRegex,
      status: 'active'
    })
    .limit(5)
    .select('title slug featuredImage');

    // Get matching authors
    const authors = await User.find({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ],
      role: 'author'
    })
    .limit(3)
    .select('username firstName lastName avatar');

    // Get matching categories
    const categories = await Post.distinct('categories', {
      categories: searchRegex,
      status: 'active'
    });

    // Get matching tags
    const tags = await Post.distinct('tags', {
      tags: searchRegex,
      status: 'active'
    });

    // Combine suggestions with categories and labels
    const suggestions = [
      ...posts.map(p => ({ 
        type: 'post', 
        label: p.title, 
        slug: p.slug,
        image: p.featuredImage 
      })),
      ...authors.map(a => ({ 
        type: 'author', 
        label: `${a.firstName} ${a.lastName}`,
        username: a.username,
        avatar: a.avatar 
      })),
      ...categories.map(c => ({ 
        type: 'category', 
        label: c 
      })),
      ...tags.map(t => ({ 
        type: 'tag', 
        label: t 
      }))
    ];

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestion error:', error);
    res.json({ suggestions: [] });
  }
};

// ============================================
// GET SEARCH STATISTICS
// ============================================
const getSearchStats = async (req, res) => {
  try {
    // Get total counts for search categories
    const totalPosts = await Post.countDocuments({ status: 'active' });
    const totalAuthors = await User.countDocuments({ role: 'author' });
    
    // Get popular categories
    const popularCategories = await Post.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalPosts,
      totalAuthors,
      popularCategories: popularCategories.map(c => ({
        name: c._id,
        count: c.count
      }))
    });

  } catch (error) {
    console.error('Search stats error:', error);
    res.status(500).json({ message: 'Failed to get search stats' });
  }
};

module.exports = { 
  globalSearch, 
  searchSuggestions,
  getSearchStats
};