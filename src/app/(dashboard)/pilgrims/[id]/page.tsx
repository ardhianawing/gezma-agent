'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Plus, Trash2, Plane, User, CreditCard, ClipboardCheck, FileText, DollarSign, StickyNote } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { DocumentUpload } from '@/components/pilgrims/document-upload';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import type { Pilgrim } from '@/types/pilgrim';
import { PILGRIM_STATUS_CONFIG } from '@/types';
import type { PilgrimStatus, DocumentType } from '@/types';

export default function PilgrimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { c } = useTheme();
  const { isMobile } = useResponsive();

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
      setPaymentForm({
        amount: '',
        type: 'dp',
        method: 'transfer',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
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
    } catch {
      // silently fail
    }
  }

  async function handlePaymentDelete(paymentId: string, amount: number) {
    if (!confirm('Hapus pembayaran ini?')) return;
    try {
      const res = await fetch(`/api/pilgrims/${id}/payments/${paymentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) return;
      setPilgrim((prev) =>
        prev
          ? {
              ...prev,
              payments: (prev.payments || []).filter((p) => p.id !== paymentId),
              totalPaid: prev.totalPaid - amount,
              remainingBalance: prev.remainingBalance + amount,
            }
          : prev
      );
    } catch {
      // silently fail
    }
  }

  // Shared styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    color: c.textPrimary,
    backgroundColor: c.cardBgHover,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    paddingRight: '40px',
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: c.textMuted,
    marginBottom: '8px',
  };

  const sectionCard = (title: string, icon: React.ReactNode, children: React.ReactNode, headerRight?: React.ReactNode) => (
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
        {icon}
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0, flex: 1 }}>
          {title}
        </h3>
        {headerRight}
      </div>
      <div style={{ padding: isMobile ? '20px' : '28px' }}>
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '24px', width: '200px', borderRadius: '8px', backgroundColor: c.border, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '180px', borderRadius: '12px', backgroundColor: c.border, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !pilgrim) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary }}>{error || 'Jemaah tidak ditemukan'}</p>
          <Link href="/pilgrims" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                marginTop: '16px',
                padding: '12px 24px',
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
                transition: 'all 0.15s',
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Kembali ke Daftar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const emergencyContact = pilgrim.emergencyContact as { name: string; phone: string; relation: string };
  const checklist = (pilgrim.checklist || {}) as unknown as Record<string, boolean>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/pilgrims" style={{ textDecoration: 'none' }}>
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
              transition: 'background-color 0.15s',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px', color: c.textMuted }} />
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {pilgrim.name}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            {pilgrim.email}
          </p>
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
              transition: 'all 0.15s',
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
          {sectionCard('Personal Information', <User style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Full Name</p>
                  <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{pilgrim.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>NIK</p>
                  <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0', fontFamily: 'monospace' }}>{pilgrim.nik}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Gender</p>
                  <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{pilgrim.gender === 'male' ? 'Male' : 'Female'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Birth</p>
                  <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{pilgrim.birthPlace}, {formatDate(pilgrim.birthDate)}</p>
                </div>
                <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Address</p>
                  <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{pilgrim.address}, {pilgrim.city}, {pilgrim.province}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Phone</p>
                  <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{pilgrim.phone}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: 0 }}>Email</p>
                  <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{pilgrim.email}</p>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 12px' }}>Emergency Contact</p>
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Name</p>
                    <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{emergencyContact.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Relation</p>
                    <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{emergencyContact.relation}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Phone</p>
                    <p style={{ fontSize: '14px', color: c.textPrimary, margin: '4px 0 0' }}>{emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status & Payment */}
        {sectionCard('Status & Payment', <CreditCard style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 8px' }}>Current Status</p>
              <select
                value={pilgrim.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={selectStyle}
              >
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
                style={{
                  ...selectStyle,
                  opacity: savingTrip ? 0.5 : 1,
                  cursor: savingTrip ? 'not-allowed' : 'pointer',
                }}
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
        ))}

        {/* Documents */}
        <div style={{ gridColumn: isMobile ? undefined : 'span 2' }}>
          <DocumentUpload
            documents={pilgrim.documents || []}
            onUpload={async (type: DocumentType, file: File) => {
              try {
                const res = await fetch(`/api/pilgrims/${id}/documents`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type,
                    status: 'uploaded',
                    fileName: file.name,
                    fileSize: file.size,
                  }),
                });
                if (!res.ok) return;
                const newDoc = await res.json();
                setPilgrim((prev) => prev ? {
                  ...prev,
                  documents: [newDoc, ...(prev.documents || [])],
                } : prev);
              } catch {
                // silently fail
              }
            }}
            onRemove={async (documentId: string) => {
              try {
                const res = await fetch(`/api/pilgrims/${id}/documents/${documentId}`, {
                  method: 'DELETE',
                });
                if (!res.ok) return;
                setPilgrim((prev) => prev ? {
                  ...prev,
                  documents: (prev.documents || []).filter((d) => d.id !== documentId),
                } : prev);
              } catch {
                // silently fail
              }
            }}
          />
        </div>

        {/* Checklist */}
        {sectionCard('Checklist', <ClipboardCheck style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
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
        ))}

        {/* Notes */}
        {pilgrim.notes && (
          <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
            {sectionCard('Catatan', <StickyNote style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
              <p style={{ fontSize: '14px', color: c.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>{pilgrim.notes}</p>
            ))}
          </div>
        )}

        {/* Payment History */}
        <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
          {sectionCard(
            'Payment History',
            <DollarSign style={{ width: '18px', height: '18px', color: c.textMuted }} />,
            pilgrim.payments && pilgrim.payments.length > 0 ? (
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
                        onClick={() => handlePaymentDelete(payment.id, payment.amount)}
                        title="Hapus pembayaran"
                        style={{
                          padding: '4px',
                          borderRadius: '8px',
                          color: c.textMuted,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.15s',
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '32px 0', margin: 0 }}>Belum ada pembayaran</p>
            ),
            (
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
                  transition: 'all 0.15s',
                }}
              >
                <Plus style={{ width: '14px', height: '14px' }} />
                Tambah Pembayaran
              </button>
            )
          )}
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
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="5000000"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Tipe</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}
                    style={selectStyle}
                  >
                    <option value="dp">DP</option>
                    <option value="installment">Cicilan</option>
                    <option value="full">Lunas</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Metode</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value as typeof f.method }))}
                    style={selectStyle}
                  >
                    <option value="transfer">Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Kartu</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input
                  type="date"
                  required
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, date: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Catatan</label>
                <input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Opsional"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: c.textSecondary,
                    backgroundColor: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: savingPayment ? c.textMuted : c.primary,
                    border: 'none',
                    borderRadius: '12px',
                    cursor: savingPayment ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {savingPayment ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
