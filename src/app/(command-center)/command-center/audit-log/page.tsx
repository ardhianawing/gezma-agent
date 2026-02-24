'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ScrollText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const cc = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  pageBg: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

const ACTION_TYPES = [
  { value: '', label: 'Semua Tipe' },
  { value: 'pilgrim', label: 'Jemaah' },
  { value: 'package', label: 'Paket' },
  { value: 'trip', label: 'Trip' },
  { value: 'payment', label: 'Pembayaran' },
  { value: 'document', label: 'Dokumen' },
];

interface AuditLog {
  id: string;
  type: string;
  action: string;
  title: string;
  description: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
  agency: { name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (type) params.set('type', type);
      params.set('page', String(page));
      params.set('limit', '50');

      const res = await fetch(`/api/command-center/audit-log?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLogs(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Fetch audit log error:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [search, type, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const typeColor = (t: string) => {
    switch (t) {
      case 'pilgrim': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'package': return { bg: '#D1FAE5', text: '#047857' };
      case 'trip': return { bg: '#FEF3C7', text: '#D97706' };
      case 'payment': return { bg: '#EDE9FE', text: '#7C3AED' };
      case 'document': return { bg: '#FFE4E6', text: '#BE123C' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const truncate = (str: string | null, max: number) => {
    if (!str) return '-';
    return str.length > max ? str.slice(0, max) + '...' : str;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
          Audit Log
        </h1>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px' }}>
          Riwayat aktivitas seluruh agensi dalam ekosistem GEZMA.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: cc.cardBg,
          borderRadius: '12px',
          border: `1px solid ${cc.border}`,
          padding: '16px 20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: cc.textMuted,
            }}
          />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: '8px',
              border: `1px solid ${cc.border}`,
              fontSize: '14px',
              color: cc.textPrimary,
              backgroundColor: cc.pageBg,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </form>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${cc.border}`,
            fontSize: '14px',
            color: cc.textPrimary,
            backgroundColor: cc.pageBg,
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px',
          }}
        >
          {ACTION_TYPES.map((at) => (
            <option key={at.value} value={at.value}>{at.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: cc.cardBg,
          borderRadius: '12px',
          border: `1px solid ${cc.border}`,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader2
              style={{
                width: '32px',
                height: '32px',
                color: cc.primary,
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
            <p style={{ color: cc.textMuted, fontSize: '14px', marginTop: '12px' }}>Memuat data...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <ScrollText style={{ width: '48px', height: '48px', color: cc.border, margin: '0 auto' }} />
            <p style={{ color: cc.textMuted, fontSize: '14px', marginTop: '12px' }}>Tidak ada log aktivitas ditemukan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${cc.border}` }}>
                  {['Waktu', 'User', 'Agensi', 'Tipe', 'Judul', 'Deskripsi'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: cc.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: cc.pageBg,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const tc = typeColor(log.type);
                  return (
                    <tr
                      key={log.id}
                      style={{ borderBottom: `1px solid ${cc.borderLight}` }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textSecondary, whiteSpace: 'nowrap' }}>
                        {formatDate(log.createdAt)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textPrimary, fontWeight: '500' }}>
                        {log.user?.name || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textSecondary }}>
                        {log.agency?.name || '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: tc.bg,
                            color: tc.text,
                            textTransform: 'capitalize',
                          }}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textPrimary, fontWeight: '500' }}>
                        {truncate(log.title, 40)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textMuted, maxWidth: '250px' }}>
                        {truncate(log.description, 60)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: `1px solid ${cc.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} log
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${cc.border}`,
                  backgroundColor: cc.cardBg,
                  color: pagination.page <= 1 ? cc.textMuted : cc.textPrimary,
                  fontSize: '13px',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
                Prev
              </button>
              <span style={{ fontSize: '13px', color: cc.textSecondary, padding: '0 8px' }}>
                Halaman {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${cc.border}`,
                  backgroundColor: cc.cardBg,
                  color: pagination.page >= pagination.totalPages ? cc.textMuted : cc.textPrimary,
                  fontSize: '13px',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                }}
              >
                Next
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
