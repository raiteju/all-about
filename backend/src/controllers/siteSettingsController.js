const SiteSettings = require('../models/SiteSettings');

// ============================================
// GET SITE SETTINGS (Public)
// ============================================
const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    // If no settings exist yet, create default settings
    if (!settings) {
      settings = await SiteSettings.create({
        headerLinks: [
          { label: 'Home', href: '/', order: 1 },
          { label: 'Categories', href: '/categories', order: 2 },
          { label: 'Explore', href: '/explore', order: 3 },
        ],
        footerLinks: [
          { label: 'About', href: '/about', order: 1 },
          { label: 'Category', href: '/category', order: 2 },
          { label: 'Support', href: '/support', order: 3 },
          { label: 'Contact', href: '/contact', order: 4 },
        ],
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com', order: 1 },
          { platform: 'twitter', url: 'https://twitter.com', order: 2 },
          { platform: 'linkedin', url: 'https://linkedin.com', order: 3 },
          { platform: 'instagram', url: 'https://instagram.com', order: 4 },
          { platform: 'youtube', url: 'https://youtube.com', order: 5 },
          { platform: 'tiktok', url: 'https://tiktok.com', order: 6 },
        ],
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({ message: 'Failed to fetch site settings' });
  }
};

// ============================================
// UPDATE SITE SETTINGS (Admin only)
// ============================================
// 👇 REFACTORED: Instead of maintaining a whitelist that breaks
// whenever we add new fields, we auto-accept any field defined
// in the schema and reject protected system fields.
// ============================================
const PROTECTED_FIELDS = ['_id', '__v', 'updatedBy', 'updatedAt'];

const updateSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = new SiteSettings();
    }

    // Get all valid paths (fields) defined in the Mongoose schema
    const validSchemaFields = Object.keys(SiteSettings.schema.paths);

    // Also allow nested/single-nested array fields (already in paths)
    // Iterate over each key in req.body and update if valid
    Object.keys(req.body).forEach((field) => {
      // Skip protected system fields
      if (PROTECTED_FIELDS.includes(field)) return;

      // Only update if the field exists in the schema (safety check)
      if (validSchemaFields.includes(field)) {
        settings[field] = req.body[field];
      } else {
        console.warn(`⚠️  Ignored unknown field: ${field}`);
      }
    });

    // Update metadata
    if (req.user && req.user._id) {
      settings.updatedBy = req.user._id;
    }
    settings.updatedAt = new Date();

    await settings.save();

    res.json({
      message: 'Site settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({ message: 'Failed to update site settings' });
  }
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};