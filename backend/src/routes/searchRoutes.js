const express = require('express');
const router = express.Router();
const { 
  globalSearch, 
  searchSuggestions,
  getSearchStats 
} = require('../controllers/searchController');

// ============================================
// PUBLIC SEARCH ROUTES
// ============================================

// Global search with filters
router.get('/global', globalSearch);

// Search suggestions (autocomplete)
router.get('/suggestions', searchSuggestions);

// Search statistics
router.get('/stats', getSearchStats);

module.exports = router;