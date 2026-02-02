'use client';

import Link from 'next/link';
import { Plus, Star, Plane, Clock, Users, ArrowRight } from 'lucide-react';
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mockPackages.map((pkg) => (
          <Link key={pkg.id} href={`/packages/${pkg.id}`}>
            <Card className="h-full group cursor-pointer hover:border-[var(--gezma-red-light)] transition-all duration-200 hover:-translate-y-1">
              <CardContent className="p-0">
                {/* Header with gradient */}
                <div className="relative p-5 pb-4 bg-gradient-to-br from-[var(--gray-50)] to-white border-b border-[var(--gray-100)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--charcoal)] group-hover:text-[var(--gezma-red)] transition-colors">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-[var(--gray-500)] mt-0.5 uppercase tracking-wide font-medium">
                        {pkg.category}
                      </p>
                    </div>
                    {pkg.isPromo && (
                      <Badge variant="error" className="animate-pulse">
                        Promo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[var(--gray-600)] line-clamp-2">
                    {pkg.description}
                  </p>
                </div>

                {/* Features */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--info-light)]">
                      <Clock className="h-4 w-4 text-[var(--info)]" />
                    </div>
                    <div>
                      <p className="text-[var(--gray-500)] text-xs">Duration</p>
                      <p className="font-semibold text-[var(--charcoal)]">{pkg.duration} Days</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--success-light)]">
                      <Plane className="h-4 w-4 text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="text-[var(--gray-500)] text-xs">Airline</p>
                      <p className="font-semibold text-[var(--charcoal)]">{pkg.airline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--warning-light)]">
                      <Star className="h-4 w-4 text-[var(--warning)]" />
                    </div>
                    <div>
                      <p className="text-[var(--gray-500)] text-xs">Hotel Rating</p>
                      <div className="flex items-center gap-1">
                        {[...Array(pkg.makkahHotelRating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-[var(--warning)] text-[var(--warning)]" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with price */}
                <div className="p-5 pt-4 border-t border-[var(--gray-100)] bg-[var(--gray-50)]">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[var(--gray-500)] mb-1">Starting from</p>
                      {pkg.isPromo && pkg.promoPrice && (
                        <p className="text-sm text-[var(--gray-400)] line-through">
                          {formatCurrency(pkg.publishedPrice)}
                        </p>
                      )}
                      <p className="text-lg font-bold text-[var(--gezma-red)]">
                        {formatCurrency(pkg.isPromo && pkg.promoPrice ? pkg.promoPrice : pkg.publishedPrice)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="group-hover:bg-[var(--gezma-red)] group-hover:text-white group-hover:border-[var(--gezma-red)] transition-all">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
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
