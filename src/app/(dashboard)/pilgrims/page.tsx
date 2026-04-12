'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, Edit2, Trash2, Download, Upload, Users, ChevronDown, X, CheckSquare, Loader2,
  List, LayoutGrid, Search, CheckCircle, Clock, Plane, XCircle, Phone, Mail,
  TrendingUp, UserCheck, Award, AlertCircle,
} from 'lucide-react';
import { DataTable, Column, FilterSelect, StatusBadge, ConfirmDialog } from '@/components/shared';
import { ImportModal } from '@/components/pilgrims/import-modal';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePermission, PERMISSIONS } from '@/lib/hooks/use-permissions';
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

interface TripOption {
  id: string;
  name: string;
  capacity: number;
  registeredCount: number;
  status: string;
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

// Avatar color palette — hash name to pick one
const AVATAR_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#0D9488', // teal
  '#F59E0B', // amber
  '#F43F5E', // rose
  '#6366F1', // indigo
  '#06B6D4', // cyan
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

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
  const { can } = usePermission();
  const searchParams = useSearchParams();

  const [pilgrims, setPilgrims] = useState<PilgrimRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [draggedPilgrim, setDraggedPilgrim] = useState<string | null>(null);
  const [kanbanActiveStatus, setKanbanActiveStatus] = useState<string>('lead');
  const [showImportModal, setShowImportModal] = useState(false);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const [trips, setTrips] = useState<TripOption[]>([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const tripDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bulkMessage) return;
    const timer = setTimeout(() => setBulkMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [bulkMessage]);

  useEffect(() => {
    if (!showStatusDropdown && !showTripDropdown) return;
    const handler = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (tripDropdownRef.current && !tripDropdownRef.current.contains(e.target as Node)) {
        setShowTripDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStatusDropdown, showTripDropdown]);

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

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pilgrims]);

  const fetchTrips = useCallback(async () => {
    if (tripsLoaded) return;
    try {
      const res = await fetch('/api/trips?status=open');
      if (res.ok) {
        const json = await res.json();
        setTrips(json.data || []);
        setTripsLoaded(true);
      }
    } catch {
      // silently fail
    }
  }, [tripsLoaded]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (pilgrims.length === 0) return;
    const allCurrentPageIds = pilgrims.map((p) => p.id);
    const allSelected = allCurrentPageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allCurrentPageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allCurrentPageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setShowStatusDropdown(false);
    setShowTripDropdown(false);
  };

  const executeBulkAction = async (action: string, extra: Record<string, string> = {}) => {
    setBulkLoading(true);
    setShowStatusDropdown(false);
    setShowTripDropdown(false);
    try {
      const res = await fetch('/api/pilgrims/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, pilgrimIds: Array.from(selectedIds), ...extra }),
      });
      const json = await res.json();
      if (res.ok) {
        const msg = json.failed > 0
          ? `${json.success} berhasil, ${json.failed} gagal`
          : `${json.success} jemaah berhasil diproses`;
        setBulkMessage({ type: 'success', text: msg });
        setSelectedIds(new Set());
        fetchPilgrims(pagination.page);
      } else {
        setBulkMessage({ type: 'error', text: json.error || 'Terjadi kesalahan' });
      }
    } catch {
      setBulkMessage({ type: 'error', text: 'Gagal menghubungi server' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusChange = (status: string) => executeBulkAction('update_status', { status });
  const handleBulkAssignTrip = (tripId: string) => executeBulkAction('assign_trip', { tripId });
  const handleBulkDelete = () => { setBulkDeleteConfirm(false); executeBulkAction('delete'); };

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
      const res = await fetch('/api/pilgrims/export');
      if (!res.ok) return;
      const blob = await res.blob();
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

  const handleKanbanDrop = async (newStatus: string) => {
    if (!draggedPilgrim) return;
    const pilgrim = pilgrims.find((p) => p.id === draggedPilgrim);
    if (!pilgrim || pilgrim.status === newStatus) { setDraggedPilgrim(null); return; }
    try {
      const res = await fetch(`/api/pilgrims/${draggedPilgrim}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPilgrims((prev) =>
          prev.map((p) => (p.id === draggedPilgrim ? { ...p, status: newStatus as PilgrimStatus } : p))
        );
      }
    } catch {
      // silently fail
    } finally {
      setDraggedPilgrim(null);
    }
  };

  const allPageSelected = pilgrims.length > 0 && pilgrims.every((p) => selectedIds.has(p.id));
  const somePageSelected = pilgrims.some((p) => selectedIds.has(p.id)) && !allPageSelected;

  const totalCount = pagination.total;
  const activeCount = pilgrims.filter((p) => ['lead', 'dp', 'lunas', 'dokumen', 'visa', 'ready'].includes(p.status)).length;
  const completedCount = pilgrims.filter((p) => p.status === 'completed' || p.status === 'departed').length;
  const pendingCount = pilgrims.filter((p) => p.status === 'lead' || p.status === 'dp').length;

  // --- Status badge pill with icon ---
  const StatusPill = ({ status }: { status: string }) => {
    type PillConfig = { bg: string; color: string; icon: React.ReactNode; label: string };
    const config: Record<string, PillConfig> = {
      lunas: { bg: '#D1FAE5', color: '#065F46', icon: <CheckCircle style={{ width: 12, height: 12 }} />, label: 'Lunas' },
      ready: { bg: '#D1FAE5', color: '#065F46', icon: <CheckCircle style={{ width: 12, height: 12 }} />, label: 'Ready' },
      completed: { bg: '#DBEAFE', color: '#1E3A8A', icon: <Plane style={{ width: 12, height: 12 }} />, label: 'Completed' },
      departed: { bg: '#DBEAFE', color: '#1E3A8A', icon: <Plane style={{ width: 12, height: 12 }} />, label: 'Departed' },
      dp: { bg: '#FEF3C7', color: '#92400E', icon: <Clock style={{ width: 12, height: 12 }} />, label: 'DP' },
      lead: { bg: '#FEF3C7', color: '#92400E', icon: <Clock style={{ width: 12, height: 12 }} />, label: 'Lead' },
      dokumen: { bg: '#EDE9FE', color: '#4C1D95', icon: <Clock style={{ width: 12, height: 12 }} />, label: 'Dokumen' },
      visa: { bg: '#EDE9FE', color: '#4C1D95', icon: <Clock style={{ width: 12, height: 12 }} />, label: 'Visa' },
      cancelled: { bg: '#FEE2E2', color: '#991B1B', icon: <XCircle style={{ width: 12, height: 12 }} />, label: 'Cancelled' },
    };
    const cfg = config[status] || { bg: '#F3F4F6', color: '#6B7280', icon: null, label: status };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '9999px',
        fontSize: '11px', fontWeight: '600',
        backgroundColor: cfg.bg, color: cfg.color,
        whiteSpace: 'nowrap',
      }}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  // --- Document progress bar ---
  const DocProgress = ({ completed, total = 4, fullWidth = false }: { completed: number; total?: number; fullWidth?: boolean }) => {
    const pct = Math.round((completed / total) * 100);
    const barColor = completed === total ? '#10B981' : completed > 0 ? '#F59E0B' : '#E5E7EB';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: fullWidth ? '100%' : '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: c.textMuted }}>{completed}/{total}</span>
          <span style={{ fontSize: '11px', color: c.textMuted }}>{pct}%</span>
        </div>
        <div style={{ height: '5px', borderRadius: '9999px', backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: '9999px', transition: 'width 0.3s' }} />
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'lunas': case 'ready': return '#10B981';
      case 'completed': case 'departed': return '#3B82F6';
      case 'lead': case 'dp': return '#F59E0B';
      case 'dokumen': case 'visa': return '#8B5CF6';
      case 'cancelled': return '#EF4444';
      default: return c.textMuted;
    }
  };

  const actionBtnStyle: React.CSSProperties = {
    padding: '7px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    color: c.textLight,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    minHeight: '32px',
    transition: 'background-color 0.15s, color 0.15s',
  };

  const bulkBarBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    minHeight: '44px',
  };

  // --- Stat Cards Config ---
  const statCards = [
    {
      label: 'Total Jamaah',
      count: totalCount,
      color: '#3B82F6',
      bg: '#EFF6FF',
      icon: <Users style={{ width: 20, height: 20 }} />,
    },
    {
      label: 'Aktif',
      count: activeCount,
      color: '#10B981',
      bg: '#ECFDF5',
      icon: <TrendingUp style={{ width: 20, height: 20 }} />,
    },
    {
      label: 'Selesai',
      count: completedCount,
      color: '#8B5CF6',
      bg: '#EDE9FE',
      icon: <Award style={{ width: 20, height: 20 }} />,
    },
    {
      label: 'Pending',
      count: pendingCount,
      color: '#F59E0B',
      bg: '#FFFBEB',
      icon: <AlertCircle style={{ width: 20, height: 20 }} />,
    },
  ];

  // --- Table columns ---
  const columns: Column<PilgrimRow>[] = [
    {
      key: 'select',
      header: '',
      width: '48px',
      render: (row) => (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selectedIds.has(row.id)}
            onChange={() => toggleSelect(row.id)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: c.primary }}
          />
        </div>
      ),
    },
    {
      key: 'pilgrim',
      header: t.pilgrims.tableHeaders.pilgrim,
      render: (row) => {
        const avatarColor = getAvatarColor(row.name);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              backgroundColor: avatarColor + '22',
              border: `1.5px solid ${avatarColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: avatarColor, fontSize: '13px', fontWeight: '700', flexShrink: 0,
            }}>
              {getInitials(row.name)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.textPrimary, whiteSpace: 'nowrap' }}>
                {row.name}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: c.textMuted, fontFamily: 'monospace', marginTop: '1px' }}>
                {row.nik}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'contact',
      header: t.pilgrims.tableHeaders.contact,
      hideOnMobile: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {row.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Phone style={{ width: 11, height: 11, color: c.textMuted, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: c.textSecondary, whiteSpace: 'nowrap' }}>{row.phone}</span>
            </div>
          )}
          {row.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Mail style={{ width: 11, height: 11, color: c.textMuted, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: c.textMuted, whiteSpace: 'nowrap' }}>{row.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: t.pilgrims.tableHeaders.status,
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: 'documents',
      header: t.pilgrims.tableHeaders.documents,
      hideOnMobile: true,
      render: (row) => {
        const completed = row.documents.filter(d => d.status === 'verified').length;
        return <DocProgress completed={completed} />;
      },
    },
    {
      key: 'actions',
      header: t.pilgrims.tableHeaders.actions,
      width: '120px',
      render: (row) => (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '2px',
          backgroundColor: c.pageBg, borderRadius: '8px',
          border: `1px solid ${c.border}`, padding: '3px',
        }}>
          <Link href={`/pilgrims/${row.id}`}>
            <button
              title={t.common.view}
              aria-label="Lihat detail"
              style={actionBtnStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = c.cardBgHover; (e.currentTarget as HTMLButtonElement).style.color = c.textPrimary; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = c.textLight; }}
            >
              <Eye style={{ width: '16px', height: '16px' }} />
            </button>
          </Link>
          {can(PERMISSIONS.PILGRIMS_EDIT) && (
            <Link href={`/pilgrims/${row.id}/edit`}>
              <button
                title={t.common.edit}
                aria-label="Edit"
                style={actionBtnStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = c.cardBgHover; (e.currentTarget as HTMLButtonElement).style.color = c.textPrimary; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = c.textLight; }}
              >
                <Edit2 style={{ width: '16px', height: '16px' }} />
              </button>
            </Link>
          )}
          {can(PERMISSIONS.PILGRIMS_DELETE) && (
            <button
              title={t.common.delete}
              aria-label="Hapus"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: row.id, name: row.name }); }}
              style={actionBtnStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FEE2E2'; (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = c.textLight; }}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // --- Kanban status colors ---
  const kanbanStatusColors: Record<string, string> = {
    lead: '#6B7280', dp: '#F59E0B', lunas: '#10B981', dokumen: '#3B82F6',
    visa: '#8B5CF6', ready: '#06B6D4', departed: '#EC4899', completed: '#22C55E',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', paddingBottom: selectedIds.size > 0 ? '80px' : '0' }}>

      {/* ---- Stat Cards ---- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '16px',
      }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              borderLeft: `3px solid ${stat.color}`,
              borderRadius: '12px',
              padding: isMobile ? '14px' : '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
          >
            {/* Icon */}
            <div style={{
              width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px',
              backgroundColor: stat.bg, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stat.icon}
            </div>
            {/* Numbers */}
            <div>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.textPrimary, lineHeight: 1.1 }}>
                {loading ? '—' : stat.count}
              </div>
              <div style={{ fontSize: '12px', color: c.textMuted, fontWeight: '500', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Page header ---- */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {t.pilgrims.title}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px', marginBottom: 0 }}>
            {t.pilgrims.description}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              backgroundColor: c.cardBg, color: c.textSecondary,
              fontSize: '13px', fontWeight: '500',
              padding: '9px 14px', borderRadius: '8px',
              border: `1px solid ${c.border}`, cursor: 'pointer',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.textMuted; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.border; }}
          >
            <Upload style={{ width: '15px', height: '15px' }} />
            Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              backgroundColor: c.cardBg, color: c.textSecondary,
              fontSize: '13px', fontWeight: '500',
              padding: '9px 14px', borderRadius: '8px',
              border: `1px solid ${c.border}`, cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.textMuted; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = c.border; }}
          >
            <Download style={{ width: '15px', height: '15px' }} />
            Export CSV
          </button>
          {can(PERMISSIONS.PILGRIMS_CREATE) && (
            <Link href="/pilgrims/new" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                backgroundColor: c.primary, color: 'white',
                fontSize: '14px', fontWeight: '600',
                padding: '10px 20px', borderRadius: '8px',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t.pilgrims.addPilgrim}
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ---- Search + Filter + View toggle ---- */}
      <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center' }}>
        {/* Custom search input */}
        <div style={{ position: 'relative', flex: isMobile ? 1 : '0 0 400px' }}>
          <Search style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            width: '16px', height: '16px', color: c.textMuted, pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.pilgrims.searchPlaceholder}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '11px 14px 11px 38px',
              fontSize: '14px', color: c.textPrimary,
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: '8px', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = c.primary; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = c.border; }}
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          placeholder="Semua Status"
        />
        {/* View mode toggle */}
        <div style={{
          display: 'flex', gap: '3px',
          backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
          borderRadius: '8px', padding: '4px', flexShrink: 0,
        }}>
          <button
            onClick={() => setViewMode('list')}
            title="Tampilan Daftar"
            style={{
              padding: '8px 12px', borderRadius: '6px', border: 'none',
              backgroundColor: viewMode === 'list' ? c.primary : 'transparent',
              color: viewMode === 'list' ? 'white' : c.textMuted,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', fontSize: '13px', fontWeight: '500', minWidth: '44px', minHeight: '36px',
              transition: 'background-color 0.15s',
            }}
          >
            <List style={{ width: '16px', height: '16px' }} />
            {!isMobile && 'Daftar'}
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            title="Tampilan Kanban"
            style={{
              padding: '8px 12px', borderRadius: '6px', border: 'none',
              backgroundColor: viewMode === 'kanban' ? c.primary : 'transparent',
              color: viewMode === 'kanban' ? 'white' : c.textMuted,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', fontSize: '13px', fontWeight: '500', minWidth: '44px', minHeight: '36px',
              transition: 'background-color 0.15s',
            }}
          >
            <LayoutGrid style={{ width: '16px', height: '16px' }} />
            {!isMobile && 'Kanban'}
          </button>
        </div>
      </div>

      {/* ---- Bulk success/error message ---- */}
      {bulkMessage && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
          backgroundColor: bulkMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          color: bulkMessage.type === 'success' ? '#065F46' : '#991B1B',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{bulkMessage.text}</span>
          <button onClick={() => setBulkMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'inherit' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )}

      {/* ---- Kanban View ---- */}
      {viewMode === 'kanban' && (
        isMobile ? (
          <div>
            {/* Scrollable status tabs */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', padding: '2px', minWidth: 'max-content' }}>
                {STATUS_OPTIONS.map((statusOpt) => {
                  const count = pilgrims.filter((p) => p.status === statusOpt.value).length;
                  const isActive = kanbanActiveStatus === statusOpt.value;
                  const dotColor = kanbanStatusColors[statusOpt.value] || c.textMuted;
                  return (
                    <button
                      key={statusOpt.value}
                      onClick={() => setKanbanActiveStatus(statusOpt.value)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '10px 14px', minHeight: '44px',
                        fontSize: '13px', fontWeight: isActive ? '600' : '500',
                        color: isActive ? 'white' : c.textSecondary,
                        backgroundColor: isActive ? dotColor : c.cardBg,
                        border: `1px solid ${isActive ? dotColor : c.border}`,
                        borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isActive ? 'white' : dotColor, flexShrink: 0 }} />
                      {statusOpt.label}
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : c.pageBg,
                        color: isActive ? 'white' : c.textMuted,
                        padding: '2px 8px', borderRadius: '10px',
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: c.textMuted }}>Memuat...</div>
              ) : (() => {
                const activePilgrims = pilgrims.filter((p) => p.status === kanbanActiveStatus);
                if (activePilgrims.length === 0) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: c.cardBgHover, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Users style={{ width: 28, height: 28, color: c.textMuted }} />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 4px 0' }}>Tidak ada jemaah</h3>
                      <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>Tidak ada jemaah dengan status ini.</p>
                    </div>
                  );
                }
                return activePilgrims.map((pilgrim) => {
                  const avatarColor = getAvatarColor(pilgrim.name);
                  const statusColor = getStatusColor(pilgrim.status);
                  return (
                    <div
                      key={pilgrim.id}
                      onClick={() => { window.location.href = `/pilgrims/${pilgrim.id}`; }}
                      style={{
                        backgroundColor: c.cardBg,
                        borderRadius: '12px',
                        border: `1px solid ${c.border}`,
                        borderLeft: `3px solid ${statusColor}`,
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '9px',
                          backgroundColor: avatarColor + '22', color: avatarColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: '700', flexShrink: 0,
                        }}>
                          {getInitials(pilgrim.name)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pilgrim.name}
                          </div>
                          <div style={{ fontSize: '11px', color: c.textMuted, fontFamily: 'monospace' }}>
                            {pilgrim.nik}
                          </div>
                        </div>
                        <StatusPill status={pilgrim.status} />
                      </div>
                      {pilgrim.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px', paddingLeft: '46px' }}>
                          <Phone style={{ width: 11, height: 11, color: c.textMuted }} />
                          <span style={{ fontSize: '12px', color: c.textMuted }}>{pilgrim.phone}</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : (
          /* Desktop kanban */
          <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
              {STATUS_OPTIONS.map((statusOpt) => {
                const columnPilgrims = pilgrims.filter((p) => p.status === statusOpt.value);
                const dotColor = kanbanStatusColors[statusOpt.value] || c.textMuted;
                return (
                  <div
                    key={statusOpt.value}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = c.primaryLight || '#EFF6FF'; }}
                    onDragLeave={(e) => { e.currentTarget.style.backgroundColor = c.pageBg; }}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = c.pageBg; handleKanbanDrop(statusOpt.value); }}
                    style={{
                      minWidth: '220px', width: '220px',
                      backgroundColor: c.pageBg,
                      borderRadius: '12px', border: `1px solid ${c.border}`,
                      padding: '12px',
                      display: 'flex', flexDirection: 'column', gap: '8px',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{statusOpt.label}</span>
                      <span style={{
                        marginLeft: 'auto', fontSize: '11px', fontWeight: '600',
                        color: c.textMuted, backgroundColor: c.cardBg,
                        padding: '2px 8px', borderRadius: '10px',
                      }}>
                        {columnPilgrims.length}
                      </span>
                    </div>
                    {loading ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: c.textMuted }}>...</div>
                    ) : columnPilgrims.length === 0 ? (
                      <div style={{ padding: '24px 8px', textAlign: 'center', fontSize: '12px', color: c.textMuted, border: `2px dashed ${c.border}`, borderRadius: '8px' }}>
                        Kosong
                      </div>
                    ) : columnPilgrims.map((pilgrim) => {
                      const avatarColor = getAvatarColor(pilgrim.name);
                      return (
                        <div
                          key={pilgrim.id}
                          draggable
                          onDragStart={() => setDraggedPilgrim(pilgrim.id)}
                          onDragEnd={() => setDraggedPilgrim(null)}
                          onClick={() => { window.location.href = `/pilgrims/${pilgrim.id}`; }}
                          style={{
                            backgroundColor: c.cardBg,
                            borderRadius: '10px',
                            border: `1px solid ${draggedPilgrim === pilgrim.id ? c.primary : c.border}`,
                            padding: '12px', cursor: 'grab',
                            opacity: draggedPilgrim === pilgrim.id ? 0.5 : 1,
                            transition: 'border-color 0.15s, opacity 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '7px',
                              backgroundColor: avatarColor + '22', color: avatarColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: '700', flexShrink: 0,
                            }}>
                              {getInitials(pilgrim.name)}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {pilgrim.name}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: c.textMuted, fontFamily: 'monospace' }}>
                            {pilgrim.nik.length > 12 ? pilgrim.nik.slice(0, 12) + '...' : pilgrim.nik}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* ---- Mobile Card List ---- */}
      {viewMode === 'list' && isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: '14px', color: c.textMuted }}>Memuat...</div>
          ) : pilgrims.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center', fontSize: '14px', color: c.textMuted,
              border: `2px dashed ${c.border}`, borderRadius: '12px',
            }}>
              {search || statusFilter ? 'Tidak ada jemaah yang cocok' : 'Belum ada data jemaah'}
            </div>
          ) : pilgrims.map((pilgrim) => {
            const statusColor = getStatusColor(pilgrim.status);
            const avatarColor = getAvatarColor(pilgrim.name);
            const initials = getInitials(pilgrim.name);
            const docsCompleted = pilgrim.documents.filter((d) => d.status === 'verified').length;
            return (
              <div
                key={pilgrim.id}
                onClick={() => { window.location.href = `/pilgrims/${pilgrim.id}`; }}
                style={{
                  backgroundColor: selectedIds.has(pilgrim.id) ? (c.primaryLight || '#EFF6FF') : c.cardBg,
                  border: `1px solid ${selectedIds.has(pilgrim.id) ? c.primary : c.border}`,
                  borderLeft: `3px solid ${statusColor}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  transition: 'box-shadow 0.15s',
                }}
              >
                {/* Top row: checkbox + avatar + name + status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div onClick={(e) => { e.stopPropagation(); toggleSelect(pilgrim.id); }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(pilgrim.id)}
                      onChange={() => toggleSelect(pilgrim.id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: c.primary, flexShrink: 0 }}
                    />
                  </div>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    backgroundColor: avatarColor + '22', color: avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '700', flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pilgrim.name}
                    </div>
                    <div style={{ fontSize: '11px', color: c.textMuted, fontFamily: 'monospace', marginTop: '1px' }}>
                      {pilgrim.nik}
                    </div>
                  </div>
                  <StatusPill status={pilgrim.status} />
                </div>

                {/* Contact info */}
                {(pilgrim.phone || pilgrim.email) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '66px' }}>
                    {pilgrim.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone style={{ width: 12, height: 12, color: c.textMuted, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: c.textSecondary }}>{pilgrim.phone}</span>
                      </div>
                    )}
                    {pilgrim.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail style={{ width: 12, height: 12, color: c.textMuted, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pilgrim.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom: doc progress + actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '66px', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <DocProgress completed={docsCompleted} fullWidth />
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <Link href={`/pilgrims/${pilgrim.id}`}>
                      <button aria-label="Lihat detail" style={{ ...actionBtnStyle, minWidth: '36px', minHeight: '36px' }}>
                        <Eye style={{ width: '15px', height: '15px' }} />
                      </button>
                    </Link>
                    {can(PERMISSIONS.PILGRIMS_EDIT) && (
                      <Link href={`/pilgrims/${pilgrim.id}/edit`}>
                        <button aria-label="Edit" style={{ ...actionBtnStyle, minWidth: '36px', minHeight: '36px' }}>
                          <Edit2 style={{ width: '15px', height: '15px' }} />
                        </button>
                      </Link>
                    )}
                    {can(PERMISSIONS.PILGRIMS_DELETE) && (
                      <button
                        aria-label="Hapus"
                        onClick={() => setDeleteTarget({ id: pilgrim.id, name: pilgrim.name })}
                        style={{ ...actionBtnStyle, minWidth: '36px', minHeight: '36px' }}
                      >
                        <Trash2 style={{ width: '15px', height: '15px' }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Mobile pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', fontSize: '13px', color: c.textMuted }}>
              <span>Halaman {pagination.page} / {pagination.totalPages}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {pagination.page > 1 && (
                  <button
                    onClick={() => fetchPilgrims(pagination.page - 1)}
                    style={{ padding: '8px 14px', border: `1px solid ${c.border}`, borderRadius: '8px', backgroundColor: c.cardBg, color: c.textPrimary, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Sebelumnya
                  </button>
                )}
                {pagination.page < pagination.totalPages && (
                  <button
                    onClick={() => fetchPilgrims(pagination.page + 1)}
                    style={{ padding: '8px 14px', border: `1px solid ${c.border}`, borderRadius: '8px', backgroundColor: c.cardBg, color: c.textPrimary, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Berikutnya
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Desktop Table ---- */}
      {viewMode === 'list' && !isMobile && (
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
          headerSlot={
            pilgrims.length > 0 ? (
              <div style={{ padding: '8px 24px 0 24px' }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', fontSize: '13px', color: c.textSecondary, userSelect: 'none',
                }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => { if (el) el.indeterminate = somePageSelected; }}
                    onChange={toggleSelectAll}
                    style={{ width: '16px', height: '16px', accentColor: c.primary, cursor: 'pointer' }}
                  />
                  Pilih semua di halaman ini
                </label>
              </div>
            ) : undefined
          }
          rowStyle={(row) =>
            selectedIds.has(row.id)
              ? { backgroundColor: c.primaryLight || '#EFF6FF' }
              : undefined
          }
        />
      )}

      {/* ---- Floating Bulk Action Bar ---- */}
      {selectedIds.size > 0 && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
          borderRadius: '9999px', padding: '10px 20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: 'center',
          maxWidth: isMobile ? 'calc(100% - 32px)' : 'auto',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', backgroundColor: c.primary,
            color: 'white', borderRadius: '9999px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
          }}>
            <CheckSquare style={{ width: '14px', height: '14px' }} />
            {selectedIds.size} jemaah dipilih
          </div>

          <div style={{ position: 'relative' }} ref={statusDropdownRef}>
            <button
              onClick={() => { setShowTripDropdown(false); setShowStatusDropdown((v) => !v); }}
              disabled={bulkLoading}
              style={{ ...bulkBarBtnStyle, backgroundColor: c.primary, color: 'white', opacity: bulkLoading ? 0.7 : 1 }}
            >
              {bulkLoading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : null}
              Ubah Status <ChevronDown style={{ width: '14px', height: '14px' }} />
            </button>
            {showStatusDropdown && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                marginBottom: '8px', backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
                borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                overflow: 'hidden', minWidth: '160px', zIndex: 1001,
              }}>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleBulkStatusChange(opt.value)}
                    style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: '13px', color: c.textPrimary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = c.cardBgHover; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                  >
                    <StatusBadge status={opt.value as PilgrimStatus} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} ref={tripDropdownRef}>
            <button
              onClick={() => { setShowStatusDropdown(false); setShowTripDropdown((v) => !v); fetchTrips(); }}
              disabled={bulkLoading}
              style={{ ...bulkBarBtnStyle, backgroundColor: c.cardBg, color: c.textPrimary, border: `1px solid ${c.border}`, opacity: bulkLoading ? 0.7 : 1 }}
            >
              Assign ke Trip <ChevronDown style={{ width: '14px', height: '14px' }} />
            </button>
            {showTripDropdown && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                marginBottom: '8px', backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
                borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                overflow: 'hidden', minWidth: '220px', maxHeight: '240px', overflowY: 'auto', zIndex: 1001,
              }}>
                {trips.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: '13px', color: c.textMuted, textAlign: 'center' }}>
                    {tripsLoaded ? 'Tidak ada trip yang tersedia' : 'Memuat...'}
                  </div>
                ) : trips.map((trip) => {
                  const remaining = trip.capacity > 0 ? trip.capacity - trip.registeredCount : null;
                  return (
                    <button
                      key={trip.id}
                      onClick={() => handleBulkAssignTrip(trip.id)}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: '13px', color: c.textPrimary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = c.cardBgHover; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ fontWeight: '500' }}>{trip.name}</div>
                      <div style={{ fontSize: '11px', color: c.textMuted, marginTop: '2px' }}>
                        {trip.registeredCount}/{trip.capacity || '-'} terdaftar
                        {remaining !== null && remaining >= 0 ? ` (sisa ${remaining})` : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => { setShowStatusDropdown(false); setShowTripDropdown(false); setBulkDeleteConfirm(true); }}
            disabled={bulkLoading}
            style={{ ...bulkBarBtnStyle, backgroundColor: '#FEE2E2', color: '#DC2626', opacity: bulkLoading ? 0.7 : 1 }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Hapus
          </button>

          <button
            onClick={clearSelection}
            disabled={bulkLoading}
            style={{ ...bulkBarBtnStyle, backgroundColor: 'transparent', color: c.textMuted }}
          >
            <X style={{ width: '14px', height: '14px' }} />
            Batal
          </button>
        </div>
      )}

      {/* ---- Dialogs ---- */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus jemaah "${deleteTarget?.name}"?`}
        description="Data jemaah akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
      />
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Hapus ${selectedIds.size} jemaah?`}
        description="Semua data jemaah yang dipilih beserta dokumen dan pembayarannya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel={`Hapus ${selectedIds.size} Jemaah`}
        variant="destructive"
        loading={bulkLoading}
      />
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={() => fetchPilgrims(1)}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
