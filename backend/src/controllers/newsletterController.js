const Subscriber = require('../models/Subscriber');
const { sendWelcomeEmail } = require('../utils/email');

// Simple email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================
// SUBSCRIBE (Public)
// ============================================
const subscribe = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let existing = await Subscriber.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.status === 'active') {
        return res.status(200).json({
          message: 'You are already subscribed! 🎉',
          alreadySubscribed: true,
        });
      }

      existing.status = 'active';
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = null;
      await existing.save();

      sendWelcomeEmail(normalizedEmail).catch((err) =>
        console.error('Welcome email failed:', err.message)
      );

      return res.json({
        message: 'Welcome back! You are subscribed again. 🎉',
        alreadySubscribed: false,
      });
    }

    await Subscriber.create({
      email: normalizedEmail,
      source: source || 'footer',
    });

    sendWelcomeEmail(normalizedEmail).catch((err) =>
      console.error('Welcome email failed:', err.message)
    );

    res.status(201).json({
      message: 'Thank you for subscribing! 🎉',
      alreadySubscribed: false,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
  }
};

// ============================================
// UNSUBSCRIBE (Public via email)
// ============================================
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });

    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found in our list' });
    }

    if (subscriber.status === 'unsubscribed') {
      return res.json({ message: 'This email is already unsubscribed' });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.json({ message: 'You have been unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe' });
  }
};

// ============================================
// GET ALL SUBSCRIBERS (Admin)
// ============================================
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};

// ============================================
// DELETE SUBSCRIBER (Admin)
// ============================================
const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await Subscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ message: 'Failed to delete subscriber' });
  }
};

// ============================================
// 👇 NEW: EXPORT SUBSCRIBERS AS CSV (Admin)
// ============================================
const exportSubscribers = async (req, res) => {
  try {
    const { status } = req.query; // optional: 'active' | 'unsubscribed' | 'all'

    let filter = {};
    if (status === 'active') filter = { status: 'active' };
    else if (status === 'unsubscribed') filter = { status: 'unsubscribed' };
    // else: all

    const subscribers = await Subscriber.find(filter).sort({ subscribedAt: -1 });

    // CSV header
    const headers = ['Email', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At'];

    // Escape CSV field (wrap in quotes if contains comma, quote, or newline)
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const rows = subscribers.map((s) => [
      escapeCSV(s.email),
      escapeCSV(s.status),
      escapeCSV(s.source || ''),
      escapeCSV(s.subscribedAt ? new Date(s.subscribedAt).toISOString() : ''),
      escapeCSV(s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString() : ''),
    ]);

    // Combine
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `subscribers-${status || 'all'}-${date}.csv`;

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export subscribers error:', error);
    res.status(500).json({ message: 'Failed to export subscribers' });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  exportSubscribers, // 👈 NEW
};