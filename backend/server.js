const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const followRoutes = require('./src/routes/followRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const siteSettingsRoutes = require('./src/routes/siteSettingsRoutes');
const pageRoutes = require('./src/routes/pageRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const newsletterRoutes = require('./src/routes/newsletterRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const { globalLimiter } = require('./src/middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// ============================================
// 🔒 SECURITY: Helmet (HTTP security headers)
// ============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// ============================================
// 🌐 CORS: Whitelist allowed origins
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`🚫 CORS blocked request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ============================================
// ⚡ COMPRESSION
// ============================================
app.use(compression());

// ============================================
// 📦 BODY PARSERS
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// 🛡️  GLOBAL RATE LIMITER (safety net)
// ============================================
app.use('/api', globalLimiter);

// ============================================
// 🛣️  ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// ============================================
// 💚 HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ============================================
// 🚨 GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Please choose a smaller file (max 10MB recommended).',
      });
    }
    return res.status(400).json({ message: err.message });
  }

  if (
    err.message &&
    (err.message.toLowerCase().includes('file size too large') ||
      err.message.toLowerCase().includes('maximum is'))
  ) {
    return res.status(400).json({
      message: 'File too large. Please choose an image under 10MB.',
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'Request blocked by CORS policy. Origin not allowed.',
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

// ============================================
// 🚀 START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});