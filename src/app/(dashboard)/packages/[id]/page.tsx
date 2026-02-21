'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Package } from '@/types/package';

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const res = await fetch(`/api/packages/${id}`);
        if (!res.ok) throw new Error('Not found');
        setPkg(await res.json());
      } catch {
        setPkg(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [id]);

  const handleDelete = async () => {
    if (!pkg || !confirm(`Hapus paket "${pkg.name}"?`)) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/packages');
    } catch (err) {
      console.error('Failed to delete package:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;
  }

  if (!pkg) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--charcoal)]">Paket tidak ditemukan</p>
          <Link href="/packages">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/packages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={pkg.name}
          description={`${pkg.duration} days \u2022 ${pkg.category.toUpperCase()}`}
          actions={
            <div className="flex gap-2">
              <Link href={`/packages/${pkg.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4" />
                  Edit Package
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-[var(--gray-600)]">Published Price</p>
              <p className="text-2xl font-bold text-[var(--charcoal)]">{formatCurrency(pkg.publishedPrice)}</p>
            </div>
            {pkg.isPromo && pkg.promoPrice && (
              <div>
                <Badge variant="error">Promo Price</Badge>
                <p className="text-xl font-bold text-[var(--gezma-red)] mt-1">{formatCurrency(pkg.promoPrice)}</p>
              </div>
            )}
            <div className="pt-3 border-t border-[var(--gray-border)] space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--gray-600)]">HPP</span>
                <span>{formatCurrency(pkg.totalHpp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--gray-600)]">Margin</span>
                <span className="text-[var(--success)]">{pkg.margin}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotels */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hotels</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-medium text-[var(--charcoal)]">Makkah</p>
              <p className="text-sm text-[var(--gray-600)] mt-1">{pkg.makkahHotel}</p>
              <p className="text-sm text-[var(--gray-600)]">{pkg.makkahHotelRating} star &bull; {pkg.makkahHotelDistance}</p>
            </div>
            <div>
              <p className="font-medium text-[var(--charcoal)]">Madinah</p>
              <p className="text-sm text-[var(--gray-600)] mt-1">{pkg.madinahHotel}</p>
              <p className="text-sm text-[var(--gray-600)]">{pkg.madinahHotelRating} star &bull; {pkg.madinahHotelDistance}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Package Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--gray-600)]">{pkg.description}</p>
          </CardContent>
        </Card>

        {/* Inclusions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pkg.inclusions.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[var(--gray-600)]">
                  <span className="text-[var(--success)] mt-0.5">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Exclusions */}
        <Card>
          <CardHeader>
            <CardTitle>Not Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pkg.exclusions.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[var(--gray-600)]">
                  <span className="text-[var(--error)] mt-0.5">&#10007;</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
