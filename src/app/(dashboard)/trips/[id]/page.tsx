'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Printer, Plane, ClipboardCheck, Users, Plus, Search, X, Trash2, Clock, Phone, Mail } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { TripStatus, PilgrimStatus } from '@/types';
import { useLanguage } from '@/lib/i18n';

interface ManifestEntry {
  pilgrimId: string;
  pilgrimName: string;
  pilgrimStatus: string;
  documentsComplete: number;
  documentsTotal: number;
  roomNumber?: string | null;
  roomType?: string | null;
}

interface AvailablePilgrim {
  id: string;
  name: string;
  nik: string;
  phone: string;
  status: string;
}

interface TripDetail {
  id: string;
  name: string;
  packageId: string | null;
  departureDate: string | null;
  returnDate: string | null;
  capacity: number;
  registeredCount: number;
  confirmedCount: number;
  status: string;
  muthawwifName: string | null;
  muthawwifPhone: string | null;
  flightInfo: {
    departureAirline?: string;
    departureFlightNo?: string;
    departureTime?: string;
    returnAirline?: string;
    returnFlightNo?: string;
    returnTime?: string;
  } | null;
  checklist: {
    allPilgrimsConfirmed?: boolean;
    manifestComplete?: boolean;
    roomingListFinalized?: boolean;
    flightTicketsIssued?: boolean;
    hotelConfirmed?: boolean;
    guideAssigned?: boolean;
    insuranceProcessed?: boolean;
    departureBriefingDone?: boolean;
  } | null;
  manifest: ManifestEntry[];
}

const ROOM_TYPES = [
  { value: '', label: '-' },
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
  { value: 'quad', label: 'Quad' },
];

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add pilgrim modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availablePilgrims, setAvailablePilgrims] = useState<AvailablePilgrim[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingPilgrimId, setAddingPilgrimId] = useState<string | null>(null);

  // Remove pilgrim state
  const [removeTarget, setRemoveTarget] = useState<ManifestEntry | null>(null);
  const [removing, setRemoving] = useState(false);

  // Room editing state
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [roomNumberDraft, setRoomNumberDraft] = useState('');
  const [roomTypeDraft, setRoomTypeDraft] = useState('');

  // Waiting list state
  const [waitingList, setWaitingList] = useState<Array<{
    id: string;
    pilgrimName: string;
    phone: string;
    email?: string | null;
    notes?: string | null;
    createdAt: string;
  }>>([]);
  const [wlForm, setWlForm] = useState({ pilgrimName: '', phone: '', email: '', notes: '' });
  const [savingWl, setSavingWl] = useState(false);
  const [deletingWlId, setDeletingWlId] = useState<string | null>(null);

  const { addToast } = useToast();

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTrip = useCallback(() => {
    fetch(`/api/trips/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setTrip(data))
      .catch(() => setError(t.common.noData))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Fetch waiting list
  useEffect(() => {
    if (!id) return;
    fetch(`/api/trips/${id}/waiting-list`)
      .then((res) => res.json())
      .then((json) => setWaitingList(json.data || []))
      .catch(() => {});
  }, [id]);

  async function handleAddWaitingList(e: React.FormEvent) {
    e.preventDefault();
    if (!wlForm.pilgrimName.trim() || !wlForm.phone.trim()) return;
    setSavingWl(true);
    try {
      const res = await fetch(`/api/trips/${id}/waiting-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilgrimName: wlForm.pilgrimName.trim(),
          phone: wlForm.phone.trim(),
          email: wlForm.email.trim() || undefined,
          notes: wlForm.notes.trim() || undefined,
        }),
      });
      if (res.ok) {
        const entry = await res.json();
        setWaitingList((prev) => [...prev, entry]);
        setWlForm({ pilgrimName: '', phone: '', email: '', notes: '' });
      }
    } catch {
      // silently fail
    } finally {
      setSavingWl(false);
    }
  }

  async function handleDeleteWaitingList(entryId: string) {
    setDeletingWlId(entryId);
    try {
      const res = await fetch(`/api/trips/${id}/waiting-list/${entryId}`, { method: 'DELETE' });
      if (res.ok) {
        setWaitingList((prev) => prev.filter((e) => e.id !== entryId));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingWlId(null);
    }
  }

  // Search available pilgrims when modal opens or query changes
  useEffect(() => {
    if (!showAddModal) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchLoading(true);
      const params = new URLSearchParams({ available: '1' });
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      fetch(`/api/pilgrims?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          // Filter out pilgrims already in manifest
          const manifestIds = new Set((trip?.manifest || []).map((m) => m.pilgrimId));
          const filtered = (data.data || data.pilgrims || []).filter(
            (p: AvailablePilgrim) => !manifestIds.has(p.id)
          );
          setAvailablePilgrims(filtered);
        })
        .catch(() => setAvailablePilgrims([]))
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [showAddModal, searchQuery, trip?.manifest]);

  async function handleAddPilgrim(pilgrimId: string) {
    setAddingPilgrimId(pilgrimId);
    try {
      const res = await fetch(`/api/trips/${id}/manifest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilgrimId }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast({ type: 'error', title: t.common.error + ' menambahkan jemaah', description: data.error });
        return;
      }

      // Refresh trip data
      fetchTrip();
      // Remove from available list
      setAvailablePilgrims((prev) => prev.filter((p) => p.id !== pilgrimId));
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan' });
    } finally {
      setAddingPilgrimId(null);
    }
  }

  async function handleRemovePilgrim() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/trips/${id}/manifest/${removeTarget.pilgrimId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        addToast({ type: 'error', title: t.common.error + ' menghapus jemaah', description: data.error });
        return;
      }

      fetchTrip();
      setRemoveTarget(null);
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan' });
    } finally {
      setRemoving(false);
    }
  }

  async function handleSaveRoom(pilgrimId: string) {
    try {
      const res = await fetch(`/api/trips/${id}/manifest`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilgrimId,
          roomNumber: roomNumberDraft,
          roomType: roomTypeDraft,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast({ type: 'error', title: t.common.error + ' update room', description: data.error });
        return;
      }

      // Update local state
      setTrip((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          manifest: prev.manifest.map((m) =>
            m.pilgrimId === pilgrimId
              ? { ...m, roomNumber: roomNumberDraft || null, roomType: roomTypeDraft || null }
              : m
          ),
        };
      });
      setEditingRoom(null);
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan' });
    }
  }

  function startEditRoom(entry: ManifestEntry) {
    setEditingRoom(entry.pilgrimId);
    setRoomNumberDraft(entry.roomNumber || '');
    setRoomTypeDraft(entry.roomType || '');
  }

  function handlePrintManifest() {
    if (!trip) return;
    const rows = (trip.manifest || [])
      .map((e, i) => `<tr><td style="padding:8px;border:1px solid #ddd;text-align:center">${i + 1}</td><td style="padding:8px;border:1px solid #ddd">${e.pilgrimName}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${e.pilgrimStatus}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${e.documentsComplete}/${e.documentsTotal}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${e.roomNumber || '-'}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${e.roomType || '-'}</td></tr>`)
      .join('');
    const html = `<!DOCTYPE html><html><head><title>Manifest - ${trip.name}</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:8px;border:1px solid #ddd;text-align:left;font-size:12px;text-transform:uppercase}td{font-size:13px}h1{font-size:20px;margin:0 0 4px 0}p{color:#666;font-size:13px;margin:0 0 16px 0}@media print{body{padding:0}}</style></head><body><h1>${trip.name}</h1><p>Keberangkatan: ${trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} &bull; ${trip.manifest?.length || 0} jemaah</p><table><thead><tr><th style="width:40px">No</th><th>Nama</th><th style="width:100px">Status</th><th style="width:100px">Dokumen</th><th style="width:80px">Kamar</th><th style="width:80px">Tipe</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: c.textMuted }}>
        Memuat data trip...
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: c.textMuted }}>
        {error || t.common.noData}
      </div>
    );
  }

  const checklist = trip.checklist || {};
  const checklistItems = [
    { label: 'All pilgrims confirmed', checked: checklist.allPilgrimsConfirmed },
    { label: 'Manifest lengkap', checked: checklist.manifestComplete },
    { label: 'Daftar kamar sudah final', checked: checklist.roomingListFinalized },
    { label: 'Tiket pesawat sudah terbit', checked: checklist.flightTicketsIssued },
    { label: 'Hotel sudah dikonfirmasi', checked: checklist.hotelConfirmed },
    { label: 'Pembimbing sudah ditugaskan', checked: checklist.guideAssigned },
    { label: 'Asuransi sudah diproses', checked: checklist.insuranceProcessed },
    { label: 'Briefing keberangkatan selesai', checked: checklist.departureBriefingDone },
  ];

  const capacityPercent = trip.capacity > 0 ? Math.round((trip.registeredCount / trip.capacity) * 100) : 0;

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '500',
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '14px',
    borderTop: `1px solid ${c.border}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/trips" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px', color: c.textMuted }} />
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {trip.name}
          </h1>
          {trip.packageId && (
            <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>{trip.packageId}</p>
          )}
        </div>
        <StatusBadge status={trip.status as TripStatus} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '24px',
        }}
      >
        {/* Trip Info Card */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px 20px' : '20px 28px',
              borderBottom: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Plane style={{ width: '18px', height: '18px', color: c.primary }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Informasi Perjalanan
            </h3>
          </div>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 4px 0' }}>Keberangkatan</p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: '0 0 4px 0' }}>
                  {trip.departureDate ? formatDate(trip.departureDate) : '-'}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                  {trip.flightInfo?.departureAirline || ''} {trip.flightInfo?.departureFlightNo || ''}{' '}
                  {trip.flightInfo?.departureTime ? `• ${trip.flightInfo.departureTime}` : ''}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 4px 0' }}>Kepulangan</p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: '0 0 4px 0' }}>
                  {trip.returnDate ? formatDate(trip.returnDate) : '-'}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                  {trip.flightInfo?.returnAirline || ''} {trip.flightInfo?.returnFlightNo || ''}{' '}
                  {trip.flightInfo?.returnTime ? `• ${trip.flightInfo.returnTime}` : ''}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 4px 0' }}>Kapasitas</p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: 0 }}>
                  {trip.registeredCount}/{trip.capacity} jemaah
                </p>
              </div>
            </div>

            {(trip.muthawwifName || checklist.guideAssigned) && (
              <div style={{ paddingTop: '20px', marginTop: '20px', borderTop: `1px solid ${c.border}` }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 8px 0' }}>
                  Pembimbing/Muthawwif
                </p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: '0 0 4px 0' }}>
                  {trip.muthawwifName || '-'}
                </p>
                <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{trip.muthawwifPhone || '-'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Operational Checklist Card */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px 20px' : '20px 28px',
              borderBottom: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ClipboardCheck style={{ width: '18px', height: '18px', color: c.primary }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Checklist Operasional
            </h3>
          </div>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {checklistItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2
                    style={{
                      width: '16px',
                      height: '16px',
                      color: item.checked ? c.success : c.textLight,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      color: item.checked ? c.textPrimary : c.textMuted,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Card */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '16px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: isMobile ? '16px 20px' : '20px 28px',
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '18px', height: '18px', color: c.primary }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Trip Manifest
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { setShowAddModal(true); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: c.primary,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              Tambah Jemaah
            </button>
            {trip.manifest && trip.manifest.length > 0 && (
              <button
                onClick={handlePrintManifest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: c.cardBg,
                  color: c.textSecondary,
                  border: `1px solid ${c.border}`,
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                <Printer style={{ width: '14px', height: '14px' }} />
                Print
              </button>
            )}
          </div>
        </div>

        {/* Capacity indicator */}
        <div style={{ padding: isMobile ? '16px 20px 0' : '20px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>
              {trip.registeredCount}/{trip.capacity} Jemaah
            </span>
            <span style={{ fontSize: '12px', color: c.textMuted }}>
              {capacityPercent}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: c.border,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(capacityPercent, 100)}%`,
                height: '100%',
                backgroundColor: capacityPercent >= 100 ? '#EF4444' : capacityPercent >= 80 ? '#F59E0B' : c.primary,
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div style={{ padding: isMobile ? '20px' : '28px' }}>
          {(!trip.manifest || trip.manifest.length === 0) ? (
            <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '16px 0' }}>
              Belum ada jemaah. Klik &quot;Tambah Jemaah&quot; untuk menambahkan.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    <th style={thStyle}>Nama</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Dokumen</th>
                    <th style={thStyle}>Kamar</th>
                    <th style={thStyle}>Tipe Kamar</th>
                    <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {trip.manifest.map((entry) => (
                    <tr key={entry.pilgrimId}>
                      <td style={{ ...tdStyle, color: c.textPrimary, fontWeight: '500' }}>
                        {entry.pilgrimName}
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={entry.pilgrimStatus as PilgrimStatus} size="sm" />
                      </td>
                      <td style={{ ...tdStyle, color: c.textMuted }}>
                        {entry.documentsComplete}/{entry.documentsTotal}
                      </td>
                      <td style={tdStyle}>
                        {editingRoom === entry.pilgrimId ? (
                          <input
                            type="text"
                            value={roomNumberDraft}
                            onChange={(e) => setRoomNumberDraft(e.target.value)}
                            placeholder="No. Kamar"
                            style={{
                              width: '80px',
                              padding: '4px 8px',
                              fontSize: '13px',
                              border: `1px solid ${c.border}`,
                              borderRadius: '6px',
                              backgroundColor: c.cardBg,
                              color: c.textPrimary,
                              outline: 'none',
                            }}
                          />
                        ) : (
                          <span
                            onClick={() => startEditRoom(entry)}
                            style={{ color: c.textMuted, cursor: 'pointer' }}
                            title="Klik untuk edit"
                          >
                            {entry.roomNumber || '-'}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {editingRoom === entry.pilgrimId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <select
                              value={roomTypeDraft}
                              onChange={(e) => setRoomTypeDraft(e.target.value)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '13px',
                                border: `1px solid ${c.border}`,
                                borderRadius: '6px',
                                backgroundColor: c.cardBg,
                                color: c.textPrimary,
                                outline: 'none',
                              }}
                            >
                              {ROOM_TYPES.map((rt) => (
                                <option key={rt.value} value={rt.value}>{rt.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleSaveRoom(entry.pilgrimId)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '500',
                                backgroundColor: c.primary,
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingRoom(null)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: 'transparent',
                                color: c.textMuted,
                                border: `1px solid ${c.border}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => startEditRoom(entry)}
                            style={{ color: c.textMuted, cursor: 'pointer', textTransform: 'capitalize' }}
                            title="Klik untuk edit"
                          >
                            {entry.roomType || '-'}
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button
                          onClick={() => setRemoveTarget(entry)}
                          style={{
                            padding: '6px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#EF4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Hapus dari manifest"
                          aria-label="Hapus"
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Waiting List Section - shown when at or over capacity */}
      {trip.capacity > 0 && trip.registeredCount >= trip.capacity && (
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px 20px' : '20px 28px',
              borderBottom: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Clock style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Daftar Tunggu
            </h3>
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
              }}
            >
              {waitingList.length} orang
            </span>
          </div>

          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            {/* Add form */}
            <form onSubmit={handleAddWaitingList} style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <input
                  type="text"
                  value={wlForm.pilgrimName}
                  onChange={(e) => setWlForm((f) => ({ ...f, pilgrimName: e.target.value }))}
                  placeholder="Nama lengkap *"
                  required
                  style={{
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: c.textPrimary,
                    backgroundColor: c.pageBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    outline: 'none',
                  }}
                />
                <input
                  type="tel"
                  value={wlForm.phone}
                  onChange={(e) => setWlForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="No. telepon *"
                  required
                  style={{
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: c.textPrimary,
                    backgroundColor: c.pageBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    outline: 'none',
                  }}
                />
                <input
                  type="email"
                  value={wlForm.email}
                  onChange={(e) => setWlForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email (opsional)"
                  style={{
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: c.textPrimary,
                    backgroundColor: c.pageBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  value={wlForm.notes}
                  onChange={(e) => setWlForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Catatan (opsional)"
                  style={{
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: c.textPrimary,
                    backgroundColor: c.pageBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={savingWl}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: savingWl ? c.textMuted : '#F59E0B',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: savingWl ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus style={{ width: '14px', height: '14px' }} />
                {savingWl ? 'Menambahkan...' : 'Tambah ke Daftar Tunggu'}
              </button>
            </form>

            {/* Waiting list entries */}
            {waitingList.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '16px 0' }}>
                Belum ada yang masuk daftar tunggu.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {waitingList.map((entry, idx) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${c.border}`,
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>
                          {entry.pilgrimName}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone style={{ width: '12px', height: '12px' }} />
                            {entry.phone}
                          </span>
                          {entry.email && (
                            <span style={{ fontSize: '12px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail style={{ width: '12px', height: '12px' }} />
                              {entry.email}
                            </span>
                          )}
                          {entry.notes && (
                            <span style={{ fontSize: '12px', color: c.textMuted, fontStyle: 'italic' }}>
                              {entry.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteWaitingList(entry.id)}
                      disabled={deletingWlId === entry.id}
                      style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: deletingWlId === entry.id ? 'not-allowed' : 'pointer',
                        color: '#EF4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: deletingWlId === entry.id ? 0.5 : 1,
                        flexShrink: 0,
                      }}
                      title="Hapus dari daftar tunggu"
                      aria-label="Hapus"
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Pilgrim Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={() => setShowAddModal(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              backgroundColor: c.cardBg,
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${c.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                Tambah Jemaah ke Manifest
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: c.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Search input */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${c.border}` }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: c.pageBg,
                  borderRadius: '10px',
                  border: `1px solid ${c.border}`,
                }}
              >
                <Search style={{ width: '16px', height: '16px', color: c.textMuted, flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama atau NIK..."
                  autoFocus
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    color: c.textPrimary,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Pilgrim List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 24px' }}>
              {searchLoading ? (
                <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
                  Mencari...
                </p>
              ) : availablePilgrims.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
                  {searchQuery ? 'Tidak ada jemaah yang cocok' : 'Tidak ada jemaah yang tersedia'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                  {availablePilgrims.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${c.border}`,
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </p>
                        <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                          NIK: {p.nik} &bull; {p.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddPilgrim(p.id)}
                        disabled={addingPilgrimId === p.id}
                        style={{
                          padding: '6px 14px',
                          fontSize: '13px',
                          fontWeight: '500',
                          backgroundColor: c.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: addingPilgrimId === p.id ? 'not-allowed' : 'pointer',
                          opacity: addingPilgrimId === p.id ? 0.7 : 1,
                          flexShrink: 0,
                        }}
                      >
                        {addingPilgrimId === p.id ? '...' : 'Tambah'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemovePilgrim}
        title="Hapus dari Manifest"
        description={`Yakin ingin menghapus ${removeTarget?.pilgrimName} dari manifest trip ini? Data kamar akan direset.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="destructive"
        loading={removing}
      />
    </div>
  );
}
