'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { TripForm } from '@/components/trips/trip-form';
import type { TripFormData } from '@/lib/validations/trip';

interface PackageOption {
  id: string;
  name: string;
  publishedPrice: number;
}

export default function NewTripPage() {
  const router = useRouter();
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
        setError('Gagal memuat data paket');
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
        throw new Error(body.error || 'Gagal membuat trip');
      }

      router.push('/trips');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat trip');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trips">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader title="Buat Trip Baru" description="Isi informasi trip dan penerbangan" />
      </div>

      {error && (
        <div className="rounded-[12px] border border-[var(--error)] bg-[var(--error-light)] p-4 text-sm text-[var(--error)]">
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
