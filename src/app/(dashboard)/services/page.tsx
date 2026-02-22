'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ComingSoon } from '@/components/shared/coming-soon';
import { Headphones } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Layanan"
        description="Pusat bantuan dan layanan eksklusif untuk anggota GEZMA"
      />
      <ComingSoon
        icon={Headphones}
        title="Layanan Segera Hadir"
        description="Akses layanan eksklusif GEZMA — dari konsultasi operasional hingga bantuan teknis langsung."
        features={[
          'Live chat dengan tim support',
          'Konsultasi operasional umrah',
          'Bantuan teknis penggunaan platform',
          'Layanan prioritas untuk anggota premium',
        ]}
      />
    </div>
  );
}
