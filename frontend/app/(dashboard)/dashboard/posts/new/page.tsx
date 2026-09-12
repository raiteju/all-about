'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from '../../profile.module.css';
import {
  createPost,
  uploadFeaturedImage,
  uploadAudio,
  uploadVideo,
  getAllCategories,
} from '@/lib/api';
import { analyzeSEO } from '@/lib/seoAnalyzer';
import SEOAnalysisPanel from '@/components/post/SEOAnalysisPanel';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Helper: format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function AddPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    tags: '',
    content: '',
    type: 'article',
    audioUrl: '',
    videoUrl: '',
    focusKeyword: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
  });

  const [audioSource, setAudioSource] = useState('upload');
  const [videoSource, setVideoSource] = useState('upload');

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (content: string) => {
    setFormData({ ...formData, content });
  };

  // 👇 Handle featured image selection + preview
  const handleFeaturedImageChange = (file: File | null) => {
    setFeaturedImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFeaturedImagePreview(url);
    } else {
      setFeaturedImagePreview('');
    }
  };

  // Remove selected file
  const handleRemoveFeaturedImage = () => {
    if (featuredImagePreview) {
      URL.revokeObjectURL(featuredImagePreview);
    }
    setFeaturedImageFile(null);
    setFeaturedImagePreview('');
  };

  const computedSlug = useMemo(() => {
    return formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }, [formData.title]);

  const seoResult = useMemo(() => {
    return analyzeSEO({
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      slug: computedSlug,
      tags: formData.tags,
      focusKeyword: formData.focusKeyword,
      featuredImage: featuredImagePreview || '',
      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,
    });
  }, [
    formData.title,
    formData.content,
    formData.excerpt,
    formData.tags,
    formData.focusKeyword,
    formData.seoTitle,
    formData.seoDescription,
    computedSlug,
    featuredImagePreview,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      let finalFeaturedImage = '';
      let finalAudioUrl = formData.audioUrl;
      let finalVideoUrl = formData.videoUrl;

      if (featuredImageFile)
        finalFeaturedImage = await uploadFeaturedImage(featuredImageFile, token);

      if (audioSource === 'upload' && audioFile)
        finalAudioUrl = await uploadAudio(audioFile, token);

      if (videoSource === 'upload' && videoFile)
        finalVideoUrl = await uploadVideo(videoFile, token);

      const postPayload = {
        ...formData,
        featuredImage: finalFeaturedImage,
        audioUrl: finalAudioUrl,
        videoUrl: finalVideoUrl,
        tags: formData.tags.split(',').map((tag) => tag.trim()),
      };

      await createPost(postPayload, token);
      alert('Post submitted successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'link',
    'image',
    'list',
    'align',
  ];

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.welcomeTitle}>
        Welcome! Good morning{' '}
        <span style={{ color: 'var(--primary-blue)' }}>Miruna</span>,
      </h1>
      <p className={styles.welcomeSubtitle}>
        View your dashboard, manage your posts, subscription and edit and profile.
      </p>
      <div className={styles.formSectionTitle}>✏️ Add Post</div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Post Type</label>
          <div className={styles.postTypeToggle}>
            <button
              type="button"
              className={`${styles.postTypeBtn} ${
                formData.type === 'article' ? styles.postTypeActive : ''
              }`}
              onClick={() =>
                setFormData({ ...formData, type: 'article', audioUrl: '', videoUrl: '' })
              }
            >
              Article
            </button>
            <button
              type="button"
              className={`${styles.postTypeBtn} ${
                formData.type === 'audio' ? styles.postTypeActive : ''
              }`}
              onClick={() => setFormData({ ...formData, type: 'audio', videoUrl: '' })}
            >
              Audio
            </button>
            <button
              type="button"
              className={`${styles.postTypeBtn} ${
                formData.type === 'video' ? styles.postTypeActive : ''
              }`}
              onClick={() => setFormData({ ...formData, type: 'video', audioUrl: '' })}
            >
              Video
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Post Title</label>
          <input
            type="text"
            name="title"
            className={styles.formInput}
            onChange={handleChange}
            value={formData.title}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Post Excerpt</label>
          <textarea
            name="excerpt"
            className={styles.formTextarea}
            onChange={handleChange}
            value={formData.excerpt}
          ></textarea>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category</label>
            <select
              name="category"
              className={styles.formSelect}
              onChange={handleChange}
              value={formData.category}
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : '--Select Category--'}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tags</label>
            <input
              type="text"
              name="tags"
              placeholder="comma, separated, tags"
              className={styles.formInput}
              onChange={handleChange}
              value={formData.tags}
            />
          </div>
        </div>

        {/* 👇 FEATURED IMAGE with PREVIEW */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Featured Image</label>

          {/* Preview of selected file */}
          {featuredImagePreview && (
            <div
              style={{
                marginBottom: '12px',
                position: 'relative',
                width: '240px',
                height: '150px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
              }}
            >
              <Image
                src={featuredImagePreview}
                alt="Featured preview"
                fill
                style={{ objectFit: 'cover' }}
                sizes="240px"
              />
            </div>
          )}

          {/* File info + remove button */}
          {featuredImageFile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '10px',
                fontSize: '13px',
                color: '#374151',
              }}
            >
              <span style={{ color: '#22c55e', fontWeight: 500 }}>
                ✓ {featuredImageFile.name}
              </span>
              <span style={{ color: '#9ca3af' }}>
                ({formatFileSize(featuredImageFile.size)})
              </span>
              <button
                type="button"
                onClick={handleRemoveFeaturedImage}
                style={{
                  padding: '4px 10px',
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ✕ Remove
              </button>
            </div>
          )}

          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFeaturedImageChange(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="featured-image-upload"
            />
            <label htmlFor="featured-image-upload" style={{ cursor: 'pointer' }}>
              <div className={styles.uploadIcon}>🖼️</div>
              <div className={styles.uploadText}>
                {featuredImageFile
                  ? 'Click to change image'
                  : 'Click to upload Featured Image'}
              </div>
            </label>
          </div>
        </div>

        {formData.type === 'audio' && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Audio Source</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setAudioSource('upload')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border:
                    audioSource === 'upload'
                      ? '2px solid var(--primary-blue)'
                      : '1px solid #ccc',
                  background: audioSource === 'upload' ? '#e0f2fe' : '#fff',
                }}
              >
                Upload Audio
              </button>
              <button
                type="button"
                onClick={() => setAudioSource('link')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border:
                    audioSource === 'link'
                      ? '2px solid var(--primary-blue)'
                      : '1px solid #ccc',
                  background: audioSource === 'link' ? '#e0f2fe' : '#fff',
                }}
              >
                External Link
              </button>
            </div>

            {audioSource === 'upload' && (
              <div className={styles.uploadBox}>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" style={{ cursor: 'pointer' }}>
                  <div className={styles.uploadIcon}>🎧</div>
                  <div className={styles.uploadText}>
                    {audioFile
                      ? `Selected: ${audioFile.name} (${formatFileSize(audioFile.size)})`
                      : 'Click to upload Audio File'}
                  </div>
                </label>
              </div>
            )}

            {audioSource === 'link' && (
              <input
                type="text"
                name="audioUrl"
                placeholder="Paste external audio link (e.g., https://example.com/audio.mp3)"
                className={styles.formInput}
                onChange={handleChange}
                value={formData.audioUrl}
              />
            )}
          </div>
        )}

        {formData.type === 'video' && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Video Source</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setVideoSource('upload')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border:
                    videoSource === 'upload'
                      ? '2px solid var(--primary-blue)'
                      : '1px solid #ccc',
                  background: videoSource === 'upload' ? '#e0f2fe' : '#fff',
                }}
              >
                Upload Video
              </button>
              <button
                type="button"
                onClick={() => setVideoSource('link')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border:
                    videoSource === 'link'
                      ? '2px solid var(--primary-blue)'
                      : '1px solid #ccc',
                  background: videoSource === 'link' ? '#e0f2fe' : '#fff',
                }}
              >
                External Link
              </button>
            </div>

            {videoSource === 'upload' && (
              <div className={styles.uploadBox}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                  id="video-upload"
                />
                <label htmlFor="video-upload" style={{ cursor: 'pointer' }}>
                  <div className={styles.uploadIcon}>🎬</div>
                  <div className={styles.uploadText}>
                    {videoFile
                      ? `Selected: ${videoFile.name} (${formatFileSize(videoFile.size)})`
                      : 'Click to upload Video File'}
                  </div>
                </label>
              </div>
            )}

            {videoSource === 'link' && (
              <input
                type="text"
                name="videoUrl"
                placeholder="Paste external video link (e.g., YouTube URL or MP4 link)"
                className={styles.formInput}
                onChange={handleChange}
                value={formData.videoUrl}
              />
            )}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Post Content</label>
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

        <SEOAnalysisPanel
          result={seoResult}
          focusKeyword={formData.focusKeyword}
          onFocusKeywordChange={(v) => setFormData({ ...formData, focusKeyword: v })}
          seoTitle={formData.seoTitle}
          onSeoTitleChange={(v) => setFormData({ ...formData, seoTitle: v })}
          seoDescription={formData.seoDescription}
          onSeoDescriptionChange={(v) =>
            setFormData({ ...formData, seoDescription: v })
          }
          seoKeywords={formData.seoKeywords}
          onSeoKeywordsChange={(v) => setFormData({ ...formData, seoKeywords: v })}
          ogImage={formData.ogImage}
          onOgImageChange={(v) => setFormData({ ...formData, ogImage: v })}
          previewTitle={formData.seoTitle || formData.title}
          previewDescription={formData.seoDescription || formData.excerpt}
          previewSlug={computedSlug}
        />

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Post'}
        </button>
      </form>
    </div>
  );
}