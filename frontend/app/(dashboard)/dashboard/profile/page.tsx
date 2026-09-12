'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../profile.module.css';
import { getMe, updateMe } from '@/lib/api';

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    website: '',
    email: '',
    password: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    github: '' 
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }
        const user = await getMe(token);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          bio: user.bio || '',
          website: user.website || '',
          email: user.email || '',
          password: '',
          facebook: user.socialLinks?.facebook || '',
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          instagram: user.socialLinks?.instagram || '',
          github: user.socialLinks?.github || '' 
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const payload = new FormData();
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('bio', formData.bio);
      payload.append('website', formData.website);
      payload.append('socialLinks', JSON.stringify({
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        github: formData.github
      }));

      if (formData.password) payload.append('password', formData.password);
      if (profileImage) payload.append('profileImage', profileImage);
      if (coverImage) payload.append('coverImage', coverImage);

      await updateMe(payload, token);
      alert('Profile updated successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className={styles.formContainer}>Loading profile...</div>;

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.welcomeTitle}>Welcome! Good morning <span style={{ color: 'var(--primary-blue)' }}>{formData.firstName || 'User'}</span>,</h1>
      <p className={styles.welcomeSubtitle}>View your dashboard, manage your posts, subscription and edit and profile.</p>
      <div className={styles.formSectionTitle}>✏️ Edit Profile</div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Change Profile Picture</label>
          <div className={styles.uploadBox}>
            <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} style={{ display: 'none' }} id="profile-upload" />
            <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
              <div className={styles.uploadIcon}>📷</div>
              <div className={styles.uploadText}>{profileImage ? profileImage.name : 'Click to upload profile picture'}</div>
            </label>
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={styles.formInput} />
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Current Password</label>
            <input type="password" placeholder="Leave empty to keep current" className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>New Password</label>
            <input type="password" name="password" placeholder="Enter new password" value={formData.password} onChange={handleChange} className={styles.formInput} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formInput} disabled />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Website</label>
          <input type="text" name="website" placeholder="https://example.com" value={formData.website} onChange={handleChange} className={styles.formInput} />
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Facebook URL</label>
            <input type="text" name="facebook" placeholder="https://facebook.com/..." value={formData.facebook} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Twitter URL</label>
            <input type="text" name="twitter" placeholder="https://twitter.com/..." value={formData.twitter} onChange={handleChange} className={styles.formInput} />
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>LinkedIn URL</label>
            <input type="text" name="linkedin" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Instagram URL</label>
            <input type="text" name="instagram" placeholder="https://instagram.com/..." value={formData.instagram} onChange={handleChange} className={styles.formInput} />
          </div>
        </div>

        {/* NEW: GitHub URL */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>GitHub URL</label>
          <input type="text" name="github" placeholder="https://github.com/..." value={formData.github} onChange={handleChange} className={styles.formInput} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Bio</label>
          <textarea name="bio" placeholder="Tell us about yourself..." value={formData.bio} onChange={handleChange} className={styles.formTextarea} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Cover Picture</label>
          <div className={styles.uploadBox}>
            <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} style={{ display: 'none' }} id="cover-upload" />
            <label htmlFor="cover-upload" style={{ cursor: 'pointer' }}>
              <div className={styles.uploadIcon}>🖼️</div>
              <div className={styles.uploadText}>{coverImage ? coverImage.name : 'Change Cover Picture'}</div>
            </label>
          </div>
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <button type="submit" className={styles.submitBtn} disabled={isSaving}>
          {isSaving ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}