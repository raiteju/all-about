'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import adminStyles from '../../admin.module.css';
import seoStyles from './SEO.module.css';
import { API_URL, uploadAdminImage } from '@/lib/api';

// ============================================
// TABS
// ============================================
const TABS = [
  { id: 'homepage', label: 'Homepage' },
  { id: 'home-seo', label: 'Homepage SEO' },
  { id: 'categories-seo', label: 'Categories SEO' },
  { id: 'explore-seo', label: 'Explore Landing SEO' },
  { id: 'explore-pages', label: 'Explore Pages' },
  { id: 'global-seo', label: 'Global Defaults' },
];

// ============================================
// REUSABLE: Image Upload Field
// ============================================
function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  fieldKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  fieldKey: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image is too large. Max 10MB.');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const url = await uploadAdminImage(file, token);
      onChange(url);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={seoStyles.fieldGroup}>
      <label className={seoStyles.fieldLabel}>{label}</label>
      <div className={seoStyles.imageField}>
        <div
          className={`${seoStyles.imagePreview} ${
            !value ? seoStyles.imagePreviewEmpty : ''
          }`}
        >
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              style={{ objectFit: 'cover' }}
              sizes="180px"
            />
          ) : (
            '🖼️'
          )}
        </div>

        <div className={seoStyles.imageActions}>
          <input
            type="file"
            accept="image/*"
            id={`upload-${fieldKey}`}
            style={{ display: 'none' }}
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
          <label
            htmlFor={`upload-${fieldKey}`}
            className={seoStyles.imageUploadBtn}
            style={{ opacity: uploading ? 0.6 : 1 }}
          >
            {uploading ? 'Uploading...' : value ? '🔄 Replace Image' : '⬆ Upload Image'}
          </label>

          <input
            type="text"
            className={seoStyles.imageUrlInput}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste URL"
          />

          {value && (
            <button
              type="button"
              className={seoStyles.imageRemoveBtn}
              onClick={() => onChange('')}
            >
              ✕ Remove
            </button>
          )}
        </div>
      </div>
      {hint && <span className={seoStyles.fieldHint}>{hint}</span>}
    </div>
  );
}

// ============================================
// REUSABLE: Text Field
// ============================================
function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxLength,
  multiline,
  showCounter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  multiline?: boolean;
  showCounter?: boolean;
}) {
  const overLimit = maxLength ? value.length > maxLength : false;

  return (
    <div className={seoStyles.fieldGroup}>
      <label className={seoStyles.fieldLabel}>
        {label}
        {showCounter && maxLength && (
          <span
            className={`${seoStyles.charCounter} ${
              overLimit ? seoStyles.charCounterOver : ''
            }`}
          >
            ({value.length}/{maxLength})
          </span>
        )}
      </label>
      {multiline ? (
        <textarea
          className={seoStyles.fieldTextarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          type="text"
          className={seoStyles.fieldInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint && <span className={seoStyles.fieldHint}>{hint}</span>}
    </div>
  );
}

// ============================================
// REUSABLE: Toggle Field (for Visibility)
// ============================================
function ToggleField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className={seoStyles.fieldGroup}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          padding: '12px 16px',
          background: checked ? '#f0fdf4' : '#f9fafb',
          border: `1.5px solid ${checked ? '#22c55e' : '#e5e7eb'}`,
          borderRadius: '10px',
          transition: 'all 0.2s',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            {checked ? `✓ ${label}` : `✗ ${label}`}
          </div>
          {hint && (
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{hint}</div>
          )}
        </div>
      </label>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function SEOSettingsPage() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Split state into strings and booleans for cleaner handling
  const [formData, setFormData] = useState<Record<string, string>>({
    // Homepage Hero
    heroTitle: '',
    heroSubtitle: '',
    heroSearchPlaceholder: '',
    heroImage: '',

    // Homepage CTA Banner
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    ctaButtonLink: '',
    ctaImage: '',

    // Homepage Section Titles
    trendingNowTitle: '',
    trendingNowSubtitle: '',
    latestAudioTitle: '',
    latestAudioSubtitle: '',
    latestVideoTitle: '',
    latestVideoSubtitle: '',

    // Home SEO
    homeSeoTitle: '',
    homeSeoDescription: '',
    homeSeoKeywords: '',
    homeOgImage: '',

    // Categories SEO
    categoriesSeoTitle: '',
    categoriesSeoDescription: '',
    categoriesSeoKeywords: '',
    categoriesOgImage: '',

    // Explore landing SEO
    exploreSeoTitle: '',
    exploreSeoDescription: '',
    exploreSeoKeywords: '',
    exploreOgImage: '',

    // Explore pages — Full Management
    exploreArticlesIcon: '',
    exploreArticlesTitle: '',
    exploreArticlesDescription: '',
    exploreArticlesSubtitle: '',
    exploreArticlesSeoTitle: '',
    exploreArticlesSeoDescription: '',
    exploreArticlesSeoKeywords: '',
    exploreArticlesOgImage: '',

    exploreAudioIcon: '',
    exploreAudioTitle: '',
    exploreAudioDescription: '',
    exploreAudioSubtitle: '',
    exploreAudioSeoTitle: '',
    exploreAudioSeoDescription: '',
    exploreAudioSeoKeywords: '',
    exploreAudioOgImage: '',

    exploreVideoIcon: '',
    exploreVideoTitle: '',
    exploreVideoDescription: '',
    exploreVideoSubtitle: '',
    exploreVideoSeoTitle: '',
    exploreVideoSeoDescription: '',
    exploreVideoSeoKeywords: '',
    exploreVideoOgImage: '',

    // Global defaults
    defaultSeoTitle: '',
    defaultSeoDescription: '',
    defaultSeoKeywords: '',
    defaultOgImage: '',
    defaultTwitterHandle: '',
  });

  // Boolean fields tracked separately
  const [booleanFields, setBooleanFields] = useState<Record<string, boolean>>({
    exploreArticlesVisible: true,
    exploreAudioVisible: true,
    exploreVideoVisible: true,
  });

  // Number fields tracked separately
  const [numberFields, setNumberFields] = useState<Record<string, number>>({
    exploreArticlesOrder: 1,
    exploreAudioOrder: 2,
    exploreVideoOrder: 3,
  });

  // ============================================
  // FETCH
  // ============================================
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-settings`);
        const data = await res.json();

        // Strings
        const initial: Record<string, string> = {};
        Object.keys(formData).forEach((key) => {
          initial[key] = data[key] || '';
        });
        setFormData(initial);

        // Booleans
        const initialBooleans: Record<string, boolean> = {};
        Object.keys(booleanFields).forEach((key) => {
          initialBooleans[key] =
            typeof data[key] === 'boolean' ? data[key] : true;
        });
        setBooleanFields(initialBooleans);

        // Numbers
        const initialNumbers: Record<string, number> = {};
        Object.keys(numberFields).forEach((key) => {
          initialNumbers[key] =
            typeof data[key] === 'number' ? data[key] : numberFields[key];
        });
        setNumberFields(initialNumbers);
      } catch (err) {
        console.error(err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // SAVE
  // ============================================
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        ...booleanFields,
        ...numberFields,
      };

      const res = await fetch(`${API_URL}/api/site-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save');
      }

      setMessage('✅ SEO & Homepage settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const updateBoolean = (key: string, value: boolean) => {
    setBooleanFields({ ...booleanFields, [key]: value });
  };

  const updateNumber = (key: string, value: number) => {
    setNumberFields({ ...numberFields, [key]: value });
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className={adminStyles.loadingContainer}>
        <div className={adminStyles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* ============ HEADER ============ */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Homepage & SEO Settings
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Manage homepage content, section titles, and SEO meta for all landing pages.
        </p>
      </div>

      {/* ============ STATUS MESSAGES ============ */}
      {message && (
        <div
          style={{
            background: '#f0fdf4',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '4px solid #22c55e',
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '4px solid #ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* ============ TABS ============ */}
      <div className={seoStyles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${seoStyles.tab} ${
              activeTab === tab.id ? seoStyles.tabActive : ''
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ TAB CONTENT ============ */}
      <div className={seoStyles.tabContent}>
        {/* ========== TAB 1: HOMEPAGE ========== */}
        {activeTab === 'homepage' && (
          <>
            {/* Hero Section */}
            <div className={seoStyles.section}>
              <div className={seoStyles.sectionTitle}>Hero Section</div>
              <p className={seoStyles.sectionDescription}>
                The main banner at the top of your homepage.
              </p>

              <TextField
                label="Hero Title"
                value={formData.heroTitle}
                onChange={(v) => updateField('heroTitle', v)}
                placeholder="Millions of people around the world showcase their thoughts"
              />
              <TextField
                label="Hero Subtitle"
                value={formData.heroSubtitle}
                onChange={(v) => updateField('heroSubtitle', v)}
                placeholder="All about bloggers - the home to the world's best bloggers..."
                multiline
              />
              <TextField
                label="Search Placeholder"
                value={formData.heroSearchPlaceholder}
                onChange={(v) => updateField('heroSearchPlaceholder', v)}
                placeholder="Search"
                hint="Text shown inside the search bar"
              />
              <ImageUploadField
                label="Hero Background Image"
                fieldKey="hero"
                value={formData.heroImage}
                onChange={(v) => updateField('heroImage', v)}
                hint="Recommended: 1920x600px. Max 10MB. Leave empty to use default."
              />
            </div>

            {/* CTA Section */}
            <div className={seoStyles.section}>
              <div className={seoStyles.sectionTitle}>CTA Banner</div>
              <p className={seoStyles.sectionDescription}>
                The "Become a Blogger" call-to-action banner.
              </p>

              <TextField
                label="CTA Title"
                value={formData.ctaTitle}
                onChange={(v) => updateField('ctaTitle', v)}
                placeholder="Become a Blogger!"
              />
              <TextField
                label="CTA Description"
                value={formData.ctaDescription}
                onChange={(v) => updateField('ctaDescription', v)}
                placeholder="Speedy say has suitable disposal add boy..."
                multiline
              />
              <div className={seoStyles.twoCol}>
                <TextField
                  label="CTA Button Text"
                  value={formData.ctaButtonText}
                  onChange={(v) => updateField('ctaButtonText', v)}
                  placeholder="Register Here"
                />
                <TextField
                  label="CTA Button Link"
                  value={formData.ctaButtonLink}
                  onChange={(v) => updateField('ctaButtonLink', v)}
                  placeholder="/register"
                  hint="Use /register or /login to trigger the auth modal"
                />
              </div>
              <ImageUploadField
                label="CTA Background Image (Optional)"
                fieldKey="cta"
                value={formData.ctaImage}
                onChange={(v) => updateField('ctaImage', v)}
                hint="Leave empty to use solid blue background."
              />
            </div>

            {/* Section Titles */}
            <div className={seoStyles.section}>
              <div className={seoStyles.sectionTitle}>Homepage Section Titles</div>
              <p className={seoStyles.sectionDescription}>
                Titles and subtitles shown above each content section on the homepage.
              </p>

              <TextField
                label="Trending Now — Title"
                value={formData.trendingNowTitle}
                onChange={(v) => updateField('trendingNowTitle', v)}
                placeholder="Trending Now"
              />
              <TextField
                label="Trending Now — Subtitle"
                value={formData.trendingNowSubtitle}
                onChange={(v) => updateField('trendingNowSubtitle', v)}
                multiline
              />

              <TextField
                label="Latest Audio — Title"
                value={formData.latestAudioTitle}
                onChange={(v) => updateField('latestAudioTitle', v)}
                placeholder="Latest Audio"
              />
              <TextField
                label="Latest Audio — Subtitle"
                value={formData.latestAudioSubtitle}
                onChange={(v) => updateField('latestAudioSubtitle', v)}
                multiline
              />

              <TextField
                label="Latest Video — Title"
                value={formData.latestVideoTitle}
                onChange={(v) => updateField('latestVideoTitle', v)}
                placeholder="Latest Video"
              />
              <TextField
                label="Latest Video — Subtitle"
                value={formData.latestVideoSubtitle}
                onChange={(v) => updateField('latestVideoSubtitle', v)}
                multiline
              />
            </div>
          </>
        )}

        {/* ========== TAB 2: HOMEPAGE SEO ========== */}
        {activeTab === 'home-seo' && (
          <div className={seoStyles.section}>
            <div className={seoStyles.sectionTitle}>Homepage Meta Tags</div>
            <p className={seoStyles.sectionDescription}>
              SEO meta for the homepage (yoursite.com/).
            </p>

            <TextField
              label="Meta Title"
              value={formData.homeSeoTitle}
              onChange={(v) => updateField('homeSeoTitle', v)}
              placeholder="AllAbout - Blog & Guest Post Platform"
              maxLength={60}
              showCounter
              hint="Aim for 50-60 characters."
            />
            <TextField
              label="Meta Description"
              value={formData.homeSeoDescription}
              onChange={(v) => updateField('homeSeoDescription', v)}
              placeholder="Discover outstanding articles in all topics of life."
              maxLength={160}
              showCounter
              multiline
              hint="Aim for 150-160 characters."
            />
            <TextField
              label="Meta Keywords"
              value={formData.homeSeoKeywords}
              onChange={(v) => updateField('homeSeoKeywords', v)}
              placeholder="blog, articles, audio, video"
            />
            <ImageUploadField
              label="OG Image (Social Share Preview)"
              fieldKey="homeOg"
              value={formData.homeOgImage}
              onChange={(v) => updateField('homeOgImage', v)}
              hint="Recommended: 1200x630px."
            />
          </div>
        )}

        {/* ========== TAB 3: CATEGORIES SEO ========== */}
        {activeTab === 'categories-seo' && (
          <div className={seoStyles.section}>
            <div className={seoStyles.sectionTitle}>Categories Landing Page Meta</div>
            <p className={seoStyles.sectionDescription}>
              SEO meta for yoursite.com/categories
            </p>

            <TextField
              label="Meta Title"
              value={formData.categoriesSeoTitle}
              onChange={(v) => updateField('categoriesSeoTitle', v)}
              maxLength={60}
              showCounter
            />
            <TextField
              label="Meta Description"
              value={formData.categoriesSeoDescription}
              onChange={(v) => updateField('categoriesSeoDescription', v)}
              maxLength={160}
              showCounter
              multiline
            />
            <TextField
              label="Meta Keywords"
              value={formData.categoriesSeoKeywords}
              onChange={(v) => updateField('categoriesSeoKeywords', v)}
            />
            <ImageUploadField
              label="OG Image"
              fieldKey="categoriesOg"
              value={formData.categoriesOgImage}
              onChange={(v) => updateField('categoriesOgImage', v)}
            />
          </div>
        )}

        {/* ========== TAB 4: EXPLORE LANDING SEO ========== */}
        {activeTab === 'explore-seo' && (
          <div className={seoStyles.section}>
            <div className={seoStyles.sectionTitle}>Explore Landing Page Meta</div>
            <p className={seoStyles.sectionDescription}>
              SEO meta for yoursite.com/explore
            </p>

            <TextField
              label="Meta Title"
              value={formData.exploreSeoTitle}
              onChange={(v) => updateField('exploreSeoTitle', v)}
              maxLength={60}
              showCounter
            />
            <TextField
              label="Meta Description"
              value={formData.exploreSeoDescription}
              onChange={(v) => updateField('exploreSeoDescription', v)}
              maxLength={160}
              showCounter
              multiline
            />
            <TextField
              label="Meta Keywords"
              value={formData.exploreSeoKeywords}
              onChange={(v) => updateField('exploreSeoKeywords', v)}
            />
            <ImageUploadField
              label="OG Image"
              fieldKey="exploreOg"
              value={formData.exploreOgImage}
              onChange={(v) => updateField('exploreOgImage', v)}
            />
          </div>
        )}

        {/* ========== TAB 5: EXPLORE PAGES (FULL MANAGEMENT) ========== */}
        {activeTab === 'explore-pages' && (
          <>
            {/* Articles */}
            <div className={seoStyles.section}>
              <div className={seoStyles.sectionTitle}>📄 Articles Page</div>
              <p className={seoStyles.sectionDescription}>
                Customize yoursite.com/explore/articles and how it appears on the landing page.
              </p>

              <ToggleField
                label="Visible on Explore Landing"
                checked={booleanFields.exploreArticlesVisible}
                onChange={(v) => updateBoolean('exploreArticlesVisible', v)}
                hint="Uncheck to hide this type from the Explore landing page."
              />

              <div className={seoStyles.twoCol}>
                <TextField
                  label="Display Title"
                  value={formData.exploreArticlesTitle}
                  onChange={(v) => updateField('exploreArticlesTitle', v)}
                  placeholder="Articles"
                  hint="Shown on landing card + type page header"
                />
                <TextField
                  label="Order"
                  value={String(numberFields.exploreArticlesOrder)}
                  onChange={(v) =>
                    updateNumber('exploreArticlesOrder', parseInt(v) || 1)
                  }
                  placeholder="1"
                  hint="Lower numbers appear first"
                />
              </div>

              <TextField
                label="Landing Card Description"
                value={formData.exploreArticlesDescription}
                onChange={(v) => updateField('exploreArticlesDescription', v)}
                placeholder="Read in-depth stories, tutorials, and insights..."
                multiline
                hint="Shown on the Explore landing page card"
              />

              <TextField
                label="Type Page Subtitle"
                value={formData.exploreArticlesSubtitle}
                onChange={(v) => updateField('exploreArticlesSubtitle', v)}
                placeholder="Discover the most outstanding articles in all topics of life."
                multiline
                hint="Shown on /explore/articles"
              />

              <div className={seoStyles.iconPicker}>
                <div className={seoStyles.iconPreview}>
                  {formData.exploreArticlesIcon || '📄'}
                </div>
                <div className={seoStyles.iconInput}>
                  <TextField
                    label="Icon (emoji)"
                    value={formData.exploreArticlesIcon}
                    onChange={(v) => updateField('exploreArticlesIcon', v)}
                    placeholder="📄"
                    hint="Paste any emoji, e.g., 📄 📖 ✍️"
                  />
                </div>
              </div>

              <div className={seoStyles.twoCol}>
                <TextField
                  label="SEO Meta Title"
                  value={formData.exploreArticlesSeoTitle}
                  onChange={(v) => updateField('exploreArticlesSeoTitle', v)}
                  maxLength={60}
                  showCounter
                />
                <TextField
                  label="SEO Meta Keywords"
                  value={formData.exploreArticlesSeoKeywords}
                  onChange={(v) => updateField('exploreArticlesSeoKeywords', v)}
                />
              </div>

              <TextField
                label="SEO Meta Description"
                value={formData.exploreArticlesSeoDescription}
                onChange={(v) => updateField('exploreArticlesSeoDescription', v)}
                maxLength={160}
                showCounter
                multiline
              />

              <ImageUploadField
                label="OG Image"
                fieldKey="exploreArticlesOg"
                value={formData.exploreArticlesOgImage}
                onChange={(v) => updateField('exploreArticlesOgImage', v)}
              />
            </div>

            {/* Audio */}
            <div className={seoStyles.section}>
              <div className={seoStyles.sectionTitle}>🎧 Audio Page</div>
              <p className={seoStyles.sectionDescription}>
                Customize yoursite.com/explore/audio and how it appears on the landing page.
              </p>

              <ToggleField
                label="Visible on Explore Landing"
                checked={booleanFields.exploreAudioVisible}
                onChange={(v) => updateBoolean('exploreAudioVisible', v)}
                hint="Uncheck to hide this type from the Explore landing page."
              />

              <div className={seoStyles.twoCol}>
                <TextField
                  label="Display Title"
                  value={formData.exploreAudioTitle}
                  onChange={(v) => updateField('exploreAudioTitle', v)}
                  placeholder="Audio"
                />
                <TextField
                  label="Order"
                  value={String(numberFields.exploreAudioOrder)}
                  onChange={(v) =>
                    updateNumber('exploreAudioOrder', parseInt(v) || 2)
                  }
                  placeholder="2"
                />
              </div>

              <TextField
                label="Landing Card Description"
                value={formData.exploreAudioDescription}
                onChange={(v) => updateField('exploreAudioDescription', v)}
                placeholder="Listen to podcasts, music, and audio stories..."
                multiline
              />

              <TextField
                label="Type Page Subtitle"
                value={formData.exploreAudioSubtitle}
                onChange={(v) => updateField('exploreAudioSubtitle', v)}
                placeholder="Click on the icon to enjoy the music or podcast."
                multiline
              />

              <div className={seoStyles.iconPicker}>
                <div className={seoStyles.iconPreview}>
                  {formData.exploreAudioIcon || '🎧'}
                </div>
                <div className={seoStyles.iconInput}>
                  <TextField
                    label="Icon (emoji)"
                    value={formData.exploreAudioIcon}
                    onChange={(v) => updateField('exploreAudioIcon', v)}
                    placeholder="🎧"
                  />
                </div>
              </div>

              <div className={seoStyles.twoCol}>
                <TextField
                  label="SEO Meta Title"
                  value={formData.exploreAudioSeoTitle}
                  onChange={(v) => updateField('exploreAudioSeoTitle', v)}
                  maxLength={60}
                  showCounter
                />
                <TextField
                  label="SEO Meta Keywords"
                  value={formData.exploreAudioSeoKeywords}
                  onChange={(v) => updateField('exploreAudioSeoKeywords', v)}
                />
              </div>

              <TextField
                label="SEO Meta Description"
                value={formData.exploreAudioSeoDescription}
                onChange={(v) => updateField('exploreAudioSeoDescription', v)}
                maxLength={160}
                showCounter
                multiline
              />

              <ImageUploadField
                label="OG Image"
                fieldKey="exploreAudioOg"
                value={formData.exploreAudioOgImage}
                onChange={(v) => updateField('exploreAudioOgImage', v)}
              />
            </div>

            {/* Video */}
            <div className={seoStyles.section}>
              <div className={seoStyles.sectionTitle}>🎬 Video Page</div>
              <p className={seoStyles.sectionDescription}>
                Customize yoursite.com/explore/video and how it appears on the landing page.
              </p>

              <ToggleField
                label="Visible on Explore Landing"
                checked={booleanFields.exploreVideoVisible}
                onChange={(v) => updateBoolean('exploreVideoVisible', v)}
                hint="Uncheck to hide this type from the Explore landing page."
              />

              <div className={seoStyles.twoCol}>
                <TextField
                  label="Display Title"
                  value={formData.exploreVideoTitle}
                  onChange={(v) => updateField('exploreVideoTitle', v)}
                  placeholder="Videos"
                />
                <TextField
                  label="Order"
                  value={String(numberFields.exploreVideoOrder)}
                  onChange={(v) =>
                    updateNumber('exploreVideoOrder', parseInt(v) || 3)
                  }
                  placeholder="3"
                />
              </div>

              <TextField
                label="Landing Card Description"
                value={formData.exploreVideoDescription}
                onChange={(v) => updateField('exploreVideoDescription', v)}
                placeholder="Watch engaging video content across all topics of life."
                multiline
              />

              <TextField
                label="Type Page Subtitle"
                value={formData.exploreVideoSubtitle}
                onChange={(v) => updateField('exploreVideoSubtitle', v)}
                placeholder="Discover the most outstanding videos in all topics of life."
                multiline
              />

              <div className={seoStyles.iconPicker}>
                <div className={seoStyles.iconPreview}>
                  {formData.exploreVideoIcon || '🎬'}
                </div>
                <div className={seoStyles.iconInput}>
                  <TextField
                    label="Icon (emoji)"
                    value={formData.exploreVideoIcon}
                    onChange={(v) => updateField('exploreVideoIcon', v)}
                    placeholder="🎬"
                  />
                </div>
              </div>

              <div className={seoStyles.twoCol}>
                <TextField
                  label="SEO Meta Title"
                  value={formData.exploreVideoSeoTitle}
                  onChange={(v) => updateField('exploreVideoSeoTitle', v)}
                  maxLength={60}
                  showCounter
                />
                <TextField
                  label="SEO Meta Keywords"
                  value={formData.exploreVideoSeoKeywords}
                  onChange={(v) => updateField('exploreVideoSeoKeywords', v)}
                />
              </div>

              <TextField
                label="SEO Meta Description"
                value={formData.exploreVideoSeoDescription}
                onChange={(v) => updateField('exploreVideoSeoDescription', v)}
                maxLength={160}
                showCounter
                multiline
              />

              <ImageUploadField
                label="OG Image"
                fieldKey="exploreVideoOg"
                value={formData.exploreVideoOgImage}
                onChange={(v) => updateField('exploreVideoOgImage', v)}
              />
            </div>
          </>
        )}

        {/* ========== TAB 6: GLOBAL DEFAULTS ========== */}
        {activeTab === 'global-seo' && (
          <div className={seoStyles.section}>
            <div className={seoStyles.sectionTitle}>Global SEO Fallbacks</div>
            <p className={seoStyles.sectionDescription}>
              Used when a specific page hasn't set its own meta.
            </p>

            <TextField
              label="Default Meta Title"
              value={formData.defaultSeoTitle}
              onChange={(v) => updateField('defaultSeoTitle', v)}
              maxLength={60}
              showCounter
            />
            <TextField
              label="Default Meta Description"
              value={formData.defaultSeoDescription}
              onChange={(v) => updateField('defaultSeoDescription', v)}
              maxLength={160}
              showCounter
              multiline
            />
            <TextField
              label="Default Meta Keywords"
              value={formData.defaultSeoKeywords}
              onChange={(v) => updateField('defaultSeoKeywords', v)}
            />
            <ImageUploadField
              label="Default OG Image"
              fieldKey="defaultOg"
              value={formData.defaultOgImage}
              onChange={(v) => updateField('defaultOgImage', v)}
              hint="Fallback for pages without a custom OG image."
            />
            <TextField
              label="Twitter Handle"
              value={formData.defaultTwitterHandle}
              onChange={(v) => updateField('defaultTwitterHandle', v)}
              placeholder="@allabout"
              hint="Used for Twitter Card meta tags."
            />
          </div>
        )}
      </div>

      {/* ============ SAVE BUTTON ============ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={adminStyles.btnPrimary}
          style={{ padding: '12px 32px', fontSize: '15px', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  );
}