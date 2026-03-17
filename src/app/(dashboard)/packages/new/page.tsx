'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { PackageForm } from '@/components/packages/package-form';
import type { PackageFormData } from '@/lib/validations/package';
import { useLanguage } from '@/lib/i18n';

export default function NewPackagePage() {
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { addToast } = useToast();
  const { t } = useLanguage();
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
        const message = body.error || t.packages.saveError;
        setError(message);
        addToast({ type: 'error', title: t.common.error, description: message });
        return;
      }

      addToast({ type: 'success', title: t.packages.saveSuccess });
      router.push('/packages');
    } catch {
      setError(t.common.errorNetwork);
      addToast({ type: 'error', title: t.common.errorNetwork });
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
