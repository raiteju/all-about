'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';
import { submitContactForm } from '@/lib/api';

// Country codes list
const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
];

// Subject options
const SUBJECT_OPTIONS = [
  { value: '', label: '-- Select Subject --' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'business', label: 'Business & Partnerships' },
  { value: 'advertising', label: 'Advertising & Sponsorship' },
  { value: 'report', label: 'Report an Issue' },
  { value: 'other', label: 'Other' },
];

interface FormData {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    countryCode: '+971',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [referenceId, setReferenceId] = useState('');

  // ============================================
  // VALIDATION
  // ============================================
  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case 'name': {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      }
      case 'email': {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
        return '';
      }
      case 'phone': {
        if (!value.trim()) return 'Phone number is required';
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 7) return 'Phone number must be at least 7 digits';
        if (digitsOnly.length > 15) return 'Phone number must not exceed 15 digits';
        return '';
      }
      case 'subject': {
        if (!value) return 'Please select a subject';
        return '';
      }
      case 'message': {
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        if (value.trim().length > 1000) return 'Message must not exceed 1000 characters';
        return '';
      }
      default:
        return '';
    }
  };

  const validateAll = (): FormErrors => {
    const newErrors: FormErrors = {};
    newErrors.name = validateField('name', formData.name);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.subject = validateField('subject', formData.subject);
    newErrors.message = validateField('message', formData.message);
    return newErrors;
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let finalValue = value;
    if (name === 'phone') {
      finalValue = value.replace(/[^\d\s-]/g, '');
    }

    setFormData({ ...formData, [name]: finalValue });

    if (touched[name] && errors[name as keyof FormErrors]) {
      const newError = validateField(name as keyof FormData, finalValue);
      setErrors({ ...errors, [name]: newError });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldError = validateField(name as keyof FormData, value);
    setErrors({ ...errors, [name]: fieldError });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setReferenceId('');

    // Client-side validation
    const newErrors = validateAll();
    const hasErrors = Object.values(newErrors).some((err) => err && err.length > 0);

    if (hasErrors) {
      setErrors(newErrors);
      setTouched({
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 👇 REAL API CALL
      const response = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        countryCode: formData.countryCode,
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });

      setSuccess(response.message || 'Thank you! Your message has been sent.');
      if (response.referenceId) {
        setReferenceId(response.referenceId);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        countryCode: '+971',
        phone: '',
        subject: '',
        message: '',
      });
      setErrors({});
      setTouched({});
    } catch (err: any) {
      // Handle server-side field errors
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
        setTouched({
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
        });
      }
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
      {/* Name */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Your Name <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="John Doe"
          className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
        />
        {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
      </div>

      {/* Email */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Your Email <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
        />
        {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
      </div>

      {/* Phone */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Phone Number <span className={styles.required}>*</span>
        </label>
        <div className={styles.phoneRow}>
          <select
            name="countryCode"
            value={formData.countryCode}
            onChange={handleChange}
            className={styles.countrySelect}
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((c, idx) => (
              <option key={`${c.code}-${idx}`} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="50 123 4567"
            className={`${styles.formInput} ${styles.phoneInput} ${
              errors.phone ? styles.inputError : ''
            }`}
          />
        </div>
        {errors.phone && <p className={styles.fieldError}>{errors.phone}</p>}
      </div>

      {/* Subject */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Subject <span className={styles.required}>*</span>
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.formSelect} ${errors.subject ? styles.inputError : ''}`}
        >
          {SUBJECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.subject && <p className={styles.fieldError}>{errors.subject}</p>}
      </div>

      {/* Message */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Message <span className={styles.required}>*</span>
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.formTextarea} ${errors.message ? styles.inputError : ''}`}
          placeholder="Write your message here..."
        ></textarea>
        <div className={styles.charCount}>
          {formData.message.length} / 1000 characters
        </div>
        {errors.message && <p className={styles.fieldError}>{errors.message}</p>}
      </div>

      {/* Status Messages */}
      {success && (
        <div className={styles.successMessage}>
          <p style={{ margin: 0 }}>{success}</p>
          {referenceId && (
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', opacity: 0.85 }}>
              <strong>Reference:</strong> #{referenceId}
            </p>
          )}
        </div>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Submit */}
      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}