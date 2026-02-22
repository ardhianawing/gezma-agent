'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ComingSoon } from '@/components/shared/coming-soon';
import { Newspaper } from 'lucide-react';

export default function NewsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Berita"
        description="Informasi terkini seputar umrah, regulasi Saudi, dan update GEZMA"
      />
      <ComingSoon
        icon={Newspaper}
        title="Berita Segera Hadir"
        description="Dapatkan berita terbaru seputar regulasi umrah, kebijakan Saudi Arabia, dan update fitur GEZMA."
        features={[
          'Update regulasi Kemenag & Saudi Arabia',
          'Berita industri umrah dan haji',
          'Pengumuman fitur baru GEZMA',
          'Tips operasional untuk travel agent',
        ]}
      />
    </div>
  );
}
