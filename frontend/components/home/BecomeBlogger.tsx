'use client';

import styles from './BecomeBlogger.module.css';
import { openAuthModal } from '@/lib/authEvents';

interface BecomeBloggerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export default function BecomeBlogger({
  title,
  description,
  buttonText,
  buttonLink,
}: BecomeBloggerProps) {
  // Detect if the button should open the auth modal
  const isAuthAction = buttonLink === '/register' || buttonLink === '/login';

  const handleClick = () => {
    if (buttonLink === '/register') {
      openAuthModal('register');
    } else if (buttonLink === '/login') {
      openAuthModal('login');
    } else if (buttonLink) {
      // Fallback for custom links
      window.location.href = buttonLink;
    }
  };

  return (
    <div className="container">
      <section className={styles.ctaSection}>
        {/* Decorative Bubbles */}
        <div className={`${styles.bubble} ${styles.bubbleLarge}`}></div>
        <div className={`${styles.bubble} ${styles.bubbleSmall}`}></div>
        <div className={`${styles.bubble} ${styles.bubbleMedium}`}></div>

        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.buttonWrapper}>
          <button
            type="button"
            onClick={handleClick}
            className={styles.registerBtn}
          >
            {buttonText}
          </button>
        </div>
      </section>
    </div>
  );
}