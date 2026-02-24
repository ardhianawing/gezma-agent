'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import ChatWidget from '@/components/ai-assistant/ChatWidget';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { UpdatePrompt } from '@/components/pwa/update-prompt';
import { BrandingProvider, useBranding } from '@/lib/contexts/branding-context';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { c, setBrandingOverride } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { branding } = useBranding();

  useEffect(() => {
    if (branding.primaryColor && branding.primaryColor !== '#F60000') {
      setBrandingOverride({ primaryColor: branding.primaryColor });
    }
    return () => setBrandingOverride(null);
  }, [branding.primaryColor, setBrandingOverride]);

  const showSidebarOverlay = isMobile || isTablet;

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', backgroundColor: c.pageBg, transition: 'background-color 0.3s ease' }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isOverlay={showSidebarOverlay}
      />

      {/* Content Wrapper */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          marginLeft: showSidebarOverlay ? 0 : '260px',
          width: showSidebarOverlay ? '100vw' : 'calc(100vw - 260px)',
          maxWidth: showSidebarOverlay ? '100vw' : 'calc(100vw - 260px)',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} showMenuButton={showSidebarOverlay} />
        <main
          style={{
            flex: 1,
            padding: isMobile ? '16px' : isTablet ? '24px' : '32px',
            position: 'relative',
            zIndex: 0,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>
      </div>

      {/* PWA Components */}
      <OfflineIndicator />
      <InstallPrompt />
      <UpdatePrompt />

      {/* AI Assistant Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandingProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </BrandingProvider>
  );
}
