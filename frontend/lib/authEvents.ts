// ============================================
// Global event system to trigger AuthModal from anywhere
// ============================================

export const AUTH_MODAL_EVENT = 'openAuthModal';

export type AuthMode = 'login' | 'register';

export interface AuthModalDetail {
  mode: AuthMode;
}

// Dispatch from anywhere to open the AuthModal
export function openAuthModal(mode: AuthMode = 'login') {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent<AuthModalDetail>(AUTH_MODAL_EVENT, {
    detail: { mode },
  });
  window.dispatchEvent(event);
}