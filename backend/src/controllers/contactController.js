const ContactSubmission = require('../models/ContactSubmission');
const SiteSettings = require('../models/SiteSettings');
const {
  sendContactNotification,
  sendContactAutoReply,
} = require('../utils/email');

// Simple email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid subject values (must match the model enum)
const VALID_SUBJECTS = [
  'general',
  'support',
  'feedback',
  'business',
  'advertising',
  'report',
  'other',
];

// ============================================
// SUBMIT CONTACT FORM (Public)
// ============================================
const submitContact = async (req, res) => {
  try {
    const { name, email, countryCode, phone, subject, message } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    const errors = {};

    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      errors.email = 'Please provide a valid email address';
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      errors.phone = 'Phone number must be at least 7 digits';
    }
    if (!subject || !VALID_SUBJECTS.includes(subject)) {
      errors.subject = 'Please select a valid subject';
    }
    if (!message || message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    if (message && message.trim().length > 1000) {
      errors.message = 'Message must not exceed 1000 characters';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Please fix the errors below',
        errors,
      });
    }

    // ============================================
    // GET SETTINGS FROM SITE SETTINGS
    // ============================================
    let destinationEmail = process.env.SMTP_USER;
    let autoReplyEnabled = true;
    let autoReplyFormat = 'plain';
    let autoReplySubject = 'We received your message - {{siteName}} (#{{reference}})';
    let autoReplyBodyPlain = '';
    let autoReplyBodyHtml = '';
    let siteName = 'All About';

    try {
      const settings = await SiteSettings.findOne();
      if (settings) {
        if (settings.contactEmail) {
          destinationEmail = settings.contactEmail;
        }
        if (settings.contactAutoReplyEnabled === false) {
          autoReplyEnabled = false;
        }
        if (settings.contactAutoReplyFormat) {
          autoReplyFormat = settings.contactAutoReplyFormat;
        }
        if (settings.contactAutoReplySubject) {
          autoReplySubject = settings.contactAutoReplySubject;
        }
        if (settings.contactAutoReplyBodyPlain) {
          autoReplyBodyPlain = settings.contactAutoReplyBodyPlain;
        }
        if (settings.contactAutoReplyBodyHtml) {
          autoReplyBodyHtml = settings.contactAutoReplyBodyHtml;
        }
        if (settings.siteName) {
          siteName = settings.siteName;
        }
      }
    } catch (err) {
      console.error('Failed to load SiteSettings:', err.message);
      // Continue with fallback values
    }

    // ============================================
    // SAVE SUBMISSION TO DB
    // ============================================
    const submission = await ContactSubmission.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      countryCode: countryCode || '+971',
      phone: phone.trim(),
      subject,
      message: message.trim(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'new',
    });

    // ============================================
    // SEND EMAILS (fire-and-forget)
    // ============================================
    // Admin notification
    sendContactNotification(submission, destinationEmail).catch((err) =>
      console.error('Admin notification failed:', err.message)
    );

    // Auto-reply to user (if enabled) — pass custom template options
    if (autoReplyEnabled) {
      sendContactAutoReply(submission, {
        format: autoReplyFormat,
        subjectTemplate: autoReplySubject,
        bodyPlain: autoReplyBodyPlain,
        bodyHtml: autoReplyBodyHtml,
        siteName: siteName,
        siteUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      }).catch((err) => console.error('Auto-reply failed:', err.message));
    }

    // ============================================
    // RETURN SUCCESS
    // ============================================
    const refId = `CS-${submission._id.toString().slice(-6).toUpperCase()}`;

    res.status(201).json({
      message:
        'Thank you! Your message has been sent. We will get back to you soon.',
      referenceId: refId,
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      message: 'Failed to send message. Please try again.',
    });
  }
};

// ============================================
// GET ALL SUBMISSIONS (Admin)
// ============================================
const getAllSubmissions = async (req, res) => {
  try {
    const { status, search } = req.query;

    let filter = {};
    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { message: searchRegex },
      ];
    }

    const submissions = await ContactSubmission.find(filter).sort({
      createdAt: -1,
    });

    res.json(submissions);
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

// ============================================
// GET SUBMISSION STATS (Admin)
// ============================================
const getSubmissionStats = async (req, res) => {
  try {
    const [total, newCount, readCount, repliedCount, archivedCount] =
      await Promise.all([
        ContactSubmission.countDocuments(),
        ContactSubmission.countDocuments({ status: 'new' }),
        ContactSubmission.countDocuments({ status: 'read' }),
        ContactSubmission.countDocuments({ status: 'replied' }),
        ContactSubmission.countDocuments({ status: 'archived' }),
      ]);

    res.json({
      total,
      new: newCount,
      read: readCount,
      replied: repliedCount,
      archived: archivedCount,
    });
  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// ============================================
// GET SINGLE SUBMISSION (Admin)
// ============================================
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await ContactSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status === 'new') {
      submission.status = 'read';
      await submission.save();
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Failed to fetch submission' });
  }
};

// ============================================
// UPDATE SUBMISSION STATUS (Admin)
// ============================================
const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await ContactSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.status = status;

    if (status === 'replied' && !submission.repliedAt) {
      submission.repliedAt = new Date();
    }

    await submission.save();
    res.json(submission);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// ============================================
// UPDATE ADMIN NOTES (Admin)
// ============================================
const updateAdminNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (adminNotes && adminNotes.length > 2000) {
      return res
        .status(400)
        .json({ message: 'Admin notes must not exceed 2000 characters' });
    }

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { adminNotes: adminNotes || '' },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ message: 'Failed to update notes' });
  }
};

// ============================================
// DELETE SUBMISSION (Admin)
// ============================================
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await ContactSubmission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Failed to delete submission' });
  }
};

// ============================================
// EXPORT SUBMISSIONS AS CSV (Admin)
// ============================================
const exportSubmissions = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      filter.status = status;
    }

    const submissions = await ContactSubmission.find(filter).sort({
      createdAt: -1,
    });

    const headers = [
      'Reference',
      'Name',
      'Email',
      'Phone',
      'Subject',
      'Message',
      'Status',
      'Admin Notes',
      'Submitted At',
      'Replied At',
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const subjectLabel = (subject) => {
      const map = {
        general: 'General Inquiry',
        support: 'Technical Support',
        feedback: 'Feedback & Suggestions',
        business: 'Business & Partnerships',
        advertising: 'Advertising & Sponsorship',
        report: 'Report an Issue',
        other: 'Other',
      };
      return map[subject] || subject;
    };

    const rows = submissions.map((s) => [
      escapeCSV(`CS-${s._id.toString().slice(-6).toUpperCase()}`),
      escapeCSV(s.name),
      escapeCSV(s.email),
      escapeCSV(`${s.countryCode} ${s.phone}`),
      escapeCSV(subjectLabel(s.subject)),
      escapeCSV(s.message),
      escapeCSV(s.status),
      escapeCSV(s.adminNotes || ''),
      escapeCSV(s.createdAt ? new Date(s.createdAt).toISOString() : ''),
      escapeCSV(s.repliedAt ? new Date(s.repliedAt).toISOString() : ''),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const date = new Date().toISOString().split('T')[0];
    const filename = `contact-submissions-${status || 'all'}-${date}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export submissions error:', error);
    res.status(500).json({ message: 'Failed to export submissions' });
  }
};

module.exports = {
  submitContact,
  getAllSubmissions,
  getSubmissionStats,
  getSubmissionById,
  updateSubmissionStatus,
  updateAdminNotes,
  deleteSubmission,
  exportSubmissions,
};