const rateLimit = require('express-rate-limit');

// Detect environment
const isDev = process.env.NODE_ENV !== 'production';

// ============================================
// GLOBAL LIMITER — safety net
// DEV: 5000 requests/15min (won't bother you)
// PROD: 500 requests/15min (blocks abuse)
// ============================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 500,
  message: {
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip the global limiter entirely in dev
  skip: () => isDev,
});

// ============================================
// LOGIN — 5 attempts per 15 min (brute-force protection)
// Higher in dev so testing works
// ============================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 50 : 5, // 👈 generous in dev
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// REGISTER — 3 accounts per hour (spam prevention)
// ============================================
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 20 : 3,
  message: {
    message: 'Too many accounts created from this IP. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// FORGOT PASSWORD — 3 requests per hour
// ============================================
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 20 : 3,
  message: {
    message: 'Too many password reset requests. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// CONTACT FORM — 3 submissions per hour
// ============================================
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 20 : 3,
  message: {
    message: 'Too many contact submissions. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// NEWSLETTER SUBSCRIBE — 5 attempts per hour
// ============================================
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 20 : 5,
  message: {
    message: 'Too many subscription attempts. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  contactLimiter,
  newsletterLimiter,
};