export const API_URL = 'http://localhost:5000';

// ============================================
// ⚡ CACHING STRATEGY
// ============================================
// - Public reads → revalidate 60s (fast + fresh enough)
// - Public reads that change rarely → revalidate 300s
// - Auth-protected reads → no-store (must be fresh)
// - Writes (POST/PUT/DELETE) → not cached anyway
// ============================================

// Get all posts (homepage, trending)
export async function getPosts() {
  const res = await fetch(`${API_URL}/api/posts`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

// Get posts by author (author profile page)
export async function getPostsByAuthor(authorId) {
  const res = await fetch(`${API_URL}/api/posts/author/${authorId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch author posts');
  return res.json();
}

// Get posts by type (Homepage audio/video sections)
export async function getPostsByType(type) {
  const res = await fetch(`${API_URL}/api/posts/type/${type}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch media posts');
  return res.json();
}

// Get single post by slug (Public — used for reading)
export async function getPostBySlug(slug) {
  const res = await fetch(`${API_URL}/api/posts/slug/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

// Get single post by ID (For Editing — MUST be fresh)
export async function getPostById(postId) {
  const res = await fetch(`${API_URL}/api/posts/id/${postId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

// Get my posts with Pagination (Protected — MUST be fresh)
export async function getMyPosts(token, page = 1) {
  const res = await fetch(`${API_URL}/api/posts/my?page=${page}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch my posts');
  return data;
}

// Create a new post (Protected — mutation, not cached)
export async function createPost(postData, token) {
  const res = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create post');
  return data;
}

// Update Post Status (Protected — mutation)
export async function updatePostStatus(postId, status, token) {
  const res = await fetch(`${API_URL}/api/posts/${postId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update status');
  return data;
}

// Toggle Like on a post (Protected — mutation)
export async function toggleLike(postId, token) {
  const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to like post');
  return data;
}

// Comments — shorter cache (30s) since they change often
export async function getComments(postId) {
  const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function createComment(postId, content, token, parentId = null) {
  const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, parentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create comment');
  return data;
}

// Like a comment (Protected — mutation)
export async function likeComment(postId, commentId, token) {
  const res = await fetch(
    `${API_URL}/api/posts/${postId}/comments/${commentId}/like`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to like comment');
  return data;
}

// Notifications (Protected — MUST be fresh)
export async function getMyNotifications(token) {
  const res = await fetch(`${API_URL}/api/posts/notifications/my`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

// Mark a notification as Read (Protected — mutation)
export async function markNotificationAsRead(notifId, token) {
  const res = await fetch(
    `${API_URL}/api/posts/notifications/read/${notifId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || 'Failed to mark notification as read');
  return data;
}

// Upload Featured Image (Protected — mutation)
export async function uploadFeaturedImage(file, token) {
  const formData = new FormData();
  formData.append('featuredImage', file);

  const res = await fetch(`${API_URL}/api/posts/upload/featured-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload image');
  return data.url;
}

// Upload Audio (Protected — mutation)
export async function uploadAudio(file, token) {
  const formData = new FormData();
  formData.append('audio', file);

  const res = await fetch(`${API_URL}/api/posts/upload/audio`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload audio');
  return data.url;
}

// Upload Video (Protected — mutation)
export async function uploadVideo(file, token) {
  const formData = new FormData();
  formData.append('video', file);

  const res = await fetch(`${API_URL}/api/posts/upload/video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload video');
  return data.url;
}

// Get All Authors (Homepage — changes rarely, cache 5 min)
export async function getAllAuthors() {
  const res = await fetch(`${API_URL}/api/auth/all`, {
    next: { revalidate: 300 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch authors');
  return data;
}

// Get Public Author Profile (Author page — cache 60s)
export async function getAuthorProfile(username) {
  const res = await fetch(`${API_URL}/api/auth/profile/${username}`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch author');
  return data;
}

// Get Author Dashboard (Public — cache 60s)
export async function getAuthorDashboard(authorId, page = 1, type = 'articles') {
  const res = await fetch(
    `${API_URL}/api/posts/dashboard/${authorId}?page=${page}&type=${type}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || 'Failed to fetch author dashboard');
  return data;
}

// Auth & Profile — MUST be fresh
export async function getMe(token) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data;
}

export async function updateMe(formData, token) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  localStorage.setItem('user', JSON.stringify(data));
  return data;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function loginUser(userData) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

// Google OAuth Login (mutation — sends Google id_token to backend, receives our JWT)
export async function googleLogin(credential) {
  const res = await fetch(`${API_URL}/api/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Google login failed');
  return data;
}

// Forgot Password (mutation)
export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send reset link');
  return data;
}

// Get Explore Posts (Paginated by type — cache 60s)
export async function getExplorePosts(type, page = 1, limit = 12) {
  const res = await fetch(
    `${API_URL}/api/posts/explore/${type}?page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
  return data;
}

// Get Posts By Category (Paginated — cache 60s)
export async function getPostsByCategory(slug, page = 1, limit = 12) {
  const res = await fetch(
    `${API_URL}/api/categories/${slug}/posts?page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch category posts');
  return data;
}

// Newsletter - Subscribe (mutation)
export async function subscribeToNewsletter(email, source = 'footer') {
  const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to subscribe');
  return data;
}

// Upload Category Image (Admin — mutation)
export async function uploadCategoryImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/api/admin/categories/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      'Upload failed. The file may be too large (max 10MB) or in an unsupported format.'
    );
  }

  if (!res.ok) throw new Error(data.message || 'Failed to upload image');
  return data.url;
}

// Get Top Categories (sidebar/footer — cache 5 min)
export async function getTopCategories(limit = 6) {
  try {
    const res = await fetch(`${API_URL}/api/categories/top?limit=${limit}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('Failed to fetch top categories:', err);
    return [];
  }
}

// Get All Categories (post editor + admin — cache 60s)
export async function getAllCategories() {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

// Get All Tags (sidebar — cache 5 min)
export async function getAllTags(limit = 0) {
  try {
    const url =
      limit > 0
        ? `${API_URL}/api/posts/tags?limit=${limit}`
        : `${API_URL}/api/posts/tags`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('Failed to fetch tags:', err);
    return [];
  }
}

// Get Posts By Tag (Paginated — cache 60s)
export async function getPostsByTag(slug, page = 1, limit = 12) {
  const res = await fetch(
    `${API_URL}/api/posts/tag/${slug}?page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tag posts');
  return data;
}

// Submit Contact Form (Public — mutation)
export async function submitContactForm(formData) {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Server error. Please try again.');
  }

  if (!res.ok) {
    const error = new Error(data.message || 'Failed to send message');
    error.fieldErrors = data.errors;
    throw error;
  }

  return data;
}

// Upload General Admin Image (hero, CTA, OG — mutation)
export async function uploadAdminImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/api/admin/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      'Upload failed. The file may be too large (max 10MB) or in an unsupported format.'
    );
  }

  if (!res.ok) throw new Error(data.message || 'Failed to upload image');
  return data.url;
}