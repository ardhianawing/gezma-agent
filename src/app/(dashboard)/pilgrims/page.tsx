'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Edit2, Trash2, Download, Users } from 'lucide-react';
import { DataTable, Column, SearchInput, FilterSelect, StatusBadge, ConfirmDialog } from '@/components/shared';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import type { PilgrimStatus } from '@/types';

interface PilgrimRow {
  id: string;
  name: string;
  nik: string;
  email: string;
  phone: string;
  status: PilgrimStatus;
  documents: { status: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { label: 'Lead', value: 'lead' },
  { label: 'DP', value: 'dp' },
  { label: 'Lunas', value: 'lunas' },
  { label: 'Dokumen', value: 'dokumen' },
  { label: 'Visa', value: 'visa' },
  { label: 'Ready', value: 'ready' },
  { label: 'Departed', value: 'departed' },
  { label: 'Completed', value: 'completed' },
];

export default function PilgrimsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>}>
      <PilgrimsPageContent />
    </Suspense>
  );
}

function PilgrimsPageContent() {
  const { t } = useLanguage();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const searchParams = useSearchParams();

  const [pilgrims, setPilgrims] = useState<PilgrimRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchPilgrims = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/pilgrims?${params}`);
      if (res.ok) {
        const json = await res.json();
        setPilgrims(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch pilgrims:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPilgrims(1), 300);
    return () => clearTimeout(timer);
  }, [fetchPilgrims]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/pilgrims/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) fetchPilgrims(pagination.page);
    } catch (err) {
      console.error('Failed to delete pilgrim:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ page: '1', limit: '10000' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/pilgrims?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      const rows = json.data as PilgrimRow[];
      if (rows.length === 0) return;

      const header = ['Nama', 'NIK', 'Email', 'Telepon', 'Status', 'Dokumen Lengkap'];
      const csvRows = [
        header.join(','),
        ...rows.map((r) => {
          const docsComplete = r.documents?.filter((d) => d.status !== 'missing').length || 0;
          const docsTotal = r.documents?.length || 0;
          return [
            `"${r.name}"`,
            `"${r.nik}"`,
            `"${r.email}"`,
            `"${r.phone}"`,
            r.status,
            `${docsComplete}/${docsTotal}`,
          ].join(',');
        }),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jamaah-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  };

  const columns: Column<PilgrimRow>[] = [
    {
      key: 'pilgrim',
      header: t.pilgrims.tableHeaders.pilgrim,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: c.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              flexShrink: 0,
            }}
          >
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: c.textPrimary, whiteSpace: 'nowrap' }}>
              {row.name}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>
              {row.nik}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: t.pilgrims.tableHeaders.contact,
      hideOnMobile: true,
      render: (row) => (
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: c.textPrimary, whiteSpace: 'nowrap' }}>{row.email}</p>
          <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t.pilgrims.tableHeaders.status,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'documents',
      header: t.pilgrims.tableHeaders.documents,
      hideOnMobile: true,
      render: (row) => {
        const completed = row.documents.filter(d => d.status === 'verified').length;
        const total = 4;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: i < completed ? c.success : c.border,
                }}
              />
            ))}
            <span style={{ marginLeft: '8px', fontSize: '12px', color: c.textSecondary, whiteSpace: 'nowrap' }}>
              {completed}/{total}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: t.pilgrims.tableHeaders.actions,
      width: '120px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link href={`/pilgrims/${row.id}`}>
            <button title={t.common.view} style={actionBtnStyle}>
              <Eye style={{ width: '18px', height: '18px' }} />
            </button>
          </Link>
          <Link href={`/pilgrims/${row.id}/edit`}>
            <button title={t.common.edit} style={actionBtnStyle}>
              <Edit2 style={{ width: '18px', height: '18px' }} />
            </button>
          </Link>
          <button
            title={t.common.delete}
            onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: row.id, name: row.name }); }}
            style={actionBtnStyle}
          >
            <Trash2 style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      ),
    },
  ];

  const actionBtnStyle: React.CSSProperties = {
    padding: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    color: c.textLight,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {t.pilgrims.title}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            {t.pilgrims.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: c.cardBg,
              color: c.textSecondary,
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export CSV
          </button>
          <Link href="/pilgrims/new" style={{ textDecoration: 'none' }}>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: c.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t.pilgrims.addPilgrim}
            </button>
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t.pilgrims.searchPlaceholder}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          placeholder="Semua Status"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pilgrims}
        loading={loading}
        keyExtractor={(r) => r.id}
        emptyIcon={Users}
        emptyTitle={search || statusFilter ? 'Tidak ada jemaah yang cocok' : 'Belum ada data jemaah'}
        emptyDescription={search || statusFilter ? 'Coba ubah filter atau kata kunci pencarian.' : 'Mulai dengan menambahkan jemaah baru.'}
        emptyAction={!search && !statusFilter ? { label: t.pilgrims.addPilgrim, href: '/pilgrims/new' } : undefined}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => fetchPilgrims(p),
          itemLabel: t.pilgrims.pilgrimsLabel,
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus jemaah "${deleteTarget?.name}"?`}
        description="Data jemaah akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  );
}
