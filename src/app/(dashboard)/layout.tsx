'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Sidebar - Fixed on desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content Wrapper - Brute force offset */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: '260px', width: 'calc(100% - 260px)' }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          className="flex-1 animate-fade-in relative z-0"
          style={{ padding: '32px' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
