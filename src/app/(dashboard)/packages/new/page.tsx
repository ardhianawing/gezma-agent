'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PackageForm } from '@/components/packages/package-form';
import type { PackageFormData } from '@/lib/validations/package';

export default function NewPackagePage() {
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PackageFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Gagal menyimpan paket');
        return;
      }

      router.push('/packages');
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: c.textPrimary }}>
        Buat Paket Baru
      </h1>

      {error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '8px',
          backgroundColor: c.errorLight,
          color: c.error,
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <PackageForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/packages')}
        isLoading={isLoading}
      />
    </div>
  );
}
