'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from '../../../admin.module.css';
import { API_URL, uploadFeaturedImage } from '@/lib/api';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    status: 'published' as 'published' | 'draft',
    showInFooter: false,
    seoMeta: {
      title: '',
      description: '',
      keywords: '',
    },
  });

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);

  // Quill editor config (same as post editor)
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['link', 'image'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['clean'],
    ],
  };

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'link', 'image', 'list', 'align'];

  // Fetch existing page data
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/pages/${pageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch page');
        const data = await res.json();
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          featuredImage: data.featuredImage || '',
          status: data.status || 'published',
          showInFooter: data.showInFooter || false,
          seoMeta: {
            title: data.seoMeta?.title || '',
            description: data.seoMeta?.description || '',
            keywords: data.seoMeta?.keywords || '',
          },
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (pageId) fetchPage();
  }, [pageId]);

  const handleContentChange = (content: string) => {
    setFormData({ ...formData, content });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      // Upload new featured image if selected
      let finalFeaturedImage = formData.featuredImage;
      if (featuredImageFile) {
        finalFeaturedImage = await uploadFeaturedImage(featuredImageFile, token);
      }

      const payload = {
        ...formData,
        featuredImage: finalFeaturedImage,
      };

      const res = await fetch(`${API_URL}/api/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update page');
      }

      router.push('/admin/site-management/pages');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading page...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          href="/admin/site-management/pages"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#6b7280',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          ← Back to Pages
        </Link>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          Edit Page
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Update the page content, settings, and SEO.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          borderLeft: '4px solid #ef4444'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* ============ BASIC INFO ============ */}
        <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Basic Information
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Page Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., About Us"
              required
            />
          </div>

          <div className={styles.formGroup}>
  <label className={styles.formLabel}>
    URL Slug <span style={{ color: '#ef4444' }}>*</span>
  </label>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{
      padding: '10px 12px',
      background: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#6b7280',
      whiteSpace: 'nowrap',
    }}>
      /
    </span>
    <input
      type="text"
      className={styles.formInput}
      value={formData.slug}
      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
      placeholder="about-us"
      required
      style={{ flex: 1 }}
    />
  </div>
  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
    This will be the URL: <code>/{formData.slug || 'your-slug'}</code>
  </p>
</div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Excerpt (short description)</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="A short summary of this page"
            />
          </div>
        </div>

        {/* ============ FEATURED IMAGE ============ */}
        <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Featured Image
          </h3>

          {/* Show current image */}
          {formData.featuredImage && !featuredImageFile && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                Current Image:
              </p>
              <div style={{
                position: 'relative',
                width: '240px',
                height: '140px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
              }}>
                <img
                  src={formData.featuredImage}
                  alt="Featured"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          )}

          {/* New file selected preview */}
          {featuredImageFile && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#22c55e', marginBottom: '8px', fontWeight: '500' }}>
                ✓ New image selected: {featuredImageFile.name}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                This will replace the current image when you save.
              </p>
            </div>
          )}

          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFeaturedImageFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="edit-page-featured-image-upload"
            />
            <label htmlFor="edit-page-featured-image-upload" style={{ cursor: 'pointer', display: 'block' }}>
              <div className={styles.uploadIcon}>🖼️</div>
              <div className={styles.uploadText}>
                {featuredImageFile
                  ? `Selected: ${featuredImageFile.name}`
                  : formData.featuredImage
                  ? 'Click to replace image'
                  : 'Click to upload Featured Image'}
              </div>
            </label>
          </div>
        </div>

        {/* ============ CONTENT (QUILL EDITOR) ============ */}
        <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Page Content
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Content <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className={styles.editorContainer}>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                style={{ height: '350px' }}
              />
            </div>
          </div>
        </div>

        {/* ============ SETTINGS ============ */}
        <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Settings
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <select
              className={styles.formInput}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })}
              style={{ cursor: 'pointer' }}
            >
              <option value="published">Published (visible to public)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.showInFooter}
                onChange={(e) => setFormData({ ...formData, showInFooter: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span className={styles.formLabel} style={{ marginBottom: 0 }}>
                Show this page in the footer
              </span>
            </label>
          </div>
        </div>

        {/* ============ SEO META ============ */}
        <div className={styles.tableContainer} style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            SEO Meta Tags
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Meta Title</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.seoMeta.title}
              onChange={(e) => setFormData({
                ...formData,
                seoMeta: { ...formData.seoMeta, title: e.target.value }
              })}
              placeholder="About Us - AllAbout"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Meta Description</label>
            <textarea
              className={styles.formInput}
              value={formData.seoMeta.description}
              onChange={(e) => setFormData({
                ...formData,
                seoMeta: { ...formData.seoMeta, description: e.target.value }
              })}
              placeholder="Learn more about AllAbout platform"
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Meta Keywords</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.seoMeta.keywords}
              onChange={(e) => setFormData({
                ...formData,
                seoMeta: { ...formData.seoMeta, keywords: e.target.value }
              })}
              placeholder="about, allabout, blog"
            />
          </div>
        </div>

        {/* ============ ACTIONS ============ */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '40px' }}>
          <Link
            href="/admin/site-management/pages"
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '15px',
              background: 'white',
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={styles.btnPrimary}
            style={{ padding: '12px 32px', fontSize: '15px', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}