'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ComingSoon } from '@/components/shared/coming-soon';
import { MessageSquare } from 'lucide-react';

export default function ForumPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Forum"
        description="Komunitas travel umrah Indonesia"
      />
      <ComingSoon
        icon={MessageSquare}
        title="Forum Segera Hadir"
        description="Bergabung dengan komunitas travel agent umrah se-Indonesia — diskusi, berbagi pengalaman, dan saling bantu."
        features={[
          'Diskusi topik seputar operasional umrah',
          'Tanya jawab dengan sesama travel agent',
          'Thread & kategori terorganisir',
          'Badge untuk kontributor aktif',
        ]}
      />
    </div>
  );
}
