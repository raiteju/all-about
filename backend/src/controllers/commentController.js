const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const CommentLike = require('../models/CommentLike');

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;

    const comment = await Comment.create({
      postId: req.params.id,
      author: req.user._id,
      content,
      parentId: parentId || null
    });

    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });

    // Determine who receives the notification
    let recipientId;

    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment) recipientId = parentComment.author;
    } else {
      const post = await Post.findById(req.params.id);
      if (post) recipientId = post.author;
    }

    if (recipientId && recipientId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        post: req.params.id,
        type: 'comment',
        message: 'replied to your comment',
      });
    }

    // Populate and return with a default likesCount = 0
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'firstName lastName avatar');

    res.status(201).json({ ...populatedComment.toObject(), likesCount: 0, isLiked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a Comment and Create Notification
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Check if user already liked this comment
    const existingLike = await CommentLike.findOne({ commentId, userId });

    if (existingLike) {
      // Unlike
      await CommentLike.findByIdAndDelete(existingLike._id);
      const count = await CommentLike.countDocuments({ commentId });
      return res.json({ likesCount: count, isLiked: false });
    } else {
      // Like
      await CommentLike.create({ commentId, userId });
      const count = await CommentLike.countDocuments({ commentId });

      // Create Notification for the comment's author
      const comment = await Comment.findById(commentId);
      if (comment && comment.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: comment.author,
          sender: userId,
          post: comment.postId,
          type: 'like',
          message: 'liked your comment',
        });
      }

      return res.json({ likesCount: count, isLiked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, createComment, likeComment };