import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Secara global me-reset posisi scroll layar ke paling atas (top: 0, left: 0)
 * setiap kali terjadi perpindahan rute/halaman (pathname) pada React Router.
 * Jika URL menyertakan anchor hash (#id), halaman akan melakukan scroll ke target elemen.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // Navigasi halaman biasa -> scroll langsung ke paling atas
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Reset juga scroll container utama jika ada (layout dengan fixed header / sidebar)
      const main = document.querySelector('main');
      if (main) {
        if (typeof main.scrollTo === 'function') {
          main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
        main.scrollTop = 0;
      }
    } else {
      // Anchor link di halaman yang sama -> smooth scroll ke target ID
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }
  }, [pathname, hash]);

  return null;
}
