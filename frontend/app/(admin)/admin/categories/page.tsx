'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../admin.module.css';
import { API_URL, uploadCategoryImage, uploadAdminImage } from '@/lib/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    // 👇 NEW: SEO fields
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
  });

  // Image upload state (featured image)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 👇 NEW: OG image upload state
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [uploadingOg, setUploadingOg] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      ogImage: '',
    });
    setImageFile(null);
    setOgImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Upload featured image if selected
      let finalImageUrl = formData.image;
      if (imageFile) {
        setUploadingImage(true);
        try {
          finalImageUrl = await uploadCategoryImage(imageFile, token);
        } catch (uploadErr: any) {
          alert(uploadErr.message || 'Failed to upload image');
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // 👇 Upload OG image if selected
      let finalOgImageUrl = formData.ogImage;
      if (ogImageFile) {
        setUploadingOg(true);
        try {
          finalOgImageUrl = await uploadAdminImage(ogImageFile, token);
        } catch (uploadErr: any) {
          alert(uploadErr.message || 'Failed to upload OG image');
          setUploadingOg(false);
          return;
        }
        setUploadingOg(false);
      }

      const url = editing
        ? `${API_URL}/api/admin/categories/${editing._id}`
        : `${API_URL}/api/admin/categories`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          image: finalImageUrl,
          ogImage: finalOgImageUrl,
        }),
      });

      if (res.ok) {
        closeModal();
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCategories();
      else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      seoKeywords: cat.seoKeywords || '',
      ogImage: cat.ogImage || '',
    });
    setImageFile(null);
    setOgImageFile(null);
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      ogImage: '',
    });
    setImageFile(null);
    setOgImageFile(null);
    setShowModal(true);
  };

  if (loading) return <div>Loading categories...</div>;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2>Categories</h2>
        <button onClick={openNew} className={styles.btnPrimary}>
          + Add Category
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: any) => (
              <tr key={cat._id}>
                <td>
                  {cat.image ? (
                    <div
                      style={{
                        position: 'relative',
                        width: '60px',
                        height: '40px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#f3f4f6',
                      }}
                    >
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="60px"
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '60px',
                        height: '40px',
                        borderRadius: '6px',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: '#9ca3af',
                      }}
                    >
                      🏷️
                    </div>
                  )}
                </td>
                <td>{cat.name}</td>
                <td>{cat.slug}</td>
                <td>{cat.description || '—'}</td>
                <td>
                  {cat.createdBy?.firstName} {cat.createdBy?.lastName}
                </td>
                <td>
                  <button
                    onClick={() => openEdit(cat)}
                    className={styles.btnOutline}
                    style={{ marginRight: '8px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className={styles.btnDanger}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editing ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={closeModal} className={styles.modalClose}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Featured Image */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Featured Image</label>

                {formData.image && !imageFile && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      Current image:
                    </p>
                    <div
                      style={{
                        position: 'relative',
                        width: '180px',
                        height: '100px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                      }}
                    >
                      <Image
                        src={formData.image}
                        alt="Current"
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="180px"
                      />
                    </div>
                  </div>
                )}

                {imageFile && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#22c55e',
                      marginBottom: '8px',
                      fontWeight: 500,
                    }}
                  >
                    ✓ New file selected: {imageFile.name}
                  </p>
                )}

                <div
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                    id="category-image-upload"
                  />
                  <label
                    htmlFor="category-image-upload"
                    style={{ cursor: 'pointer', display: 'block' }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>🖼️</div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        fontWeight: 500,
                      }}
                    >
                      {imageFile
                        ? 'Click to change file'
                        : formData.image
                        ? 'Click to replace image'
                        : 'Click to upload image'}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginTop: '4px',
                      }}
                    >
                      JPG, PNG, WebP · Max 10MB · Uploads to Cloudinary
                    </div>
                  </label>
                </div>

                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="Or paste an image URL"
                  style={{ marginTop: '10px' }}
                />
                <p
                  style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    marginTop: '4px',
                  }}
                >
                  Tip: Uploaded file takes priority over URL when saving.
                </p>
              </div>

              {/* ============================================
                  👇 NEW: SEO SECTION
                  ============================================ */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '2px solid #f0f0f0',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: '4px',
                  }}
                >
                  🔍 SEO Settings
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '16px',
                  }}
                >
                  Optional. Leave empty to auto-generate from name and description.
                </p>

                {/* Meta Title */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Meta Title{' '}
                    <span
                      style={{
                        fontSize: '11px',
                        color:
                          (formData.seoTitle || formData.name).length > 60
                            ? '#ef4444'
                            : '#9ca3af',
                        fontWeight: 400,
                        marginLeft: '4px',
                      }}
                    >
                      ({(formData.seoTitle || formData.name).length}/60)
                    </span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder={`${formData.name || 'Category'} - AllAbout`}
                    maxLength={70}
                  />
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      marginTop: '4px',
                    }}
                  >
                    Aim for 50-60 characters.
                  </p>
                </div>

                {/* Meta Description */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Meta Description{' '}
                    <span
                      style={{
                        fontSize: '11px',
                        color:
                          (formData.seoDescription || formData.description)
                            .length > 160
                            ? '#ef4444'
                            : '#9ca3af',
                        fontWeight: 400,
                        marginLeft: '4px',
                      }}
                    >
                      (
                      {(formData.seoDescription || formData.description).length}
                      /160)
                    </span>
                  </label>
                  <textarea
                    className={styles.formInput}
                    value={formData.seoDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder={
                      formData.description || 'Brief description for search results'
                    }
                    rows={3}
                    maxLength={180}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      marginTop: '4px',
                    }}
                  >
                    Aim for 150-160 characters.
                  </p>
                </div>

                {/* Meta Keywords */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Meta Keywords</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      setFormData({ ...formData, seoKeywords: e.target.value })
                    }
                    placeholder="comma, separated, keywords"
                  />
                </div>

                {/* OG Image */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    OG Image (Social Share Preview)
                  </label>

                  {formData.ogImage && !ogImageFile && (
                    <div style={{ marginBottom: '12px' }}>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '6px',
                        }}
                      >
                        Current OG image:
                      </p>
                      <div
                        style={{
                          position: 'relative',
                          width: '180px',
                          height: '95px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb',
                          background: '#f9fafb',
                        }}
                      >
                        <Image
                          src={formData.ogImage}
                          alt="OG"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="180px"
                        />
                      </div>
                    </div>
                  )}

                  {ogImageFile && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#22c55e',
                        marginBottom: '8px',
                        fontWeight: 500,
                      }}
                    >
                      ✓ New OG file: {ogImageFile.name}
                    </p>
                  )}

                  <div
                    style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      background: '#f9fafb',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setOgImageFile(e.target.files?.[0] || null)}
                      style={{ display: 'none' }}
                      id="category-og-upload"
                    />
                    <label
                      htmlFor="category-og-upload"
                      style={{ cursor: 'pointer', display: 'block' }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '4px' }}>
                        📱
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: 500,
                        }}
                      >
                        {ogImageFile
                          ? 'Click to change'
                          : formData.ogImage
                          ? 'Click to replace OG image'
                          : 'Click to upload OG image'}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          marginTop: '2px',
                        }}
                      >
                        Recommended 1200×630px · Leave empty to use Featured Image
                      </div>
                    </label>
                  </div>

                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.ogImage}
                    onChange={(e) =>
                      setFormData({ ...formData, ogImage: e.target.value })
                    }
                    placeholder="Or paste OG image URL"
                    style={{ marginTop: '10px' }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={styles.btnPrimary}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  opacity: uploadingImage || uploadingOg ? 0.6 : 1,
                }}
                disabled={uploadingImage || uploadingOg}
              >
                {uploadingImage
                  ? 'Uploading image...'
                  : uploadingOg
                  ? 'Uploading OG image...'
                  : editing
                  ? 'Update'
                  : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}