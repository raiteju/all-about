const User = require('../models/User');

// Follow/Unfollow a user
const toggleFollow = async (req, res) => {
  try {
    const { authorId } = req.params;
    const currentUserId = req.user._id;

    if (authorId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    const isFollowing = currentUser.following.includes(authorId);

    if (isFollowing) {
      // Unfollow: remove author from current user's following, and current user from author's followers
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: authorId } });
      await User.findByIdAndUpdate(authorId, { $pull: { followers: currentUserId } });
      return res.json({ 
        message: 'Unfollowed successfully',
        isFollowing: false,
        followersCount: author.followers.length - 1
      });
    } else {
      // Follow: add author to current user's following, and current user to author's followers
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: authorId } });
      await User.findByIdAndUpdate(authorId, { $addToSet: { followers: currentUserId } });
      return res.json({ 
        message: 'Followed successfully',
        isFollowing: true,
        followersCount: author.followers.length + 1
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to toggle follow' });
  }
};

// Get follower count and follow status for a user
const getFollowStatus = async (req, res) => {
  try {
    const { authorId } = req.params;
    const author = await User.findById(authorId).select('followers');
    if (!author) {
      return res.status(404).json({ message: 'User not found' });
    }

    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user._id).select('following');
      isFollowing = currentUser.following.includes(authorId);
    }

    res.json({
      followersCount: author.followers.length,
      isFollowing,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get follow status' });
  }
};

module.exports = { toggleFollow, getFollowStatus };