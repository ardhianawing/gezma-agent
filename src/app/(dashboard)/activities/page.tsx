'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  action: string;
  title: string;
  description: string;
  createdAt: string;
  userId?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TYPE_OPTIONS = [
  { label: 'Semua', value: '' },
  { label: 'Jemaah', value: 'pilgrim' },
  { label: 'Paket', value: 'package' },
  { label: 'Trip', value: 'trip' },
  { label: 'Pembayaran', value: 'payment' },
  { label: 'Dokumen', value: 'document' },
  { label: 'User', value: 'user' },
];

const TYPE_COLORS: Record<string, string> = {
  pilgrim: '#3B82F6',
  package: '#10B981',
  trip: '#F59E0B',
  payment: '#8B5CF6',
  document: '#EF4444',
  user: '#6366F1',
};

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  create: { bg: '#DCFCE7', text: '#15803D' },
  update: { bg: '#DBEAFE', text: '#2563EB' },
  delete: { bg: '#FEE2E2', text: '#DC2626' },
};

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} jam lalu`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivitiesPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchActivities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (typeFilter) params.set('type', typeFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/activities?${params}`);
      if (res.ok) {
        const json = await res.json();
        setActivities(json.data || []);
        setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchActivities(1), 300);
    return () => clearTimeout(timer);
  }, [fetchActivities]);

  const selectStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px solid ${c.border}`,
    backgroundColor: c.cardBg,
    color: c.textPrimary,
    fontSize: '14px',
    outline: 'none',
    minWidth: '140px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader title="Log Aktivitas" description="Riwayat semua aktivitas dalam agensi" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
        <input
          type="text"
          placeholder="Cari aktivitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...selectStyle,
            flex: 1,
          }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={selectStyle}
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Activity list */}
      <div style={{
        backgroundColor: c.cardBg, borderRadius: '12px',
        border: `1px solid ${c.border}`, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted, fontSize: '14px' }}>
            Memuat...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Clock style={{ width: '40px', height: '40px', color: c.textLight, margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: c.textMuted }}>Belum ada aktivitas.</p>
          </div>
        ) : (
          <div>
            {activities.map((activity, i) => {
              const dotColor = TYPE_COLORS[activity.type] || c.textMuted;
              const actionStyle = ACTION_COLORS[activity.action] || { bg: '#F3F4F6', text: '#6B7280' };
              return (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    padding: isMobile ? '14px 16px' : '16px 24px',
                    borderBottom: i < activities.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                  }}
                >
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: dotColor, marginTop: '5px', flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: c.textPrimary }}>
                        {activity.title}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '6px',
                        backgroundColor: actionStyle.bg, color: actionStyle.text,
                        textTransform: 'uppercase',
                      }}>
                        {activity.action}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activity.description}
                    </p>
                    <span style={{ fontSize: '12px', color: c.textLight }}>{timeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 24px', borderTop: `1px solid ${c.borderLight}`,
          }}>
            <span style={{ fontSize: '13px', color: c.textMuted }}>
              {pagination.total} aktivitas
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => fetchActivities(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{
                  padding: '6px 10px', borderRadius: '8px', border: `1px solid ${c.border}`,
                  backgroundColor: c.cardBg, cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1, display: 'flex', alignItems: 'center',
                  color: c.textSecondary,
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 500 }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchActivities(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  padding: '6px 10px', borderRadius: '8px', border: `1px solid ${c.border}`,
                  backgroundColor: c.cardBg, cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= pagination.totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center',
                  color: c.textSecondary,
                }}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
