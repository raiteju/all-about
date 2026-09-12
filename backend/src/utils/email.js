const nodemailer = require('nodemailer');

console.log('📧 Email utility loaded');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

console.log('✅ Email transporter created');

// ============================================
// HELPER: Format phone number
// ============================================
const formatPhone = (countryCode, phone) => {
  return `${countryCode || ''} ${phone || ''}`.trim();
};

// ============================================
// HELPER: Human-readable subject label
// ============================================
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

// ============================================
// HELPER: Escape HTML (for safe interpolation)
// ============================================
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ============================================
// HELPER: Replace placeholders in a template string
// ============================================
const replacePlaceholders = (template, data, { escape = false } = {}) => {
  if (!template) return '';

  const e = escape ? escapeHtml : (v) => v;

  return template
    .replace(/\{\{\s*name\s*\}\}/g, e(data.name || ''))
    .replace(/\{\{\s*email\s*\}\}/g, e(data.email || ''))
    .replace(/\{\{\s*phone\s*\}\}/g, e(data.phone || ''))
    .replace(/\{\{\s*subject\s*\}\}/g, e(data.subject || ''))
    .replace(/\{\{\s*message\s*\}\}/g, e(data.message || ''))
    .replace(/\{\{\s*reference\s*\}\}/g, e(data.reference || ''))
    .replace(/\{\{\s*siteName\s*\}\}/g, e(data.siteName || 'All About'))
    .replace(/\{\{\s*siteUrl\s*\}\}/g, e(data.siteUrl || ''));
};

// ============================================
// HELPER: Build default HTML wrapper for auto-reply
// ============================================
const buildAutoReplyShell = (bodyHtml) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #f0f0f0;">
        <h1 style="color: #00a8e8; margin: 0; font-size: 26px;">Thank You! 🎉</h1>
      </div>
      <div style="padding: 28px 8px;">
        ${bodyHtml}
      </div>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f0f0f0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} All About · Made with ❤️
        </p>
      </div>
    </div>
  `;
};

// ============================================
// SEND PASSWORD RESET EMAIL (UNCHANGED)
// ============================================
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const mailOptions = {
      from: `"All About Blog" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password - All About',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #00a8e8; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            You requested a password reset for your All About account. Click the button below to set a new password:
          </p>
          <a href="${resetLink}" style="display: inline-block; background: #00a8e8; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            All About Blog Platform
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return false;
  }
};

// ============================================
// SEND NEWSLETTER WELCOME EMAIL (UNCHANGED)
// ============================================
const sendWelcomeEmail = async (email) => {
  try {
    const siteName = 'All About';
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const mailOptions = {
      from: `"All About" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to ${siteName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #f0f0f0;">
            <h1 style="color: #00a8e8; margin: 0; font-size: 28px;">Welcome! 🎉</h1>
          </div>
          <div style="padding: 32px 8px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Hi there,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Thank you for subscribing to the <strong>${siteName}</strong> newsletter! We're thrilled to have you on board.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              You'll now be the first to know about:
            </p>
            <ul style="color: #374151; font-size: 15px; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
              <li>✨ Fresh articles from our creators</li>
              <li>🎧 New audio and podcast episodes</li>
              <li>🎬 Trending video content</li>
              <li>🏷️ Featured categories and topics</li>
            </ul>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${siteUrl}" style="display: inline-block; background: #00a8e8; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Explore ${siteName} →
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
              If you didn't subscribe to our newsletter, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f0f0f0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} ${siteName} · Made with ❤️
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return false;
  }
};

// ============================================
// SEND CONTACT NOTIFICATION (to admin) — UNCHANGED
// ============================================
const sendContactNotification = async (submission, destinationEmail) => {
  try {
    const to = destinationEmail || process.env.SMTP_USER;
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const adminLink = `${siteUrl}/admin/contact`;

    const mailOptions = {
      from: `"All About Contact" <${process.env.SMTP_USER}>`,
      to,
      replyTo: submission.email,
      subject: `📩 New Contact: "${subjectLabel(submission.subject)}" from ${submission.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <div style="padding: 16px 0 24px 0; border-bottom: 2px solid #00a8e8;">
            <h2 style="color: #111827; margin: 0 0 6px 0; font-size: 22px;">
              📩 New Contact Submission
            </h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Someone just submitted the contact form on AllAbout.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">
                <strong>Name:</strong>
              </td>
              <td style="padding: 10px 0; color: #111827; font-size: 15px;">
                ${submission.name}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
                <strong>Email:</strong>
              </td>
              <td style="padding: 10px 0; font-size: 15px;">
                <a href="mailto:${submission.email}" style="color: #00a8e8; text-decoration: none;">
                  ${submission.email}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
                <strong>Phone:</strong>
              </td>
              <td style="padding: 10px 0; color: #111827; font-size: 15px;">
                ${formatPhone(submission.countryCode, submission.phone)}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
                <strong>Subject:</strong>
              </td>
              <td style="padding: 10px 0;">
                <span style="display: inline-block; background: #eff6ff; color: #00a8e8; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                  ${subjectLabel(submission.subject)}
                </span>
              </td>
            </tr>
          </table>

          <div style="background: #f9fafb; border-left: 4px solid #00a8e8; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Message
            </p>
            <p style="color: #111827; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">
              ${submission.message}
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="${adminLink}" style="display: inline-block; background: #00a8e8; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              View in Admin Panel →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px 0;" />

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            Received on ${new Date(submission.createdAt).toLocaleString()} · AllAbout Contact Form
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Contact notification sent to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Contact notification error:', error.message);
    return false;
  }
};

// ============================================
// 👇 UPDATED: SEND CONTACT AUTO-REPLY (to user)
// Supports both Plain Text and Custom HTML
// ============================================
const sendContactAutoReply = async (submission, options = {}) => {
  try {
    const {
      format = 'plain',
      subjectTemplate = 'We received your message - {{siteName}} (#{{reference}})',
      bodyPlain = '',
      bodyHtml = '',
      siteName = 'All About',
      siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000',
    } = options;

    // Build reference ID
    const reference = submission._id
      ? `CS-${submission._id.toString().slice(-6).toUpperCase()}`
      : 'CS-XXXXXX';

    // Data for placeholder replacement
    const data = {
      name: submission.name || '',
      email: submission.email || '',
      phone: formatPhone(submission.countryCode, submission.phone),
      subject: subjectLabel(submission.subject),
      message: submission.message || '',
      reference,
      siteName,
      siteUrl,
    };

    // Replace subject placeholders (no HTML escaping for subject)
    const finalSubject = replacePlaceholders(subjectTemplate, data, {
      escape: false,
    });

    let mailOptions;

    if (format === 'html') {
      // ============================================
      // HTML FORMAT — use admin-provided HTML body
      // ============================================
      const bodyContent = bodyHtml && bodyHtml.trim()
        ? bodyHtml
        : `<p>Hi <strong>{{name}}</strong>,</p><p>Thank you for contacting us. We'll get back to you soon.</p><p><strong>Reference:</strong> #{{reference}}</p>`;

      // Replace placeholders (skip escaping for message since it's from Quill, but escape user's name/message)
      // For HTML mode, we trust admin HTML but escape user-provided fields
      const dataForHtml = {
        ...data,
        name: escapeHtml(submission.name || ''),
        email: escapeHtml(submission.email || ''),
        phone: escapeHtml(formatPhone(submission.countryCode, submission.phone)),
        message: escapeHtml(submission.message || ''),
        subject: escapeHtml(subjectLabel(submission.subject)),
      };

      const finalBodyHtml = replacePlaceholders(bodyContent, dataForHtml, {
        escape: false, // already escaped above
      });

      mailOptions = {
        from: `"All About Support" <${process.env.SMTP_USER}>`,
        to: submission.email,
        subject: finalSubject,
        html: buildAutoReplyShell(finalBodyHtml),
      };
    } else {
      // ============================================
      // PLAIN TEXT FORMAT — use admin-provided plain text
      // ============================================
      const bodyContent = bodyPlain && bodyPlain.trim()
        ? bodyPlain
        : `Hi {{name}},\n\nThank you for contacting us! We've received your message and will get back to you within 24-48 hours.\n\nYour Reference Number: #{{reference}}\n\n--- Your Message ---\nSubject: {{subject}}\n{{message}}\n--- End ---\n\nBest regards,\nThe {{siteName}} Team\n{{siteUrl}}`;

      const finalBodyText = replacePlaceholders(bodyContent, data, {
        escape: false, // plain text — no HTML escaping
      });

      // Convert newlines to <br> for HTML-safe delivery
      const htmlFromPlain = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #f0f0f0;">
            <h1 style="color: #00a8e8; margin: 0; font-size: 26px;">Thank You! 🎉</h1>
          </div>
          <div style="padding: 28px 8px; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap; font-family: Arial, sans-serif;">
            ${finalBodyText
              .split('\n')
              .map((line) => escapeHtml(line))
              .join('<br/>')}
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f0f0f0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} ${siteName} · Made with ❤️
            </p>
          </div>
        </div>
      `;

      mailOptions = {
        from: `"All About Support" <${process.env.SMTP_USER}>`,
        to: submission.email,
        subject: finalSubject,
        text: finalBodyText, // plain text fallback for non-HTML clients
        html: htmlFromPlain, // HTML version for modern clients
      };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Contact auto-reply (${format}) sent to ${submission.email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Contact auto-reply error:', error.message);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendContactNotification,
  sendContactAutoReply,
  // Export helpers in case other code needs them
  replacePlaceholders,
  escapeHtml,
};