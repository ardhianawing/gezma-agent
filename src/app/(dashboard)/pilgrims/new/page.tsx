'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewPilgrimPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save - redirect to list
    router.push('/pilgrims');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pilgrims">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader title="Add New Pilgrim" description="Enter pilgrim information" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" required placeholder="Ahmad Fauzi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK *</Label>
                <Input id="nik" required placeholder="3201234567890001" maxLength={16} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required placeholder="ahmad@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" required placeholder="081234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Birth Place *</Label>
                <Input id="birthPlace" required placeholder="Jakarta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date *</Label>
                <Input id="birthDate" type="date" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea id="address" required placeholder="Jl. Merdeka No. 123..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" required placeholder="Jakarta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Input id="province" required placeholder="DKI Jakarta" />
              </div>
            </div>

            <div className="border-t border-[var(--gray-border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-4">Emergency Contact</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Name *</Label>
                  <Input id="emergencyName" required placeholder="Fatimah" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone *</Label>
                  <Input id="emergencyPhone" required placeholder="081234567891" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelation">Relation *</Label>
                  <Input id="emergencyRelation" required placeholder="Istri" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/pilgrims">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Save Pilgrim</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
