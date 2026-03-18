'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { TripForm } from '@/components/trips/trip-form';
import type { TripFormData } from '@/lib/validations/trip';
import type { Trip } from '@/types/trip';
import { useLanguage } from '@/lib/i18n';

interface PackageOption {
  id: string;
  name: string;
  publishedPrice: number;
}

export default function EditTripPage() {
  const params = useParams();
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const id = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripRes, pkgRes] = await Promise.all([
          fetch(`/api/trips/${id}`),
          fetch('/api/packages?isActive=true'),
        ]);

        if (!tripRes.ok) throw new Error(t.common.noData);
        if (!pkgRes.ok) throw new Error(t.common.error);

        const tripData = await tripRes.json();
        const pkgJson = await pkgRes.json();

        setTrip(tripData);
        setPackages(
          pkgJson.data.map((p: { id: string; name: string; publishedPrice: number }) => ({
            id: p.id,
            name: p.name,
            publishedPrice: p.publishedPrice,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : t.common.error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (data: TripFormData) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || t.common.error);
      }

      router.push(`/trips/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>{t.common.loadingData}</div>;
  }

  if (!trip) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary }}>
            {error || t.common.noData}
          </p>
          <Link href="/trips" style={{ textDecoration: 'none' }}>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '12px 24px',
                backgroundColor: c.cardBg,
                color: c.textSecondary,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Kembali ke Daftar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Transform trip data for the form (dates need to be YYYY-MM-DD strings)
  const initialData = {
    ...trip,
    departureDate: trip.departureDate ? new Date(trip.departureDate).toISOString().split('T')[0] : '',
    returnDate: trip.returnDate ? new Date(trip.returnDate).toISOString().split('T')[0] : '',
    registrationCloseDate: trip.registrationCloseDate
      ? new Date(trip.registrationCloseDate).toISOString().split('T')[0]
      : undefined,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href={`/trips/${id}`} style={{ textDecoration: 'none' }}>
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
            Ubah Perjalanan
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
            {trip.name}
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
        initialData={initialData}
        packages={packages}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/trips/${id}`)}
        isLoading={saving}
      />
    </div>
  );
}
