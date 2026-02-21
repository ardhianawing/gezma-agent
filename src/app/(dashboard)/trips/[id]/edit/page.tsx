'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { TripForm } from '@/components/trips/trip-form';
import type { TripFormData } from '@/lib/validations/trip';
import type { Trip } from '@/types/trip';

interface PackageOption {
  id: string;
  name: string;
  publishedPrice: number;
}

export default function EditTripPage() {
  const params = useParams();
  const router = useRouter();
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

        if (!tripRes.ok) throw new Error('Trip tidak ditemukan');
        if (!pkgRes.ok) throw new Error('Gagal memuat paket');

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
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
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
        throw new Error(body.error || 'Gagal mengupdate trip');
      }

      router.push(`/trips/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate trip');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--charcoal)]">{error || 'Trip tidak ditemukan'}</p>
          <Link href="/trips">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Button>
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/trips/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader title="Edit Trip" description={trip.name} />
      </div>

      {error && (
        <div className="rounded-[12px] border border-[var(--error)] bg-[var(--error-light)] p-4 text-sm text-[var(--error)]">
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
