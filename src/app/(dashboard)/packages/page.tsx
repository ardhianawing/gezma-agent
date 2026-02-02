import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPackages } from '@/data/mock-packages';
import { formatCurrency } from '@/lib/utils';

export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        description="Manage your umrah packages and itineraries"
        actions={
          <Link href="/packages/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Package
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockPackages.map((pkg) => (
          <Link key={pkg.id} href={`/packages/${pkg.id}`}>
            <Card className="h-full transition-shadow hover:shadow-[var(--shadow-md)] cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-[var(--charcoal)]">{pkg.name}</h3>
                  {pkg.isPromo && <Badge variant="error">Promo</Badge>}
                </div>
                <p className="text-sm text-[var(--gray-600)] mb-4 line-clamp-2">{pkg.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--gray-600)]">Duration</span>
                    <span className="font-medium text-[var(--charcoal)]">{pkg.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--gray-600)]">Airline</span>
                    <span className="font-medium text-[var(--charcoal)]">{pkg.airline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--gray-600)]">Hotel</span>
                    <span className="font-medium text-[var(--charcoal)]">{pkg.makkahHotelRating}⭐</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--gray-border)]">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[var(--gray-600)]">Starting from</p>
                      {pkg.isPromo && pkg.promoPrice && (
                        <p className="text-sm text-[var(--gray-600)] line-through">{formatCurrency(pkg.publishedPrice)}</p>
                      )}
                      <p className="text-xl font-bold text-[var(--gezma-red)]">
                        {formatCurrency(pkg.isPromo && pkg.promoPrice ? pkg.promoPrice : pkg.publishedPrice)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
