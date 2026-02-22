'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ComingSoon } from '@/components/shared/coming-soon';
import { Globe } from 'lucide-react';

export default function TradePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="GEZMA Trade Centre"
        description="Ekspor produk Nusantara ke dunia — difasilitasi & dikurasi"
      />
      <ComingSoon
        icon={Globe}
        title="Trade Centre Segera Hadir"
        description="Platform untuk memasarkan dan mengekspor produk unggulan Indonesia ke pasar internasional melalui jaringan GEZMA."
        features={[
          'Katalog produk dengan sertifikasi halal',
          'Fasilitasi ekspor ke negara tujuan',
          'Kurasi produk oleh tim GEZMA',
          'Dashboard tracking pengajuan produk',
        ]}
      />
    </div>
  );
}
