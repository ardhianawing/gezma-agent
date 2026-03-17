'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Edit2, Trash2, Download, Upload, Users, ChevronDown, X, CheckSquare, Loader2, List, LayoutGrid } from 'lucide-react';
import { DataTable, Column, SearchInput, FilterSelect, StatusBadge, ConfirmDialog } from '@/components/shared';
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

  // Delete confirm dialog (single)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Kanban drag state
  const [draggedPilgrim, setDraggedPilgrim] = useState<string | null>(null);

  // Mobile kanban active status tab
  const [kanbanActiveStatus, setKanbanActiveStatus] = useState<string>('lead');

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);

  // Bulk action dropdowns
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Trips for assign dropdown
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);

  // Refs for dropdown positioning
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const tripDropdownRef = useRef<HTMLDivElement>(null);

  // Clear bulk message after 4 seconds
  useEffect(() => {
    if (!bulkMessage) return;
    const timer = setTimeout(() => setBulkMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [bulkMessage]);

  // Close dropdowns on outside click
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

  // Clear selection when data changes (page change, filter change)
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

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (pilgrims.length === 0) return;
    const allCurrentPageIds = pilgrims.map((p) => p.id);
    const allSelected = allCurrentPageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      // Deselect all current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allCurrentPageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      // Select all current page
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

  // Bulk action handlers
  const executeBulkAction = async (action: string, extra: Record<string, string> = {}) => {
    setBulkLoading(true);
    setShowStatusDropdown(false);
    setShowTripDropdown(false);
    try {
      const res = await fetch('/api/pilgrims/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          pilgrimIds: Array.from(selectedIds),
          ...extra,
        }),
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

  const handleBulkStatusChange = (status: string) => {
    executeBulkAction('update_status', { status });
  };

  const handleBulkAssignTrip = (tripId: string) => {
    executeBulkAction('assign_trip', { tripId });
  };

  const handleBulkDelete = () => {
    setBulkDeleteConfirm(false);
    executeBulkAction('delete');
  };

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

  // Kanban: handle drop to change status
  const handleKanbanDrop = async (newStatus: string) => {
    if (!draggedPilgrim) return;
    const pilgrim = pilgrims.find((p) => p.id === draggedPilgrim);
    if (!pilgrim || pilgrim.status === newStatus) {
      setDraggedPilgrim(null);
      return;
    }
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

  // Check if all current page items are selected
  const allPageSelected = pilgrims.length > 0 && pilgrims.every((p) => selectedIds.has(p.id));
  const somePageSelected = pilgrims.some((p) => selectedIds.has(p.id)) && !allPageSelected;

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
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: c.primary,
            }}
          />
        </div>
      ),
    },
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
            <button title={t.common.view} aria-label="Lihat detail" style={actionBtnStyle}>
              <Eye style={{ width: '18px', height: '18px' }} />
            </button>
          </Link>
          {can(PERMISSIONS.PILGRIMS_EDIT) && (
          <Link href={`/pilgrims/${row.id}/edit`}>
            <button title={t.common.edit} aria-label="Edit" style={actionBtnStyle}>
              <Edit2 style={{ width: '18px', height: '18px' }} />
            </button>
          </Link>
          )}
          {can(PERMISSIONS.PILGRIMS_DELETE) && (
          <button
            title={t.common.delete}
            aria-label="Hapus"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: row.id, name: row.name }); }}
            style={actionBtnStyle}
          >
            <Trash2 style={{ width: '18px', height: '18px' }} />
          </button>
          )}
        </div>
      ),
    },
  ];

  const actionBtnStyle: React.CSSProperties = {
    padding: isMobile ? '12px' : '8px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    color: c.textLight,
    minWidth: '44px',
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', paddingBottom: selectedIds.size > 0 ? '80px' : '0' }}>

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
            onClick={() => setShowImportModal(true)}
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
            <Upload style={{ width: '16px', height: '16px' }} />
            Import CSV
          </button>
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
          {can(PERMISSIONS.PILGRIMS_CREATE) && (
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
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center' }}>
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
        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', padding: '4px', flexShrink: 0 }}>
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'list' ? c.primary : 'transparent',
              color: viewMode === 'list' ? 'white' : c.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <List style={{ width: '18px', height: '18px' }} />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            title="Kanban View"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'kanban' ? c.primary : 'transparent',
              color: viewMode === 'kanban' ? 'white' : c.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <LayoutGrid style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>

      {/* Bulk success/error message */}
      {bulkMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: bulkMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: bulkMessage.type === 'success' ? '#065F46' : '#991B1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{bulkMessage.text}</span>
          <button
            onClick={() => setBulkMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'inherit' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        isMobile ? (
          /* Mobile: Single column with status tabs */
          <div>
            {/* Status tabs - horizontally scrollable */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', padding: '2px', minWidth: 'max-content' }}>
                {STATUS_OPTIONS.map((statusOpt) => {
                  const count = pilgrims.filter((p) => p.status === statusOpt.value).length;
                  const isActive = kanbanActiveStatus === statusOpt.value;
                  const statusColors: Record<string, string> = {
                    lead: '#6B7280', dp: '#F59E0B', lunas: '#10B981', dokumen: '#3B82F6',
                    visa: '#8B5CF6', ready: '#06B6D4', departed: '#EC4899', completed: '#22C55E',
                  };
                  const dotColor = statusColors[statusOpt.value] || c.textMuted;

                  return (
                    <button
                      key={statusOpt.value}
                      onClick={() => setKanbanActiveStatus(statusOpt.value)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        minHeight: '44px',
                        fontSize: '13px',
                        fontWeight: isActive ? '600' : '500',
                        color: isActive ? 'white' : c.textSecondary,
                        backgroundColor: isActive ? dotColor : c.cardBg,
                        border: `1px solid ${isActive ? dotColor : c.border}`,
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isActive ? 'white' : dotColor, flexShrink: 0 }} />
                      {statusOpt.label}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : c.pageBg,
                        color: isActive ? 'white' : c.textMuted,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cards for active status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: c.textMuted }}>Memuat...</div>
              ) : (() => {
                const activePilgrims = pilgrims.filter((p) => p.status === kanbanActiveStatus);
                if (activePilgrims.length === 0) {
                  return (
                    <div style={{
                      padding: '32px 16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: c.textMuted,
                      border: `2px dashed ${c.border}`,
                      borderRadius: '12px',
                      backgroundColor: c.pageBg,
                    }}>
                      Tidak ada jemaah dengan status ini
                    </div>
                  );
                }
                return activePilgrims.map((pilgrim) => (
                  <div
                    key={pilgrim.id}
                    onClick={() => window.location.href = `/pilgrims/${pilgrim.id}`}
                    style={{
                      backgroundColor: c.cardBg,
                      borderRadius: '12px',
                      border: `1px solid ${c.border}`,
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '13px', fontWeight: '600', flexShrink: 0,
                      }}>
                        {pilgrim.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pilgrim.name}
                        </div>
                        <div style={{ fontSize: '12px', color: c.textMuted, fontFamily: 'monospace' }}>
                          {pilgrim.nik}
                        </div>
                      </div>
                    </div>
                    {pilgrim.phone && (
                      <div style={{ fontSize: '12px', color: c.textMuted, marginTop: '4px' }}>
                        {pilgrim.phone}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : (
          /* Tablet/Desktop: Horizontal kanban columns */
          <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
              {STATUS_OPTIONS.map((statusOpt) => {
                const columnPilgrims = pilgrims.filter((p) => p.status === statusOpt.value);
                const statusColors: Record<string, string> = {
                  lead: '#6B7280', dp: '#F59E0B', lunas: '#10B981', dokumen: '#3B82F6',
                  visa: '#8B5CF6', ready: '#06B6D4', departed: '#EC4899', completed: '#22C55E',
                };
                const dotColor = statusColors[statusOpt.value] || c.textMuted;

                return (
                  <div
                    key={statusOpt.value}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = c.primaryLight || '#EFF6FF'; }}
                    onDragLeave={(e) => { e.currentTarget.style.backgroundColor = c.pageBg; }}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = c.pageBg; handleKanbanDrop(statusOpt.value); }}
                    style={{
                      minWidth: '220px',
                      width: '220px',
                      backgroundColor: c.pageBg,
                      borderRadius: '12px',
                      border: `1px solid ${c.border}`,
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    {/* Column header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{statusOpt.label}</span>
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: c.textMuted,
                        backgroundColor: c.cardBg,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}>
                        {columnPilgrims.length}
                      </span>
                    </div>

                    {/* Pilgrim cards */}
                    {loading ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: c.textMuted }}>...</div>
                    ) : columnPilgrims.length === 0 ? (
                      <div style={{ padding: '24px 8px', textAlign: 'center', fontSize: '12px', color: c.textMuted, border: `2px dashed ${c.border}`, borderRadius: '8px' }}>
                        Kosong
                      </div>
                    ) : (
                      columnPilgrims.map((pilgrim) => (
                        <div
                          key={pilgrim.id}
                          draggable
                          onDragStart={() => setDraggedPilgrim(pilgrim.id)}
                          onDragEnd={() => setDraggedPilgrim(null)}
                          onClick={() => window.location.href = `/pilgrims/${pilgrim.id}`}
                          style={{
                            backgroundColor: c.cardBg,
                            borderRadius: '10px',
                            border: `1px solid ${draggedPilgrim === pilgrim.id ? c.primary : c.border}`,
                            padding: '12px',
                            cursor: 'grab',
                            opacity: draggedPilgrim === pilgrim.id ? 0.5 : 1,
                            transition: 'border-color 0.15s, opacity 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              backgroundColor: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '11px', fontWeight: '600', flexShrink: 0,
                            }}>
                              {pilgrim.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {pilgrim.name}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: c.textMuted, fontFamily: 'monospace' }}>
                            {pilgrim.nik.length > 12 ? pilgrim.nik.slice(0, 12) + '...' : pilgrim.nik}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Table */}
      {viewMode === 'list' && <DataTable
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
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: c.textSecondary,
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
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
      />}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: '9999px',
            padding: '10px 20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: 'center',
            maxWidth: isMobile ? 'calc(100% - 32px)' : 'auto',
          }}
        >
          {/* Count badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: c.primary,
              color: 'white',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckSquare style={{ width: '14px', height: '14px' }} />
            {selectedIds.size} jemaah dipilih
          </div>

          {/* Ubah Status button + dropdown */}
          <div style={{ position: 'relative' }} ref={statusDropdownRef}>
            <button
              onClick={() => {
                setShowTripDropdown(false);
                setShowStatusDropdown((v) => !v);
              }}
              disabled={bulkLoading}
              style={{
                ...bulkBarBtnStyle,
                backgroundColor: c.primary,
                color: 'white',
                opacity: bulkLoading ? 0.7 : 1,
              }}
            >
              {bulkLoading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : null}
              Ubah Status
              <ChevronDown style={{ width: '14px', height: '14px' }} />
            </button>
            {showStatusDropdown && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  backgroundColor: c.cardBg,
                  border: `1px solid ${c.border}`,
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  minWidth: '160px',
                  zIndex: 1001,
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleBulkStatusChange(opt.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: c.textPrimary,
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.cardBgHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <StatusBadge status={opt.value as PilgrimStatus} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assign ke Trip button + dropdown */}
          <div style={{ position: 'relative' }} ref={tripDropdownRef}>
            <button
              onClick={() => {
                setShowStatusDropdown(false);
                setShowTripDropdown((v) => !v);
                fetchTrips();
              }}
              disabled={bulkLoading}
              style={{
                ...bulkBarBtnStyle,
                backgroundColor: c.cardBg,
                color: c.textPrimary,
                border: `1px solid ${c.border}`,
                opacity: bulkLoading ? 0.7 : 1,
              }}
            >
              Assign ke Trip
              <ChevronDown style={{ width: '14px', height: '14px' }} />
            </button>
            {showTripDropdown && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  backgroundColor: c.cardBg,
                  border: `1px solid ${c.border}`,
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  minWidth: '220px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  zIndex: 1001,
                }}
              >
                {trips.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: '13px', color: c.textMuted, textAlign: 'center' }}>
                    {tripsLoaded ? 'Tidak ada trip yang tersedia' : 'Memuat...'}
                  </div>
                ) : (
                  trips.map((trip) => {
                    const remaining = trip.capacity > 0 ? trip.capacity - trip.registeredCount : null;
                    return (
                      <button
                        key={trip.id}
                        onClick={() => handleBulkAssignTrip(trip.id)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: '13px',
                          color: c.textPrimary,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.cardBgHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div style={{ fontWeight: '500' }}>{trip.name}</div>
                        <div style={{ fontSize: '11px', color: c.textMuted, marginTop: '2px' }}>
                          {trip.registeredCount}/{trip.capacity || '-'} terdaftar
                          {remaining !== null && remaining >= 0 ? ` (sisa ${remaining})` : ''}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Hapus button */}
          <button
            onClick={() => {
              setShowStatusDropdown(false);
              setShowTripDropdown(false);
              setBulkDeleteConfirm(true);
            }}
            disabled={bulkLoading}
            style={{
              ...bulkBarBtnStyle,
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              opacity: bulkLoading ? 0.7 : 1,
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Hapus
          </button>

          {/* Batal button */}
          <button
            onClick={clearSelection}
            disabled={bulkLoading}
            style={{
              ...bulkBarBtnStyle,
              backgroundColor: 'transparent',
              color: c.textMuted,
            }}
          >
            <X style={{ width: '14px', height: '14px' }} />
            Batal
          </button>
        </div>
      )}

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus jemaah "${deleteTarget?.name}"?`}
        description="Data jemaah akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
      />

      {/* Bulk Delete Confirmation */}
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

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={() => fetchPilgrims(1)}
      />

      {/* Spin keyframe for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
