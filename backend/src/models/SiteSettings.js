const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  // ============================================
  // HEADER SETTINGS
  // ============================================
  siteName: {
    type: String,
    default: 'AllAbout',
  },
  logo: {
    type: String,
    default: '/logo.svg',
  },
  headerLinks: [
    {
      label: { type: String, required: true },
      href: { type: String, required: true },
      order: { type: Number, default: 0 },
    },
  ],

  // ============================================
  // FOOTER SETTINGS
  // ============================================
  footerAbout: {
    type: String,
    default: "All about is the world's leading community for creatives to share, grow, and get hired.",
  },
  footerCopyright: {
    type: String,
    default: '©2023 - 2026. All rights reserved.',
  },
  footerAuthorName: {
    type: String,
    default: 'Teju Rai',
  },
  footerLinks: [
    {
      label: { type: String, required: true },
      href: { type: String, required: true },
      order: { type: Number, default: 0 },
    },
  ],
  socialLinks: [
    {
      platform: { type: String, required: true },
      url: { type: String, required: true },
      order: { type: Number, default: 0 },
    },
  ],

  // ============================================
  // HERO / HOMEPAGE SETTINGS
  // ============================================
  heroTitle: {
    type: String,
    default: 'Millions of people around the world showcase their thoughts',
  },
  heroSubtitle: {
    type: String,
    default: "All about bloggers - the home to the world's best bloggers and creative professionals.",
  },
  heroCtaText: {
    type: String,
    default: 'Register Here',
  },
  heroCtaLink: {
    type: String,
    default: '/register',
  },
  heroImage: {
    type: String,
    default: '',
  },
  heroSearchPlaceholder: {
    type: String,
    default: 'Search',
  },

  // ============================================
  // CTA / BLOGGER SECTION
  // ============================================
  ctaTitle: {
    type: String,
    default: 'Become a Blogger!',
  },
  ctaDescription: {
    type: String,
    default: 'Speedy say has suitable disposal add boy. On forth doubt miles of child. Exercise joy man children rejoiced. Yet uncommonly his ten who diminution astonished.',
  },
  ctaButtonText: {
    type: String,
    default: 'Register Here',
  },
  ctaButtonLink: {
    type: String,
    default: '/register',
  },
  ctaImage: {
    type: String,
    default: '',
  },

  // ============================================
  // HOMEPAGE SECTION TITLES
  // ============================================
  editorsPickTitle: {
    type: String,
    default: "Editor's pick",
  },
  editorsPickSubtitle: {
    type: String,
    default: 'Millions of people around the world showcase their thoughts on all about bloggers - the home to the world\'s best bloggers and creative professionals.',
  },
  trendingNowTitle: {
    type: String,
    default: 'Trending Now',
  },
  trendingNowSubtitle: {
    type: String,
    default: 'Discover the most outstanding articles in all topics of life.',
  },
  latestAudioTitle: {
    type: String,
    default: 'Latest Audio',
  },
  latestAudioSubtitle: {
    type: String,
    default: 'Click on the icon to enjoy the music or podcast.',
  },
  latestVideoTitle: {
    type: String,
    default: 'Latest Video',
  },
  latestVideoSubtitle: {
    type: String,
    default: 'Discover the most outstanding videos in all topics of life.',
  },

  // ============================================
  // NEWSLETTER SETTINGS
  // ============================================
  newsletterTitle: {
    type: String,
    default: 'Subscribe to our Newsletter',
  },
  newsletterDescription: {
    type: String,
    default: "Don't miss any updates on allabout...",
  },

  // ============================================
  // CONTACT SETTINGS
  // ============================================
  contactEmail: {
    type: String,
    default: '',
    lowercase: true,
    trim: true,
  },
  contactPhone: {
    type: String,
    default: '',
  },
  contactAddress: {
    type: String,
    default: '',
  },

  // ============================================
  // AUTO-REPLY SETTINGS (WordPress-style)
  // ============================================
  contactAutoReplyEnabled: {
    type: Boolean,
    default: true,
  },
  contactAutoReplyFormat: {
    type: String,
    enum: ['plain', 'html'],
    default: 'plain',
  },
  contactAutoReplySubject: {
    type: String,
    default: 'We received your message - {{siteName}} (#{{reference}})',
  },
  contactAutoReplyBodyPlain: {
    type: String,
    default: `Hi {{name}},

Thank you for contacting us! We've received your message and will get back to you within 24-48 hours.

Your Reference Number: #{{reference}}

--- Your Message ---
Subject: {{subject}}
{{message}}
--- End ---

If you have any additional information, feel free to reply to this email.

Best regards,
The {{siteName}} Team
{{siteUrl}}`,
  },
  contactAutoReplyBodyHtml: {
    type: String,
    default: `<p>Hi <strong>{{name}}</strong>,</p>

<p>Thank you for contacting us! We've received your message and will get back to you within <strong>24-48 hours</strong>.</p>

<p><strong>Your Reference Number:</strong> #{{reference}}</p>

<p><strong>Your message:</strong></p>
<blockquote style="border-left: 4px solid #00a8e8; padding-left: 16px; margin: 16px 0; color: #6b7280;">
  <strong>Subject:</strong> {{subject}}<br/>
  {{message}}
</blockquote>

<p>If you have any additional information, feel free to reply to this email.</p>

<p>Best regards,<br/><strong>The {{siteName}} Team</strong></p>`,
  },

  // ============================================
  // GLOBAL SEO DEFAULTS
  // ============================================
  defaultSeoTitle: {
    type: String,
    default: 'AllAbout - Blog & Guest Post Platform',
  },
  defaultSeoDescription: {
    type: String,
    default: 'Discover outstanding articles in all topics of life.',
  },
  defaultSeoKeywords: {
    type: String,
    default: 'blog, articles, audio, video, guest post',
  },
  defaultOgImage: {
    type: String,
    default: '',
  },
  defaultTwitterHandle: {
    type: String,
    default: '',
  },

  // ============================================
  // HOMEPAGE SEO
  // ============================================
  homeSeoTitle: {
    type: String,
    default: 'AllAbout - Blog & Guest Post Platform',
  },
  homeSeoDescription: {
    type: String,
    default: 'Discover outstanding articles in all topics of life.',
  },
  homeSeoKeywords: {
    type: String,
    default: 'blog, articles, audio, video, guest post',
  },
  homeOgImage: {
    type: String,
    default: '',
  },

  // ============================================
  // CATEGORIES LANDING SEO
  // ============================================
  categoriesSeoTitle: {
    type: String,
    default: 'All Categories - AllAbout',
  },
  categoriesSeoDescription: {
    type: String,
    default: 'Explore content by topic. Browse all categories and discover posts that match your interests.',
  },
  categoriesSeoKeywords: {
    type: String,
    default: 'categories, topics, explore, blog',
  },
  categoriesOgImage: {
    type: String,
    default: '',
  },

  // ============================================
  // EXPLORE LANDING SEO
  // ============================================
  exploreSeoTitle: {
    type: String,
    default: 'Explore - AllAbout',
  },
  exploreSeoDescription: {
    type: String,
    default: 'Discover content by type. Browse articles, listen to audio, or watch videos from creators around the world.',
  },
  exploreSeoKeywords: {
    type: String,
    default: 'explore, articles, audio, videos',
  },
  exploreOgImage: {
    type: String,
    default: '',
  },

  // ============================================
  // EXPLORE BY TYPE SEO
  // ============================================
  exploreArticlesSeoTitle: {
    type: String,
    default: 'Articles - AllAbout',
  },
  exploreArticlesSeoDescription: {
    type: String,
    default: 'Discover the most outstanding articles in all topics of life.',
  },
  exploreArticlesSeoKeywords: {
    type: String,
    default: 'articles, blog, stories',
  },
  exploreArticlesOgImage: {
    type: String,
    default: '',
  },

  exploreAudioSeoTitle: {
    type: String,
    default: 'Audio - AllAbout',
  },
  exploreAudioSeoDescription: {
    type: String,
    default: 'Click on the icon to enjoy the music or podcast.',
  },
  exploreAudioSeoKeywords: {
    type: String,
    default: 'audio, podcast, music',
  },
  exploreAudioOgImage: {
    type: String,
    default: '',
  },

  exploreVideoSeoTitle: {
    type: String,
    default: 'Videos - AllAbout',
  },
  exploreVideoSeoDescription: {
    type: String,
    default: 'Discover the most outstanding videos in all topics of life.',
  },
  exploreVideoSeoKeywords: {
    type: String,
    default: 'videos, watch, creators',
  },
  exploreVideoOgImage: {
    type: String,
    default: '',
  },

  // ============================================
  // 👇 NEW: EXPLORE PAGE CUSTOMIZATION (Full Management)
  // ============================================
  // ARTICLES
  exploreArticlesIcon: {
    type: String,
    default: '📄',
  },
  exploreArticlesTitle: {
    type: String,
    default: 'Articles',
  },
  exploreArticlesDescription: {
    type: String,
    default: 'Read in-depth stories, tutorials, and insights from our community of writers.',
  },
  exploreArticlesSubtitle: {
    type: String,
    default: 'Discover the most outstanding articles in all topics of life.',
  },
  exploreArticlesVisible: {
    type: Boolean,
    default: true,
  },
  exploreArticlesOrder: {
    type: Number,
    default: 1,
  },

  // AUDIO
  exploreAudioIcon: {
    type: String,
    default: '🎧',
  },
  exploreAudioTitle: {
    type: String,
    default: 'Audio',
  },
  exploreAudioDescription: {
    type: String,
    default: 'Listen to podcasts, music, and audio stories from talented creators.',
  },
  exploreAudioSubtitle: {
    type: String,
    default: 'Click on the icon to enjoy the music or podcast.',
  },
  exploreAudioVisible: {
    type: Boolean,
    default: true,
  },
  exploreAudioOrder: {
    type: Number,
    default: 2,
  },

  // VIDEO
  exploreVideoIcon: {
    type: String,
    default: '🎬',
  },
  exploreVideoTitle: {
    type: String,
    default: 'Videos',
  },
  exploreVideoDescription: {
    type: String,
    default: 'Watch engaging video content across all topics of life.',
  },
  exploreVideoSubtitle: {
    type: String,
    default: 'Discover the most outstanding videos in all topics of life.',
  },
  exploreVideoVisible: {
    type: Boolean,
    default: true,
  },
  exploreVideoOrder: {
    type: Number,
    default: 3,
  },

  // ============================================
  // META
  // ============================================
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);