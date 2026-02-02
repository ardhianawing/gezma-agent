import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPackages } from '@/data/mock-packages';
import { formatCurrency } from '@/lib/utils';

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  const pkg = mockPackages.find((p) => p.id === params.id);

  if (!pkg) {
    return <div>Package not found</div>;
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
          description={`${pkg.duration} days • ${pkg.category.toUpperCase()}`}
          actions={
            <Link href={`/packages/${pkg.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4" />
                Edit Package
              </Button>
            </Link>
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
              <p className="text-sm text-[var(--gray-600)]">{pkg.makkahHotelRating}⭐ • {pkg.makkahHotelDistance}</p>
            </div>
            <div>
              <p className="font-medium text-[var(--charcoal)]">Madinah</p>
              <p className="text-sm text-[var(--gray-600)] mt-1">{pkg.madinahHotel}</p>
              <p className="text-sm text-[var(--gray-600)]">{pkg.madinahHotelRating}⭐ • {pkg.madinahHotelDistance}</p>
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
                  <span className="text-[var(--success)] mt-0.5">✓</span>
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
                  <span className="text-[var(--error)] mt-0.5">✗</span>
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
