'use client';

import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { Input } from '@/components/ui/input';

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

      {/* Filters & Search */}
      <Card className="border-[var(--gray-200)]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--gray-400)]" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-12 bg-[var(--gray-50)] border-[var(--gray-200)] focus:bg-white"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--gray-50)] border-b border-[var(--gray-200)]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--gray-600)]">
                  Pilgrim
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--gray-600)]">
                  Contact
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--gray-600)]">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--gray-600)]">
                  Documents
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--gray-600)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-100)]">
              {mockPilgrims.map((pilgrim, index) => (
                <tr
                  key={pilgrim.id}
                  className="group hover:bg-[var(--gray-50)] transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gezma-red)] to-[var(--gezma-red-hover)] text-white font-semibold text-sm shadow-sm">
                        {pilgrim.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--charcoal)]">{pilgrim.name}</p>
                        <p className="text-xs text-[var(--gray-500)] font-mono">{pilgrim.nik}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-[var(--gray-700)]">{pilgrim.email}</p>
                    <p className="text-xs text-[var(--gray-500)]">{pilgrim.phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={pilgrim.status} size="sm" />
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      const completed = pilgrim.documents.filter(d => d.status === 'verified').length;
                      const total = 4;
                      return (
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: total }).map((_, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index < completed
                                  ? 'bg-[var(--success)]'
                                  : 'bg-[var(--gray-200)]'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-xs font-medium text-[var(--gray-600)]">
                            {completed}/{total}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/pilgrims/${pilgrim.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--gray-400)] hover:text-[var(--info)] hover:bg-[var(--info-light)]">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--gray-400)] hover:text-[var(--warning)] hover:bg-[var(--warning-light)]">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--gray-400)] hover:text-[var(--error)] hover:bg-[var(--error-light)]">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--gray-200)] bg-[var(--gray-50)]">
          <p className="text-sm text-[var(--gray-600)]">
            Showing <span className="font-medium text-[var(--charcoal)]">{mockPilgrims.length}</span> pilgrims
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
