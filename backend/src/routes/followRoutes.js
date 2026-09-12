const express = require('express');
const router = express.Router();
const { toggleFollow, getFollowStatus } = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

// Protected route - follow/unfollow
router.post('/:authorId', protect, toggleFollow);

// Public route - get follow status (but if user is logged in, returns isFollowing)
router.get('/:authorId/status', protect, getFollowStatus); // or make it optional with protect optional

// To allow public access without login for count, we can have a public route:
router.get('/:authorId/count', async (req, res) => {
  try {
    const author = await User.findById(req.params.authorId).select('followers');
    if (!author) return res.status(404).json({ message: 'User not found' });
    res.json({ followersCount: author.followers.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get follower count' });
  }
});

module.exports = router;