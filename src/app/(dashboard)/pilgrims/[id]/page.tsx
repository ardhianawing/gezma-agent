'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { DocumentUpload } from '@/components/pilgrims/document-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Pilgrim } from '@/types/pilgrim';
import { PILGRIM_STATUS_CONFIG } from '@/types';
import type { PilgrimStatus, DocumentType } from '@/types';

export default function PilgrimDetailPage() {
  const params = useParams();
  const id = params.id as string;

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

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '24px', width: '200px', borderRadius: '8px', backgroundColor: '#E2E8F0', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '180px', borderRadius: '12px', backgroundColor: '#E2E8F0', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !pilgrim) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--charcoal)]">{error || 'Jemaah tidak ditemukan'}</p>
          <Link href="/pilgrims">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const emergencyContact = pilgrim.emergencyContact as { name: string; phone: string; relation: string };
  const checklist = (pilgrim.checklist || {}) as unknown as Record<string, boolean>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pilgrims">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={pilgrim.name}
          description={pilgrim.email}
          actions={
            <Link href={`/pilgrims/${pilgrim.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Full Name</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">NIK</p>
                <p className="text-sm font-mono text-[var(--charcoal)]">{pilgrim.nik}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Gender</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.gender === 'male' ? 'Male' : 'Female'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Birth</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.birthPlace}, {formatDate(pilgrim.birthDate)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-[var(--gray-600)]">Address</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.address}, {pilgrim.city}, {pilgrim.province}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Phone</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Email</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.email}</p>
              </div>
            </div>

            <div className="border-t border-[var(--gray-border)] pt-4">
              <p className="text-sm font-medium text-[var(--gray-600)] mb-2">Emergency Contact</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-[var(--gray-600)]">Name</p>
                  <p className="text-sm text-[var(--charcoal)]">{emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--gray-600)]">Relation</p>
                  <p className="text-sm text-[var(--charcoal)]">{emergencyContact.relation}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--gray-600)]">Phone</p>
                  <p className="text-sm text-[var(--charcoal)]">{emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)] mb-2">Current Status</p>
              <select
                value={pilgrim.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-[var(--gray-200)] bg-white px-3 text-sm text-[var(--charcoal)] cursor-pointer"
              >
                {Object.entries(PILGRIM_STATUS_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">Total Paid</p>
              <p className="text-lg font-bold text-[var(--charcoal)]">{formatCurrency(pilgrim.totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">Remaining</p>
              <p className="text-lg font-bold text-[var(--error)]">{formatCurrency(pilgrim.remainingBalance)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <div className="lg:col-span-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ChecklistItem label="KTP Uploaded" checked={!!checklist.ktpUploaded} />
              <ChecklistItem label="Passport Uploaded" checked={!!checklist.passportUploaded} />
              <ChecklistItem label="Passport Valid (6+ months)" checked={!!checklist.passportValid} />
              <ChecklistItem label="Photo Uploaded" checked={!!checklist.photoUploaded} />
              <ChecklistItem label="DP Paid" checked={!!checklist.dpPaid} />
              <ChecklistItem label="Full Payment" checked={!!checklist.fullPayment} />
              <ChecklistItem label="Visa Submitted" checked={!!checklist.visaSubmitted} />
              <ChecklistItem label="Visa Received" checked={!!checklist.visaReceived} />
              <ChecklistItem label="Health Certificate" checked={!!checklist.healthCertificate} />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {pilgrim.notes && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--charcoal)] whitespace-pre-wrap">{pilgrim.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Payment History — always visible */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
              <Button size="sm" onClick={() => setShowPayment(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Pembayaran
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Pembayaran</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--gray-600)] mb-1 block">Jumlah (Rp)</label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="5000000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--gray-600)] mb-1 block">Tipe</label>
                      <select
                        className="flex h-11 w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--charcoal)]"
                        value={paymentForm.type}
                        onChange={(e) => setPaymentForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}
                      >
                        <option value="dp">DP</option>
                        <option value="installment">Cicilan</option>
                        <option value="full">Lunas</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--gray-600)] mb-1 block">Metode</label>
                      <select
                        className="flex h-11 w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--charcoal)]"
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value as typeof f.method }))}
                      >
                        <option value="transfer">Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="card">Kartu</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--gray-600)] mb-1 block">Tanggal</label>
                    <Input
                      type="date"
                      required
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--gray-600)] mb-1 block">Catatan</label>
                    <Input
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Opsional"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowPayment(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={savingPayment}>
                      {savingPayment ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {pilgrim.payments && pilgrim.payments.length > 0 ? (
              <div className="space-y-3">
                {pilgrim.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-[12px] border border-[var(--gray-border)] p-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--charcoal)] capitalize">{payment.type}</p>
                      <p className="text-xs text-[var(--gray-600)]">{formatDate(payment.date)} &bull; {payment.method}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-sm font-bold ${payment.type === 'refund' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                        {payment.type === 'refund' ? '- ' : '+ '}{formatCurrency(payment.amount)}
                      </p>
                      <button
                        onClick={() => handlePaymentDelete(payment.id, payment.amount)}
                        className="p-1 rounded-lg text-[var(--gray-600)] hover:text-[var(--error)] hover:bg-[var(--gray-100)] transition-colors"
                        title="Hapus pembayaran"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--gray-600)] text-center py-8">Belum ada pembayaran</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${checked ? 'bg-[var(--success)]' : 'border-2 border-[var(--gray-border)]'}`}>
        {checked && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${checked ? 'text-[var(--charcoal)]' : 'text-[var(--gray-600)]'}`}>{label}</span>
    </div>
  );
}
