const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { cloudinary, upload } = require('../config/cloudinary');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../utils/email');

// Google OAuth client (verifies ID tokens from frontend)
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register User
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ firstName, lastName, username, email, password: hashedPassword });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // 👇 Safety: if user has no password (Google-only account), block email/password login
    if (user && !user.password) {
      return res.status(401).json({
        message:
          'This account was created with Google. Please use "Sign in with Google" instead.',
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// 👇 NEW: GOOGLE LOGIN
// Verifies Google ID token, finds or creates user, returns JWT
// ============================================
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // 1. Verify the Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error('Google token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Google account has no email' });
    }

    const { email, given_name, family_name, picture, sub: googleId } = payload;

    // 2. Check if user exists by googleId (returning Google user)
    let user = await User.findOne({ googleId });

    if (user) {
      // Existing Google user — log them in
      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    // 3. Check if user exists by email (email/password user signing in with Google for the first time)
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing email user
      user.googleId = googleId;
      // Fill avatar if user didn't have one
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();

      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    // 4. Brand new user — create account
    // Generate a unique username from email
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const newUser = await User.create({
      firstName: given_name || 'User',
      lastName: family_name || '',
      username,
      email,
      password: '', // Google users have no password
      googleId,
      avatar: picture || '',
      role: 'author',
    });

    res.status(201).json({
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
};

// Get Current User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User (Allow Social Links + GitHub)
const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.bio = req.body.bio || user.bio;
      user.website = req.body.website || user.website;
      
      if (req.body.socialLinks) {
        try {
          const parsedLinks = typeof req.body.socialLinks === 'string' 
            ? JSON.parse(req.body.socialLinks) 
            : req.body.socialLinks;
            
          user.socialLinks = { ...user.socialLinks, ...parsedLinks };
        } catch (e) {
          console.error('Failed to parse social links');
        }
      }
    }

    // Handle file uploads - Cloudinary provides full URLs
    if (req.files && req.files['profileImage']) {
      user.avatar = req.files['profileImage'][0].path; // Cloudinary URL
    }
    if (req.files && req.files['coverImage']) {
      user.coverImage = req.files['coverImage'][0].path; // Cloudinary URL
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      coverImage: updatedUser.coverImage,
      socialLinks: updatedUser.socialLinks,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Public Author Profile with Posts
const getPublicAuthorProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'Author not found' });

    const posts = await Post.find({ author: user._id, status: 'active' })
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName avatar username');

    const totalPosts = await Post.countDocuments({ author: user._id, status: 'active' });
    const articleCount = await Post.countDocuments({ author: user._id, status: 'active', type: 'article' });
    const videoCount = await Post.countDocuments({ author: user._id, status: 'active', type: 'video' });
    const audioCount = await Post.countDocuments({ author: user._id, status: 'active', type: 'audio' });
    const favoriteCount = await Post.countDocuments({ author: user._id, status: 'active', likes: { $gt: 0 } });

    res.json({ 
      author: user, 
      posts, 
      totalPosts,
      counts: { articles: articleCount, videos: videoCount, audios: audioCount, favorites: favoriteCount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Authors with Total Post Counts (For Homepage)
const getAllAuthors = async (req, res) => {
  try {
    const users = await User.find({ role: 'author' }).select('-password -email');

    const authorsWithCounts = await Promise.all(users.map(async (user) => {
      const totalPosts = await Post.countDocuments({ author: user._id, status: 'active' });
      const totalFollowers = user.followers ? user.followers.length : 0;
      
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar || '',
        coverImage: user.coverImage || '',
        postsCount: totalPosts,
        followersCount: totalFollowers
      };
    }));

    res.json(authorsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// FORGOT PASSWORD - WITH REAL EMAIL
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Delete any existing tokens for this email
    await PasswordReset.deleteMany({ email });

    // Save to database
    await PasswordReset.create({
      email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${email}`;

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetLink);

    if (!emailSent) {
      console.log(`🔐 Reset link (email failed): ${resetLink}`);
      return res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.'
      });
    }

    console.log(`📧 Password reset email sent to ${email}`);

    res.json({ 
      message: 'Password reset link sent to your email! Please check your inbox.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Hash the token to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset record
    const resetRecord = await PasswordReset.findOne({
      email,
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      used: false
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.updateOne({ email }, { password: hashedPassword });

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// ============================================
// Generate JWT Token
// ============================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================
// EXPORTS
// ============================================
module.exports = { 
  registerUser,
  loginUser,
  googleLogin,      // 👈 NEW
  getMe,
  updateMe,
  upload,
  getPublicAuthorProfile,
  getAllAuthors,
  forgotPassword,
  resetPassword
};