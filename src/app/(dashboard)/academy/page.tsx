'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ComingSoon } from '@/components/shared/coming-soon';
import { GraduationCap } from 'lucide-react';

export default function AcademyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Akademi"
        description="Pusat pembelajaran untuk travel agent umrah profesional"
      />
      <ComingSoon
        icon={GraduationCap}
        title="Akademi Segera Hadir"
        description="Tingkatkan kompetensi tim Anda dengan kursus dan sertifikasi khusus untuk travel agent umrah."
        features={[
          'Kursus manajemen operasional umrah',
          'Pelatihan handling jemaah',
          'Sertifikasi profesional',
          'Learning path dari pemula hingga mahir',
        ]}
      />
    </div>
  );
}
