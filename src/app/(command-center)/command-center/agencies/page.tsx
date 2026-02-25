'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textMuted: '#64748B',
  inputBg: '#F8FAFC',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  active: { bg: '#DCFCE7', text: '#15803D' },
  expiring: { bg: '#FFEDD5', text: '#EA580C' },
  expired: { bg: '#FEE2E2', text: '#DC2626' },
  suspended: { bg: '#F1F5F9', text: '#64748B' },
};

interface Agency {
  id: string;
  name: string;
  email: string;
  ppiuNumber: string | null;
  ppiuStatus: string;
  isVerified: boolean;
  createdAt: string;
  _count: { users: number; pilgrims: number; trips: number };
}

export default function CCAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgencies = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', String(page));

    fetch(`/api/command-center/agencies?${params}`)
      .then(r => r.json())
      .then(data => {
        setAgencies(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAgencies(); }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAgencies();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 style={{ width: '28px', height: '28px', color: cc.primary }} />
          Daftar Agensi
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: cc.textMuted }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, PPIU..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: '8px',
                border: `1px solid ${cc.border}`,
                backgroundColor: cc.inputBg,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: cc.primary, color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            Cari
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: `1px solid ${cc.border}`,
            backgroundColor: cc.inputBg,
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${cc.borderLight}` }}>
                {['Nama Agensi', 'Email', 'PPIU', 'Status', 'Users', 'Jemaah', 'Trips', 'Bergabung'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: cc.textMuted, textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><TableSkeleton rows={5} columns={6} /></td></tr>
              ) : agencies.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: cc.textMuted }}>Tidak ada agensi.</td></tr>
              ) : agencies.map(agency => {
                const status = statusColors[agency.ppiuStatus] || statusColors.pending;
                return (
                  <tr key={agency.id} style={{ borderBottom: `1px solid ${cc.borderLight}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/command-center/agencies/${agency.id}`} style={{ color: cc.primary, textDecoration: 'none', fontWeight: '600' }}>
                        {agency.name}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', color: cc.textMuted }}>{agency.email}</td>
                    <td style={{ padding: '14px 16px', color: cc.textMuted }}>{agency.ppiuNumber || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', backgroundColor: status.bg, color: status.text, textTransform: 'capitalize' }}>
                        {agency.ppiuStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: cc.textMuted }}>{agency._count.users}</td>
                    <td style={{ padding: '14px 16px', color: cc.textMuted }}>{agency._count.pilgrims}</td>
                    <td style={{ padding: '14px 16px', color: cc.textMuted }}>{agency._count.trips}</td>
                    <td style={{ padding: '14px 16px', color: cc.textMuted, fontSize: '12px' }}>{new Date(agency.createdAt).toLocaleDateString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px', borderTop: `1px solid ${cc.borderLight}` }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${cc.border}`, backgroundColor: cc.cardBg, cursor: page === 1 ? 'not-allowed' : 'pointer', color: cc.textMuted, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <ChevronLeft style={{ width: '14px', height: '14px' }} /> Prev
            </button>
            <span style={{ padding: '8px 16px', fontSize: '13px', color: cc.textMuted }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${cc.border}`, backgroundColor: cc.cardBg, cursor: page === totalPages ? 'not-allowed' : 'pointer', color: cc.textMuted, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              Next <ChevronRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
