'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
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

export default function PilgrimsPage() {
  const { t } = useLanguage();
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [pilgrims, setPilgrims] = useState<PilgrimRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus jemaah "${name}"?`)) return;
    try {
      const res = await fetch(`/api/pilgrims/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPilgrims(pagination.page);
    } catch (err) {
      console.error('Failed to delete pilgrim:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>

      {/* ==================== HEADER ==================== */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {t.pilgrims.title}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            {t.pilgrims.description}
          </p>
        </div>

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

      {/* ==================== SEARCH & FILTER ==================== */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: c.textLight,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t.pilgrims.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '52px',
              paddingRight: '16px',
              fontSize: '14px',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: c.cardBg,
              color: c.textPrimary,
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: '44px',
            padding: '0 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: c.textSecondary,
            backgroundColor: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <option value="">Semua Status</option>
          <option value="lead">Lead</option>
          <option value="dp">DP</option>
          <option value="lunas">Lunas</option>
          <option value="dokumen">Dokumen</option>
          <option value="visa">Visa</option>
          <option value="ready">Ready</option>
          <option value="departed">Departed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* ==================== TABLE ==================== */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: `1px solid ${c.border}`,
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>
            Memuat data...
          </div>
        ) : pilgrims.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>
            {search || statusFilter ? 'Tidak ada jemaah yang cocok dengan filter.' : 'Belum ada data jemaah.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '600px' : 'auto' }}>
              <thead>
                <tr style={{ backgroundColor: c.cardBgHover, borderBottom: `1px solid ${c.border}` }}>
                  <th style={{ textAlign: 'left', padding: isMobile ? '12px 16px' : '16px 24px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {t.pilgrims.tableHeaders.pilgrim}
                  </th>
                  <th style={{ textAlign: 'left', padding: isMobile ? '12px' : '16px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {t.pilgrims.tableHeaders.contact}
                  </th>
                  <th style={{ textAlign: 'left', padding: isMobile ? '12px' : '16px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {t.pilgrims.tableHeaders.status}
                  </th>
                  <th style={{ textAlign: 'left', padding: isMobile ? '12px' : '16px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {t.pilgrims.tableHeaders.documents}
                  </th>
                  <th style={{ textAlign: 'left', padding: isMobile ? '12px 16px' : '16px 24px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {t.pilgrims.tableHeaders.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pilgrims.map((pilgrim, index) => (
                  <tr
                    key={pilgrim.id}
                    style={{
                      borderBottom: index < pilgrims.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                    }}
                  >
                    <td style={{ padding: isMobile ? '12px 16px' : '16px 24px' }}>
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
                          {pilgrim.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: c.textPrimary, whiteSpace: 'nowrap' }}>
                            {pilgrim.name}
                          </p>
                          <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>
                            {pilgrim.nik}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: isMobile ? '12px' : '16px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: c.textPrimary, whiteSpace: 'nowrap' }}>
                        {pilgrim.email}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>
                        {pilgrim.phone}
                      </p>
                    </td>

                    <td style={{ padding: isMobile ? '12px' : '16px' }}>
                      <StatusBadge status={pilgrim.status} size="sm" />
                    </td>

                    <td style={{ padding: isMobile ? '12px' : '16px' }}>
                      {(() => {
                        const completed = pilgrim.documents.filter(d => d.status === 'verified').length;
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
                      })()}
                    </td>

                    <td style={{ padding: isMobile ? '12px 16px' : '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Link href={`/pilgrims/${pilgrim.id}`}>
                          <button
                            title={t.common.view}
                            style={{
                              padding: '8px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: c.textLight,
                            }}
                          >
                            <Eye style={{ width: '18px', height: '18px' }} />
                          </button>
                        </Link>
                        <Link href={`/pilgrims/${pilgrim.id}/edit`}>
                          <button
                            title={t.common.edit}
                            style={{
                              padding: '8px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: c.textLight,
                            }}
                          >
                            <Edit2 style={{ width: '18px', height: '18px' }} />
                          </button>
                        </Link>
                        <button
                          title={t.common.delete}
                          onClick={() => handleDelete(pilgrim.id, pilgrim.name)}
                          style={{
                            padding: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: c.textLight,
                          }}
                        >
                          <Trash2 style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 16px' : '16px 24px',
            borderTop: `1px solid ${c.border}`,
            backgroundColor: c.cardBgHover,
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: c.textSecondary }}>
            {t.pilgrims.showing} <span style={{ fontWeight: '500' }}>{pagination.total}</span> {t.pilgrims.pilgrimsLabel}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchPilgrims(pagination.page - 1)}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                color: pagination.page <= 1 ? c.textLight : c.textSecondary,
                backgroundColor: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {t.common.previous}
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchPilgrims(pagination.page + 1)}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                color: pagination.page >= pagination.totalPages ? c.textLight : c.textSecondary,
                backgroundColor: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              {t.common.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
