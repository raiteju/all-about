'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import styles from './dashboard/dashboard.module.css';
import { getMe, getMyNotifications, markNotificationAsRead } from '@/lib/api';

// Helper to normalize image URL (same as in other components)
const normalizeImageUrl = (url: string) => {
  if (!url) return '';
  // Replace backslashes with forward slashes
  let normalized = url.replace(/\\/g, '/');
  // Ensure it starts with a slash (if it's a relative path)
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
};

export default function DashboardHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState([]);

  // Refs for click-outside detection
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const freshUser = await getMe(token);
          setUser(freshUser);
          const notifs = await getMyNotifications(token);
          setNotifications(notifs);
        } catch (error) {
          console.error('Failed to load user/notifications');
        }
      }
    };
    fetchData();
  }, []);

  // Click outside handler for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close profile dropdown if click outside
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      // Close notification dropdown if click outside
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false); // Close dropdown before logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // When clicking a notification, mark it as read and remove it from the list!
  const handleNotificationClick = async (notifId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await markNotificationAsRead(notifId, token);
        setNotifications((prev: any) => prev.filter((n: any) => n._id !== notifId));
      }
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
    // Close notification dropdown after clicking a notification
    setIsNotifOpen(false);
  };

  // Normalize avatar URLs
  const userAvatar = normalizeImageUrl(user?.avatar) || 'https://i.pravatar.cc/150?img=5';
  const fallbackAvatar = 'https://i.pravatar.cc/150?img=5';

  return (
    <header className={styles.dashboardHeader}>
      <Link href="/dashboard" className={styles.dashboardLogo}>
        <Image src="/logo.svg" alt="AllAbout" width={120} height={40} priority />
      </Link>

      <div className={styles.dashboardActions}>
        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <div
            className={styles.dashboardNotif}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{ cursor: 'pointer' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notifications.length > 0 && (
              <span className={styles.notifBadge}>{notifications.length}</span>
            )}
          </div>

          {isNotifOpen && (
            <div style={{ position: 'absolute', top: '120%', right: '0', background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '16px', zIndex: '50', width: '350px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No new notifications.</p>
              ) : (
                notifications.map((notif: any) => {
                  const senderAvatar = normalizeImageUrl(notif.sender?.avatar) || fallbackAvatar;
                  return (
                    <Link
                      href={`/post/${notif.post?.slug}`}
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: '#333' }}
                    >
                      <Image
                        src={senderAvatar}
                        alt={notif.sender?.firstName || 'User'}
                        width={30}
                        height={30}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '14px' }}>{notif.sender?.firstName || 'User'} {notif.message}</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Profile Image with Dropdown */}
        <div className={styles.dashboardProfile} ref={profileRef}>
          <button
            className={styles.profileBtn}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <Image
              src={userAvatar}
              alt="Profile"
              width={40}
              height={40}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          </button>

          {isProfileOpen && (
            <div className={styles.profileDropdown}>
              <Link href="/dashboard/profile" className={styles.dropdownLink} onClick={() => setIsProfileOpen(false)}>
                Edit Profile
              </Link>
              <Link href="/dashboard/posts/new" className={styles.dropdownLink} onClick={() => setIsProfileOpen(false)}>
                Add New Post
              </Link>
              <button onClick={handleLogout} className={styles.dropdownLink}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}