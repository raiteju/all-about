'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from '../../../profile.module.css';
import {
  getPostById,
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

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    type: 'article',
    audioUrl: '',
    videoUrl: '',
    featuredImage: '',
    focusKeyword: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [audioSource, setAudioSource] = useState<'upload' | 'link'>('upload');
  const [videoSource, setVideoSource] = useState<'upload' | 'link'>('upload');

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [postSlug, setPostSlug] = useState('');

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (typeof id === 'string') {
          const post = await getPostById(id);
          setFormData({
            title: post.title || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            category: post.category || '',
            tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
            type: post.type || 'article',
            audioUrl: post.audioUrl || '',
            videoUrl: post.videoUrl || '',
            featuredImage: post.featuredImage || '',
            focusKeyword: post.focusKeyword || '',
            seoTitle: post.seoTitle || '',
            seoDescription: post.seoDescription || '',
            seoKeywords: post.seoKeywords || '',
            ogImage: post.ogImage || '',
          });
          setPostSlug(post.slug || '');

          if (
            post.audioUrl &&
            !post.audioUrl.startsWith('http://res.cloudinary.com')
          ) {
            setAudioSource('link');
          }
          if (
            post.videoUrl &&
            !post.videoUrl.startsWith('http://res.cloudinary.com')
          ) {
            setVideoSource('link');
          }
        }
      } catch (err) {
        setError('Failed to fetch post');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleContentChange = (content: string) => {
    setFormData({ ...formData, content });
  };

  // 👇 Handle new featured image + preview
  const handleFeaturedImageChange = (file: File | null) => {
    if (featuredImagePreview) {
      URL.revokeObjectURL(featuredImagePreview);
    }
    setFeaturedImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFeaturedImagePreview(url);
    } else {
      setFeaturedImagePreview('');
    }
  };

  // Remove new file selection (revert to existing)
  const handleRemoveNewFeaturedImage = () => {
    if (featuredImagePreview) {
      URL.revokeObjectURL(featuredImagePreview);
    }
    setFeaturedImageFile(null);
    setFeaturedImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      let finalFeaturedImage = formData.featuredImage;
      let finalAudioUrl = formData.audioUrl;
      let finalVideoUrl = formData.videoUrl;

      if (featuredImageFile) {
        finalFeaturedImage = await uploadFeaturedImage(featuredImageFile, token);
      }

      if (audioSource === 'upload' && audioFile) {
        finalAudioUrl = await uploadAudio(audioFile, token);
      }

      if (videoSource === 'upload' && videoFile) {
        finalVideoUrl = await uploadVideo(videoFile, token);
      }

      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          featuredImage: finalFeaturedImage,
          audioUrl: finalAudioUrl,
          videoUrl: finalVideoUrl,
          tags: formData.tags.split(',').map((t: string) => t.trim()),
        }),
      });
      if (res.ok) {
        alert('Post updated successfully!');
        router.push('/dashboard');
      } else {
        setError('Failed to update post');
      }
    } catch (err) {
      setError('Failed to update post');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const seoResult = useMemo(() => {
    return analyzeSEO({
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      slug: postSlug,
      tags: formData.tags,
      focusKeyword: formData.focusKeyword,
      featuredImage: featuredImagePreview || formData.featuredImage,
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
    formData.featuredImage,
    featuredImagePreview,
    postSlug,
  ]);

  if (isLoading) return <div className={styles.formContainer}>Loading...</div>;

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
        <span style={{ color: 'var(--primary-blue)' }}>Tej</span>,
      </h1>
      <p className={styles.welcomeSubtitle}>
        View your dashboard, manage your posts, subscription and edit and profile.
      </p>
      <div className={styles.formSectionTitle}>✏️ Edit Post</div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Post Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Post Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            className={styles.formTextarea}
          ></textarea>
        </div>

        {/* 👇 FEATURED IMAGE with PREVIEW */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Featured Image</label>

          {/* Case 1: New file selected → show new preview */}
          {featuredImagePreview && (
            <div style={{ marginBottom: '12px' }}>
              <p
                style={{
                  fontSize: '12px',
                  color: '#22c55e',
                  fontWeight: 500,
                  marginBottom: '6px',
                }}
              >
                ✓ New image (will replace current on save):
              </p>
              <div
                style={{
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
                  alt="New featured preview"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="240px"
                />
              </div>
            </div>
          )}

          {/* Case 2: No new file, but existing image → show current */}
          {!featuredImagePreview && formData.featuredImage && (
            <div style={{ marginBottom: '12px' }}>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: 500,
                  marginBottom: '6px',
                }}
              >
                Current image:
              </p>
              <div
                style={{
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
                  src={formData.featuredImage}
                  alt="Current featured"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="240px"
                />
              </div>
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
                onClick={handleRemoveNewFeaturedImage}
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
              id="featured-upload"
            />
            <label htmlFor="featured-upload" style={{ cursor: 'pointer' }}>
              <div className={styles.uploadIcon}>🖼️</div>
              <div className={styles.uploadText}>
                {featuredImageFile
                  ? 'Click to change image'
                  : formData.featuredImage
                  ? 'Click to replace image'
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
                value={formData.audioUrl}
                placeholder="Paste external audio link (e.g., https://example.com/audio.mp3)"
                className={styles.formInput}
                onChange={handleChange}
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
                value={formData.videoUrl}
                placeholder="Paste external video link (e.g., YouTube URL or MP4 link)"
                className={styles.formInput}
                onChange={handleChange}
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

        <div className={styles.twoColRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.formSelect}
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
              value={formData.tags}
              onChange={handleChange}
              className={styles.formInput}
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
          previewSlug={postSlug}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className={styles.submitBtn}>
          Update Post
        </button>
      </form>
    </div>
  );
}