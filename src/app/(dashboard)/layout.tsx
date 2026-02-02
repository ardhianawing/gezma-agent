'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  const showSidebarOverlay = isMobile || isTablet;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.pageBg, transition: 'background-color 0.3s ease' }}>
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
          width: showSidebarOverlay ? '100%' : 'calc(100% - 260px)',
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
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
