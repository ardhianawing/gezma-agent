'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'gezma-install-dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only show on mobile
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) return;

    // Check if permanently dismissed
    if (localStorage.getItem(DISMISSED_KEY)) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);

      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (!isMobile || !deferredPrompt || dismissed || !visible) return null;

  return (
    <>
      <style>{`
        @keyframes gezma-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .gezma-install-banner {
          animation: gezma-slide-up 0.3s ease-out forwards;
        }
      `}</style>
      <div
        className="gezma-install-banner"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          background: '#1E293B',
          borderTop: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          maxHeight: '60px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Download style={{ width: 16, height: 16, color: 'white' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', lineHeight: 1.2 }}>
            Install GEZMA Agent
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            Akses lebih cepat dari home screen
          </div>
        </div>

        <button
          onClick={handleInstall}
          style={{
            background: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Install
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Tutup"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </>
  );
}
