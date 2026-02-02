'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useTheme } from '@/lib/theme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { c } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.pageBg, transition: 'background-color 0.3s ease' }}>
      {/* Sidebar - Fixed on left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content Wrapper - Offset by sidebar width */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          marginLeft: '260px',
          width: 'calc(100% - 260px)',
          transition: 'all 0.3s ease',
        }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          style={{
            flex: 1,
            padding: '32px',
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
