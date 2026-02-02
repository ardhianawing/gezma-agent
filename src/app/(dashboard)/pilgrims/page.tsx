import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockPilgrims } from '@/data/mock-pilgrims';

export default function PilgrimsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pilgrims"
        description="Manage your pilgrims data and track their journey"
        actions={
          <Link href="/pilgrims/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Pilgrim
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--gray-border)] bg-[var(--gray-100)]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--charcoal)]">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--charcoal)]">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--charcoal)]">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--charcoal)]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--charcoal)]">Documents</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-[var(--charcoal)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-border)]">
                {mockPilgrims.map((pilgrim) => (
                  <tr key={pilgrim.id} className="hover:bg-[var(--gray-100)]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-[var(--charcoal)]">{pilgrim.name}</p>
                      <p className="text-xs text-[var(--gray-600)]">{pilgrim.nik}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--gray-600)]">{pilgrim.email}</td>
                    <td className="px-6 py-4 text-sm text-[var(--gray-600)]">{pilgrim.phone}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pilgrim.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--gray-600)]">
                        {pilgrim.documents.filter(d => d.status === 'verified').length}/4
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/pilgrims/${pilgrim.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
