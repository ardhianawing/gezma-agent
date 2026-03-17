'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { TripForm } from '@/components/trips/trip-form';
import type { TripFormData } from '@/lib/validations/trip';
import { useLanguage } from '@/lib/i18n';

interface PackageOption {
  id: string;
  name: string;
  publishedPrice: number;
}

export default function NewTripPage() {
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch('/api/packages?isActive=true');
        if (!res.ok) throw new Error('Failed to fetch packages');
        const json = await res.json();
        setPackages(
          json.data.map((p: { id: string; name: string; publishedPrice: number }) => ({
            id: p.id,
            name: p.name,
            publishedPrice: p.publishedPrice,
          }))
        );
      } catch {
        setError(t.trips.loadPackagesError);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const handleSubmit = async (data: TripFormData) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || t.trips.createError);
      }

      router.push('/trips');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.trips.createError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>{t.common.loadingData}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/trips" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px', color: c.textMuted }} />
          </div>
        </Link>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            Buat Trip Baru
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
            Isi informasi trip dan penerbangan
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            borderRadius: '12px',
            border: `1px solid ${c.error}`,
            backgroundColor: c.errorLight,
            padding: '16px',
            fontSize: '14px',
            color: c.error,
          }}
        >
          {error}
        </div>
      )}

      <TripForm
        packages={packages}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/trips')}
        isLoading={saving}
      />
    </div>
  );
}
