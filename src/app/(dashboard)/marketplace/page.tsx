'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ComingSoon } from '@/components/shared/coming-soon';
import { ShoppingBag } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Marketplace"
        description="Pusat belanja kebutuhan operasional umrah"
      />
      <ComingSoon
        icon={ShoppingBag}
        title="Marketplace Segera Hadir"
        description="Temukan dan pesan kebutuhan operasional umrah langsung dari platform GEZMA — hotel, transportasi, asuransi, dan lainnya."
        features={[
          'Cari hotel Makkah & Madinah dengan harga terbaik',
          'Booking transportasi dan land arrangement',
          'Asuransi perjalanan dan handling agent',
          'Perbandingan harga dari berbagai vendor',
        ]}
      />
    </div>
  );
}
