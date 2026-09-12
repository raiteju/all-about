const Page = require('../models/Page');
const { sanitizeContent, sanitizeText } = require('../utils/sanitize');

// GET ALL PAGES (Admin)
const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName username');
    res.json(pages);
  } catch (error) {
    console.error('Get all pages error:', error);
    res.status(500).json({ message: 'Failed to fetch pages' });
  }
};

// GET PUBLISHED PAGES (Public)
const getPublishedPages = async (req, res) => {
  try {
    const pages = await Page.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .select('title slug excerpt featuredImage showInFooter createdAt');
    res.json(pages);
  } catch (error) {
    console.error('Get published pages error:', error);
    res.status(500).json({ message: 'Failed to fetch pages' });
  }
};

// GET SINGLE PAGE BY SLUG (Public)
const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('createdBy', 'firstName lastName username');

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({ message: 'Failed to fetch page' });
  }
};

// GET SINGLE PAGE BY ID (Admin)
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('createdBy', 'firstName lastName username');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    console.error('Get page by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch page' });
  }
};

// CREATE PAGE (Admin) — 👇 WITH SANITIZATION
const createPage = async (req, res) => {
  try {
    const { 
      title, 
      slug, 
      content, 
      excerpt, 
      featuredImage, 
      seoMeta, 
      status, 
      showInFooter 
    } = req.body;

    const cleanTitle = sanitizeText(title);
    const cleanContent = sanitizeContent(content);
    const cleanExcerpt = sanitizeText(excerpt || '');

    // Auto-generate slug if not provided
    let finalSlug = slug
      ? sanitizeText(slug)
      : cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

    const existing = await Page.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ message: 'A page with this slug already exists' });
    }

    const page = await Page.create({
      title: cleanTitle,
      slug: finalSlug,
      content: cleanContent,
      excerpt: cleanExcerpt,
      featuredImage: featuredImage || '',
      seoMeta: {
        title: seoMeta?.title ? sanitizeText(seoMeta.title) : '',
        description: seoMeta?.description ? sanitizeText(seoMeta.description) : '',
        keywords: seoMeta?.keywords ? sanitizeText(seoMeta.keywords) : '',
      },
      status: status || 'published',
      showInFooter: showInFooter || false,
      createdBy: req.user._id,
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ message: 'Failed to create page' });
  }
};

// UPDATE PAGE (Admin) — 👇 WITH SANITIZATION
const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Build sanitized update object
    const updates = {};

    if (req.body.title !== undefined) {
      updates.title = sanitizeText(req.body.title);
    }
    if (req.body.slug !== undefined) {
      updates.slug = sanitizeText(req.body.slug);
    }
    if (req.body.content !== undefined) {
      updates.content = sanitizeContent(req.body.content);
    }
    if (req.body.excerpt !== undefined) {
      updates.excerpt = sanitizeText(req.body.excerpt);
    }
    if (req.body.featuredImage !== undefined) {
      updates.featuredImage = req.body.featuredImage;
    }
    if (req.body.seoMeta !== undefined) {
      updates.seoMeta = {
        title: req.body.seoMeta.title ? sanitizeText(req.body.seoMeta.title) : '',
        description: req.body.seoMeta.description ? sanitizeText(req.body.seoMeta.description) : '',
        keywords: req.body.seoMeta.keywords ? sanitizeText(req.body.seoMeta.keywords) : '',
      };
    }
    if (req.body.status !== undefined) {
      updates.status = req.body.status;
    }
    if (req.body.showInFooter !== undefined) {
      updates.showInFooter = req.body.showInFooter;
    }

    // Check slug uniqueness
    if (updates.slug && updates.slug !== page.slug) {
      const existing = await Page.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'A page with this slug already exists' });
      }
    }

    Object.assign(page, updates);
    page.updatedAt = new Date();
    await page.save();

    res.json(page);
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ message: 'Failed to update page' });
  }
};

// DELETE PAGE (Admin)
const deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ message: 'Failed to delete page' });
  }
};

module.exports = {
  getAllPages,
  getPublishedPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  deletePage,
};