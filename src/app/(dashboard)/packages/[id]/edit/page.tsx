'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { PackageForm } from '@/components/packages/package-form';
import type { PackageFormData } from '@/lib/validations/package';
import type { Package } from '@/types/package';
import { FormSkeleton } from '@/components/shared/loading-skeleton';

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Package | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const res = await fetch(`/api/packages/${id}`);
        if (!res.ok) {
          setError('Gagal memuat data paket');
          return;
        }
        const data = await res.json();
        setInitialData(data);
      } catch {
        setError('Terjadi kesalahan jaringan');
      } finally {
        setIsFetching(false);
      }
    }
    fetchPackage();
  }, [id]);

  const handleSubmit = async (data: PackageFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        const message = body.error || 'Gagal memperbarui paket';
        setError(message);
        addToast({ type: 'error', title: 'Gagal memperbarui', description: message });
        return;
      }

      addToast({ type: 'success', title: 'Paket berhasil diperbarui' });
      router.push(`/packages/${id}`);
    } catch {
      setError('Terjadi kesalahan jaringan');
      addToast({ type: 'error', title: 'Terjadi kesalahan jaringan' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <FormSkeleton fields={8} />;
  }

  if (!initialData) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: c.error }}>
        {error || 'Paket tidak ditemukan'}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: c.textPrimary }}>
        Edit Paket
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
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/packages/${id}`)}
        isLoading={isLoading}
      />
    </div>
  );
}
