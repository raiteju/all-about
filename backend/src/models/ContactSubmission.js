const mongoose = require('mongoose');

const ContactSubmissionSchema = new mongoose.Schema({
  // ============================================
  // USER-SUBMITTED DATA
  // ============================================
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  countryCode: {
    type: String,
    default: '+971',
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    enum: [
      'general',
      'support',
      'feedback',
      'business',
      'advertising',
      'report',
      'other',
    ],
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },

  // ============================================
  // ADMIN MANAGEMENT
  // ============================================
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new',
  },
  adminNotes: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  repliedAt: {
    type: Date,
    default: null,
  },

  // ============================================
  // METADATA (for spam detection / auditing)
  // ============================================
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },

  // ============================================
  // TIMESTAMPS
  // ============================================
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update updatedAt on save (modern Mongoose syntax)
ContactSubmissionSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

// Indexes for faster admin queries
ContactSubmissionSchema.index({ status: 1, createdAt: -1 });
ContactSubmissionSchema.index({ email: 1 });

module.exports = mongoose.model('ContactSubmission', ContactSubmissionSchema);