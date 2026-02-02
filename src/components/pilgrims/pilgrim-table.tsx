'use client';

import Link from 'next/link';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DataTable, Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PILGRIM_STATUS_CONFIG } from '@/types';
import type { Pilgrim } from '@/types/pilgrim';

interface PilgrimTableProps {
  data: Pilgrim[];
  onDelete?: (id: string) => void;
}

export function PilgrimTable({ data, onDelete }: PilgrimTableProps) {
  const columns: Column<Pilgrim>[] = [
    {
      key: 'name',
      header: 'Pilgrim',
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium text-sm text-[var(--charcoal)]">{row.name}</p>
          <p className="text-xs text-[var(--gray-600)] font-mono">{row.nik}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      cell: (row) => (
        <div>
          <p className="text-sm text-[var(--charcoal)]">{row.email}</p>
          <p className="text-xs text-[var(--gray-600)]">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'documents',
      header: 'Documents',
      cell: (row) => {
        const verified = row.documents.filter((d) => d.status === 'verified').length;
        const total = 4;
        const percentage = (verified / total) * 100;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-[var(--gray-200)]">
              <div
                className="h-2 rounded-full bg-[var(--success)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-[var(--gray-600)]">{verified}/{total}</span>
          </div>
        );
      },
    },
    {
      key: 'payment',
      header: 'Payment',
      cell: (row) => {
        const total = row.totalPaid + row.remainingBalance;
        const percentage = total > 0 ? (row.totalPaid / total) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-[var(--gray-200)]">
              <div
                className="h-2 rounded-full bg-[var(--info)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-[var(--gray-600)]">{Math.round(percentage)}%</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-[8px] hover:bg-[var(--gray-100)] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/pilgrims/${row.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            </Link>
            <Link href={`/pilgrims/${row.id}/edit`}>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(row.id)} className="text-[var(--error)]">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filterOptions = Object.entries(PILGRIM_STATUS_CONFIG).map(([value, config]) => ({
    label: config.label,
    value,
  }));

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search pilgrims..."
      filterColumn="status"
      filterOptions={filterOptions}
      pageSize={10}
    />
  );
}
