'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Plus, Trash2, Plane, User, CreditCard, ClipboardCheck, FileText, DollarSign, StickyNote, History, QrCode, Download, Link2, FileDown, MessageSquare, Send } from 'lucide-react';
import { StatusBadge, SectionCard, BackButton, DetailSkeleton, EmptyState, ConfirmDialog } from '@/components/shared';
import { DocumentUpload } from '@/components/pilgrims/document-upload';
import { StatusTimeline } from '@/components/pilgrims/status-timeline';
import { useFormStyles } from '@/lib/hooks/use-form-styles';
import { useAuth } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useResponsive } from '@/lib/hooks/use-responsive';
import type { Pilgrim } from '@/types/pilgrim';
import { PILGRIM_STATUS_CONFIG } from '@/types';
import type { PilgrimStatus, DocumentType } from '@/types';

export default function PilgrimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { inputStyle, selectStyle, labelStyle, c } = useFormStyles();
  const { isMobile } = useResponsive();
  const { user: authUser } = useAuth();

  const [pilgrim, setPilgrim] = useState<Pilgrim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment dialog state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: 'dp' as 'dp' | 'installment' | 'full' | 'refund',
    method: 'transfer' as 'transfer' | 'cash' | 'card',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);

  // Status history
  const [statusHistory, setStatusHistory] = useState<Array<{ id: string; action: string; details: Record<string, unknown>; createdAt: string }>>([]);

  // Delete payment confirm
  const [deletePayment, setDeletePayment] = useState<{ id: string; amount: number } | null>(null);

  // Invoice download
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // QR Code
  const [qrData, setQrData] = useState<{ qrDataUrl: string; verifyUrl: string } | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Internal notes
  const [internalNotes, setInternalNotes] = useState<Array<{ id: string; content: string; authorId: string; authorName: string; createdAt: string }>>([]);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Trip assignment
  const [trips, setTrips] = useState<{ id: string; name: string; status: string; departureDate: string | null }[]>([]);
  const [savingTrip, setSavingTrip] = useState(false);

  useEffect(() => {
    fetch('/api/trips')
      .then((res) => res.json())
      .then((json) => setTrips(json.data || []))
      .catch(() => {});
  }, []);

  async function handleTripChange(tripId: string) {
    if (!pilgrim) return;
    const newTripId = tripId || undefined;
    if (newTripId === pilgrim.tripId) return;
    setSavingTrip(true);
    try {
      const res = await fetch(`/api/pilgrims/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pilgrim,
          tripId: newTripId,
          emergencyContact: pilgrim.emergencyContact,
        }),
      });
      if (res.ok) {
        setPilgrim((prev) => prev ? { ...prev, tripId: newTripId as string | undefined } : prev);
      }
    } catch {
      // silently fail
    } finally {
      setSavingTrip(false);
    }
  }

  useEffect(() => {
    async function fetchPilgrim() {
      try {
        const res = await fetch(`/api/pilgrims/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setPilgrim(data);
      } catch {
        setError('Jemaah tidak ditemukan');
      } finally {
        setLoading(false);
      }
    }
    fetchPilgrim();
  }, [id]);

  // Fetch status history
  useEffect(() => {
    fetch(`/api/pilgrims/${id}/history`)
      .then((res) => res.json())
      .then((json) => setStatusHistory(json.data || []))
      .catch(() => {});
  }, [id]);

  // Fetch internal notes
  useEffect(() => {
    fetch(`/api/pilgrims/${id}/notes`)
      .then((res) => res.json())
      .then((json) => setInternalNotes(json.data || []))
      .catch(() => {});
  }, [id]);

  async function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/pilgrims/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim() }),
      });
      if (res.ok) {
        const newNote = await res.json();
        setInternalNotes((prev) => [newNote, ...prev]);
        setNoteContent('');
      }
    } catch {
      // silently fail
    } finally {
      setSavingNote(false);
    }
  }

  async function handleNoteDelete(noteId: string) {
    try {
      const res = await fetch(`/api/pilgrims/${id}/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        setInternalNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch {
      // silently fail
    }
  }

  function noteTimeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'baru saja';
    if (diffMin < 60) return `${diffMin}m lalu`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}j lalu`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}h lalu`;
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pilgrim) return;
    setSavingPayment(true);
    try {
      const res = await fetch(`/api/pilgrims/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          type: paymentForm.type,
          method: paymentForm.method,
          date: paymentForm.date,
          notes: paymentForm.notes || undefined,
        }),
      });
      if (!res.ok) return;
      const newPayment = await res.json();
      const newAmount = parseFloat(paymentForm.amount);
      setPilgrim((prev) =>
        prev
          ? {
              ...prev,
              payments: [newPayment, ...(prev.payments || [])],
              totalPaid: prev.totalPaid + newAmount,
              remainingBalance: prev.remainingBalance - newAmount,
            }
          : prev
      );
      setShowPayment(false);
      setPaymentForm({ amount: '', type: 'dp', method: 'transfer', date: new Date().toISOString().split('T')[0], notes: '' });
    } catch {
      // silently fail
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!pilgrim || newStatus === pilgrim.status) return;
    try {
      const res = await fetch(`/api/pilgrims/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) return;
      setPilgrim((prev) => prev ? { ...prev, status: newStatus as PilgrimStatus } : prev);
      // Refresh status history after change
      fetch(`/api/pilgrims/${id}/history`)
        .then((r) => r.json())
        .then((json) => setStatusHistory(json.data || []))
        .catch(() => {});
    } catch {
      // silently fail
    }
  }

  async function handlePaymentDelete() {
    if (!deletePayment) return;
    try {
      const res = await fetch(`/api/pilgrims/${id}/payments/${deletePayment.id}`, { method: 'DELETE' });
      if (!res.ok) return;
      setPilgrim((prev) =>
        prev
          ? {
              ...prev,
              payments: (prev.payments || []).filter((p) => p.id !== deletePayment.id),
              totalPaid: prev.totalPaid - deletePayment.amount,
              remainingBalance: prev.remainingBalance + deletePayment.amount,
            }
          : prev
      );
    } catch {
      // silently fail
    } finally {
      setDeletePayment(null);
    }
  }

  async function handleDownloadInvoice() {
    if (downloadingInvoice) return;
    setDownloadingInvoice(true);
    try {
      const res = await fetch(`/api/pilgrims/${id}/invoice`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kwitansi-${pilgrim?.name || 'jemaah'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setDownloadingInvoice(false);
    }
  }

  async function fetchQrCode() {
    if (loadingQr) return;
    setLoadingQr(true);
    try {
      const res = await fetch(`/api/pilgrims/${id}/qr`);
      if (res.ok) {
        const json = await res.json();
        setQrData(json.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingQr(false);
    }
  }

  function handleDownloadQr() {
    if (!qrData) return;
    const a = document.createElement('a');
    a.href = qrData.qrDataUrl;
    a.download = `qr-${pilgrim?.name || 'pilgrim'}.png`;
    a.click();
  }

  function handleCopyLink() {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.verifyUrl).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }).catch(() => {});
  }

  if (loading) return <DetailSkeleton />;

  if (error || !pilgrim) {
    return (
      <EmptyState
        title={error || 'Jemaah tidak ditemukan'}
        description="Data tidak dapat ditemukan. Kembali ke daftar jemaah."
        action={{ label: 'Kembali ke Daftar', href: '/pilgrims' }}
      />
    );
  }

  const emergencyContact = pilgrim.emergencyContact as { name: string; phone: string; relation: string };
  const checklist = (pilgrim.checklist || {}) as unknown as Record<string, boolean>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <BackButton href="/pilgrims" />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {pilgrim.name}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>{pilgrim.email}</p>
        </div>
        <Link href={`/pilgrims/${pilgrim.id}/edit`} style={{ textDecoration: 'none' }}>
          <button
            type="button"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: c.textSecondary,
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Edit style={{ width: '16px', height: '16px' }} />
            Edit
          </button>
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr' }}>
        {/* Personal Info */}
        <div style={{ gridColumn: isMobile ? undefined : 'span 2' }}>
          <SectionCard title="Personal Information" icon={<User style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <InfoField label="Full Name" value={pilgrim.name} c={c} />
                <InfoField label="NIK" value={pilgrim.nik} c={c} mono />
                <InfoField label="Gender" value={pilgrim.gender === 'male' ? 'Male' : 'Female'} c={c} />
                <InfoField label="Birth" value={`${pilgrim.birthPlace}, ${formatDate(pilgrim.birthDate)}`} c={c} />
                <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
                  <InfoField label="Address" value={`${pilgrim.address}, ${pilgrim.city}, ${pilgrim.province}`} c={c} />
                </div>
                <InfoField label="Phone" value={pilgrim.phone} c={c} />
                <InfoField label="Email" value={pilgrim.email} c={c} />
              </div>

              <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 12px' }}>Emergency Contact</p>
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr' }}>
                  <InfoField label="Name" value={emergencyContact.name} c={c} small />
                  <InfoField label="Relation" value={emergencyContact.relation} c={c} small />
                  <InfoField label="Phone" value={emergencyContact.phone} c={c} small />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Status & Payment */}
        <SectionCard title="Status & Payment" icon={<CreditCard style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 8px' }}>Current Status</p>
              <select value={pilgrim.status} onChange={(e) => handleStatusChange(e.target.value)} style={selectStyle}>
                {Object.entries(PILGRIM_STATUS_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Total Paid</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: '4px 0 0' }}>{formatCurrency(pilgrim.totalPaid)}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Remaining</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: c.error, margin: '4px 0 0' }}>{formatCurrency(pilgrim.remainingBalance)}</p>
            </div>
            <div style={{ paddingTop: '16px', borderTop: `1px solid ${c.border}` }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plane style={{ width: '16px', height: '16px' }} />
                Trip Assignment
              </p>
              <select
                value={pilgrim.tripId || ''}
                onChange={(e) => handleTripChange(e.target.value)}
                disabled={savingTrip}
                style={{ ...selectStyle, opacity: savingTrip ? 0.5 : 1, cursor: savingTrip ? 'not-allowed' : 'pointer' }}
              >
                <option value="">— Belum ditugaskan —</option>
                {trips
                  .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.departureDate ? `(${formatDate(t.departureDate)})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Documents */}
        <div style={{ gridColumn: isMobile ? undefined : 'span 2' }}>
          <DocumentUpload
            documents={pilgrim.documents || []}
            onUpload={async (type: DocumentType, file: File) => {
              try {
                const res = await fetch(`/api/pilgrims/${id}/documents`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type, status: 'uploaded', fileName: file.name, fileSize: file.size }),
                });
                if (!res.ok) return;
                const newDoc = await res.json();
                setPilgrim((prev) => prev ? { ...prev, documents: [newDoc, ...(prev.documents || [])] } : prev);
              } catch { /* silently fail */ }
            }}
            onRemove={async (documentId: string) => {
              try {
                const res = await fetch(`/api/pilgrims/${id}/documents/${documentId}`, { method: 'DELETE' });
                if (!res.ok) return;
                setPilgrim((prev) => prev ? { ...prev, documents: (prev.documents || []).filter((d) => d.id !== documentId) } : prev);
              } catch { /* silently fail */ }
            }}
          />
        </div>

        {/* Checklist */}
        <SectionCard title="Checklist" icon={<ClipboardCheck style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ChecklistItem label="KTP Uploaded" checked={!!checklist.ktpUploaded} c={c} />
            <ChecklistItem label="Passport Uploaded" checked={!!checklist.passportUploaded} c={c} />
            <ChecklistItem label="Passport Valid (6+ months)" checked={!!checklist.passportValid} c={c} />
            <ChecklistItem label="Photo Uploaded" checked={!!checklist.photoUploaded} c={c} />
            <ChecklistItem label="DP Paid" checked={!!checklist.dpPaid} c={c} />
            <ChecklistItem label="Full Payment" checked={!!checklist.fullPayment} c={c} />
            <ChecklistItem label="Visa Submitted" checked={!!checklist.visaSubmitted} c={c} />
            <ChecklistItem label="Visa Received" checked={!!checklist.visaReceived} c={c} />
            <ChecklistItem label="Health Certificate" checked={!!checklist.healthCertificate} c={c} />
          </div>
        </SectionCard>

        {/* QR Verification */}
        <SectionCard title="QR Verifikasi" icon={<QrCode style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {!qrData ? (
              <button
                type="button"
                onClick={fetchQrCode}
                disabled={loadingQr}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: loadingQr ? c.textMuted : c.primary,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loadingQr ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <QrCode style={{ width: '16px', height: '16px' }} />
                {loadingQr ? 'Generating...' : 'Generate QR Code'}
              </button>
            ) : (
              <>
                <img src={qrData.qrDataUrl} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px' }} />
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, textAlign: 'center', wordBreak: 'break-all' }}>
                  {qrData.verifyUrl}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    style={{
                      padding: '8px 16px', fontSize: '13px', fontWeight: '500',
                      color: c.textSecondary, backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
                      borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <Download style={{ width: '14px', height: '14px' }} />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      padding: '8px 16px', fontSize: '13px', fontWeight: '500',
                      color: c.textSecondary, backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
                      borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <Link2 style={{ width: '14px', height: '14px' }} />
                    {copyFeedback ? 'Tersalin!' : 'Copy Link'}
                  </button>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Status Timeline */}
        <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
          <SectionCard title="Riwayat Status" icon={<History style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
            <StatusTimeline currentStatus={pilgrim.status} history={statusHistory} />
          </SectionCard>
        </div>

        {/* Notes */}
        {pilgrim.notes && (
          <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
            <SectionCard title="Catatan" icon={<StickyNote style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
              <p style={{ fontSize: '14px', color: c.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>{pilgrim.notes}</p>
            </SectionCard>
          </div>
        )}

        {/* Internal Notes */}
        <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
          <SectionCard title="Catatan Internal" icon={<MessageSquare style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* New note form */}
              <form onSubmit={handleNoteSubmit} style={{ display: 'flex', gap: '8px', alignItems: isMobile ? 'stretch' : 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Tulis catatan internal..."
                  rows={2}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.inputBg || c.cardBg,
                    color: c.textPrimary,
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    minHeight: '60px',
                  }}
                />
                <button
                  type="submit"
                  disabled={savingNote || !noteContent.trim()}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: savingNote || !noteContent.trim() ? c.textMuted : c.primary,
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: savingNote || !noteContent.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    alignSelf: isMobile ? 'stretch' : 'flex-end',
                    height: isMobile ? 'auto' : '44px',
                  }}
                >
                  <Send style={{ width: '14px', height: '14px' }} />
                  {savingNote ? 'Mengirim...' : 'Kirim'}
                </button>
              </form>

              {/* Notes list */}
              {internalNotes.length === 0 ? (
                <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '16px 0', margin: 0 }}>
                  Belum ada catatan internal
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {internalNotes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${c.border}`,
                        backgroundColor: c.cardBg,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '10px', fontWeight: '600', flexShrink: 0,
                          }}>
                            {note.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{note.authorName}</span>
                          <span style={{ fontSize: '11px', color: c.textMuted }}>{noteTimeAgo(note.createdAt)}</span>
                        </div>
                        {authUser && (authUser.id === note.authorId || authUser.role === 'owner') && (
                          <button
                            onClick={() => handleNoteDelete(note.id)}
                            title="Hapus catatan"
                            style={{
                              padding: '4px', borderRadius: '6px', border: 'none',
                              backgroundColor: 'transparent', color: c.textMuted, cursor: 'pointer', display: 'flex',
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: c.textPrimary, margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Payment History */}
        <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
          <SectionCard
            title="Payment History"
            icon={<DollarSign style={{ width: '18px', height: '18px', color: c.textMuted }} />}
            headerRight={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: c.textSecondary,
                    backgroundColor: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    cursor: downloadingInvoice ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: downloadingInvoice ? 0.6 : 1,
                  }}
                >
                  <FileDown style={{ width: '14px', height: '14px' }} />
                  {downloadingInvoice ? 'Mengunduh...' : 'Unduh Kwitansi'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayment(true)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: c.primary,
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Tambah Pembayaran
                </button>
              </div>
            }
          >
            {pilgrim.payments && pilgrim.payments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pilgrim.payments.map((payment) => (
                  <div
                    key={payment.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '12px',
                      border: `1px solid ${c.border}`,
                      padding: '16px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0, textTransform: 'capitalize' }}>{payment.type}</p>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0 0' }}>{formatDate(payment.date)} &bull; {payment.method}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: payment.type === 'refund' ? c.error : c.success, margin: 0 }}>
                        {payment.type === 'refund' ? '- ' : '+ '}{formatCurrency(payment.amount)}
                      </p>
                      <button
                        onClick={() => setDeletePayment({ id: payment.id, amount: payment.amount })}
                        title="Hapus pembayaran"
                        style={{ padding: '4px', borderRadius: '8px', color: c.textMuted, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '32px 0', margin: 0 }}>Belum ada pembayaran</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowPayment(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 16px', backgroundColor: c.cardBg, borderRadius: '16px', border: `1px solid ${c.border}`, padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: '0 0 20px' }}>Tambah Pembayaran</h3>
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Jumlah (Rp)</label>
                <input type="number" min="1" required value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} placeholder="5000000" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Tipe</label>
                  <select value={paymentForm.type} onChange={(e) => setPaymentForm((f) => ({ ...f, type: e.target.value as typeof f.type }))} style={selectStyle}>
                    <option value="dp">DP</option>
                    <option value="installment">Cicilan</option>
                    <option value="full">Lunas</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Metode</label>
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value as typeof f.method }))} style={selectStyle}>
                    <option value="transfer">Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Kartu</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input type="date" required value={paymentForm.date} onChange={(e) => setPaymentForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Catatan</label>
                <input value={paymentForm.notes} onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Opsional" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowPayment(false)} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: c.textSecondary, backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '12px', cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" disabled={savingPayment} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: 'white', backgroundColor: savingPayment ? c.textMuted : c.primary, border: 'none', borderRadius: '12px', cursor: savingPayment ? 'not-allowed' : 'pointer' }}>
                  {savingPayment ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation */}
      <ConfirmDialog
        open={!!deletePayment}
        onClose={() => setDeletePayment(null)}
        onConfirm={handlePaymentDelete}
        title="Hapus pembayaran ini?"
        description="Pembayaran akan dihapus dan saldo jemaah akan diperbarui."
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  );
}

function InfoField({ label, value, c, mono, small }: { label: string; value: string; c: Record<string, string>; mono?: boolean; small?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: small ? '12px' : '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>{label}</p>
      <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0', fontFamily: mono ? 'monospace' : undefined }}>{value}</p>
    </div>
  );
}

function ChecklistItem({ label, checked, c }: { label: string; checked: boolean; c: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: checked ? c.success : 'transparent',
          border: checked ? 'none' : `2px solid ${c.border}`,
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: '14px', color: checked ? c.textPrimary : c.textMuted }}>{label}</span>
    </div>
  );
}
