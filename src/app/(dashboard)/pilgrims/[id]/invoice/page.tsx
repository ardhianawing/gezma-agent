'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  ArrowLeft,
  Plus,
  X,
  Copy,
  Check,
  Loader2,
  FileText,
  CreditCard,
  AlertCircle,
  ExternalLink,
  Ban,
} from 'lucide-react';

type PaymentChannel =
  | 'va_bca' | 'va_mandiri' | 'va_bni' | 'va_bri'
  | 'qris' | 'ewallet_gopay' | 'ewallet_ovo' | 'ewallet_dana' | 'credit_card';

interface Invoice {
  id: string;
  externalId: string;
  pilgrimId: string;
  pilgrimName: string;
  amount: number;
  description: string;
  channel: PaymentChannel;
  channelLabel: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentUrl: string | null;
  vaNumber: string | null;
  qrCode: string | null;
  paidAt: string | null;
  expiredAt: string;
  createdAt: string;
}

interface PilgrimInfo {
  id: string;
  name: string;
  totalPaid: number;
  remainingBalance: number;
  bookingCode?: string;
}

interface ChannelOption {
  id: PaymentChannel;
  label: string;
  icon: string;
  group: string;
}

const ALL_CHANNELS: ChannelOption[] = [
  { id: 'va_bca', label: 'BCA', icon: '🏦', group: 'Virtual Account' },
  { id: 'va_mandiri', label: 'Mandiri', icon: '🏦', group: 'Virtual Account' },
  { id: 'va_bni', label: 'BNI', icon: '🏦', group: 'Virtual Account' },
  { id: 'va_bri', label: 'BRI', icon: '🏦', group: 'Virtual Account' },
  { id: 'ewallet_gopay', label: 'GoPay', icon: '💚', group: 'E-Wallet' },
  { id: 'ewallet_ovo', label: 'OVO', icon: '💜', group: 'E-Wallet' },
  { id: 'ewallet_dana', label: 'DANA', icon: '💙', group: 'E-Wallet' },
  { id: 'qris', label: 'QRIS', icon: '📱', group: 'Lainnya' },
  { id: 'credit_card', label: 'Kartu Kredit', icon: '💳', group: 'Lainnya' },
];

function formatCurrency(amount: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}

function formatDateTime(isoStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoStr));
}

export default function PilgrimInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const pilgrimId = params.id as string;
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [pilgrim, setPilgrim] = useState<PilgrimInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formChannel, setFormChannel] = useState<PaymentChannel>('va_bca');

  const loadData = useCallback(async () => {
    try {
      const [pilgrimRes, invoicesRes] = await Promise.all([
        fetch(`/api/pilgrims/${pilgrimId}`),
        fetch(`/api/integrations/payment/invoices?pilgrimId=${pilgrimId}`),
      ]);

      if (pilgrimRes.ok) {
        const pData = await pilgrimRes.json();
        const p = pData.data || pData;
        setPilgrim({
          id: p.id,
          name: p.name,
          totalPaid: p.totalPaid || 0,
          remainingBalance: p.remainingBalance || 0,
          bookingCode: p.bookingCode || p.id.slice(0, 8).toUpperCase(),
        });
        // Set default form values
        if (!formDescription) {
          setFormDescription(`Pembayaran Umrah - ${p.name}`);
        }
        if (!formAmount && p.remainingBalance > 0) {
          setFormAmount(String(p.remainingBalance));
        }
      } else {
        setError('Jemaah tidak ditemukan');
      }

      if (invoicesRes.ok) {
        const iData = await invoicesRes.json();
        setInvoices(iData.data || []);
      }
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [pilgrimId, formDescription, formAmount]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pilgrimId]);

  const handleCreate = async () => {
    const amount = Number(formAmount);
    if (!amount || amount <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/integrations/payment/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilgrimId,
          amount,
          description: formDescription || `Pembayaran Umrah - ${pilgrim?.name || ''}`,
          channel: formChannel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal membuat invoice');
      } else {
        setInvoices((prev) => [data, ...prev]);
        setShowForm(false);
        setFormAmount('');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (invoiceId: string) => {
    setCancelling(invoiceId);
    try {
      const res = await fetch(`/api/integrations/payment/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'cancelled' as const } : inv))
        );
      } else {
        setError(data.error || 'Gagal membatalkan invoice');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setCancelling(null);
    }
  };

  const handleCopyLink = (invoice: Invoice) => {
    const textToCopy = invoice.paymentUrl || invoice.vaNumber || invoice.id;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(invoice.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    paid: { bg: '#D1FAE5', color: '#065F46', label: 'Lunas' },
    expired: { bg: '#F3F4F6', color: '#6B7280', label: 'Expired' },
    cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Dibatalkan' },
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: '16px',
    padding: isMobile ? '16px' : '20px',
  };

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    height: '44px',
    padding: '0 12px',
    fontSize: '14px',
    border: `1px solid ${c.border}`,
    borderRadius: '10px',
    backgroundColor: c.inputBg,
    color: c.textPrimary,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: c.cardBgHover }} />
          <div style={{ width: '200px', height: '24px', borderRadius: '6px', backgroundColor: c.cardBgHover }} />
        </div>
        {[1, 2].map((i) => (
          <div key={i} style={{ height: '100px', borderRadius: '16px', backgroundColor: c.cardBgHover, animation: 'pulse 2s infinite' }} />
        ))}
      </div>
    );
  }

  if (!pilgrim) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertCircle style={{ width: '48px', height: '48px', color: c.textMuted, margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: '0 0 8px 0' }}>
          Jemaah Tidak Ditemukan
        </h2>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{error || 'Data jemaah tidak tersedia'}</p>
      </div>
    );
  }

  const channelGroups = ALL_CHANNELS.reduce<Record<string, ChannelOption[]>>((acc, ch) => {
    if (!acc[ch.group]) acc[ch.group] = [];
    acc[ch.group].push(ch);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => router.push(`/pilgrims/${pilgrimId}`)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: `1px solid ${c.border}`,
            backgroundColor: c.cardBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft style={{ width: '18px', height: '18px', color: c.textPrimary }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            Invoice Pembayaran
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
            Kelola invoice untuk jemaah
          </p>
        </div>
      </div>

      {/* Pilgrim Info */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: c.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CreditCard style={{ width: '24px', height: '24px', color: c.primary }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                {pilgrim.name}
              </h2>
              <p style={{ fontSize: '13px', color: c.textMuted, margin: '2px 0 0 0' }}>
                Kode: {pilgrim.bookingCode}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '16px' : '28px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Sudah Dibayar</p>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#16A34A', margin: '2px 0 0 0' }}>
                {formatCurrency(pilgrim.totalPaid)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Sisa</p>
              <p style={{ fontSize: '15px', fontWeight: '600', color: c.primary, margin: '2px 0 0 0' }}>
                {formatCurrency(pilgrim.remainingBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle style={{ width: '16px', height: '16px', color: '#DC2626', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#991B1B', flex: 1 }}>{error}</span>
          <button
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X style={{ width: '14px', height: '14px', color: '#991B1B' }} />
          </button>
        </div>
      )}

      {/* Create Invoice Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: c.primary,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: isMobile ? '100%' : 'auto',
            alignSelf: isMobile ? 'stretch' : 'flex-start',
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Buat Invoice Baru
        </button>
      ) : (
        <div style={{ ...cardStyle, border: `2px solid ${c.primary}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Invoice Baru
            </h3>
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '16px', height: '16px', color: c.textMuted }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Amount */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: c.textSecondary, marginBottom: '6px', display: 'block' }}>
                Jumlah (Rp)
              </label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0"
                style={inputBaseStyle}
              />
              {pilgrim.remainingBalance > 0 && (
                <button
                  onClick={() => setFormAmount(String(pilgrim.remainingBalance))}
                  style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    color: c.primary,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Gunakan sisa: {formatCurrency(pilgrim.remainingBalance)}
                </button>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: c.textSecondary, marginBottom: '6px', display: 'block' }}>
                Deskripsi
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Pembayaran Umrah"
                style={inputBaseStyle}
              />
            </div>

            {/* Channel Selector */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: c.textSecondary, marginBottom: '10px', display: 'block' }}>
                Metode Pembayaran
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(channelGroups).map(([group, channels]) => (
                  <div key={group}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: c.textMuted, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {group}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '6px' }}>
                      {channels.map((ch) => {
                        const isSelected = formChannel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => setFormChannel(ch.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: isSelected ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                              backgroundColor: isSelected ? c.primaryLight : 'transparent',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: isSelected ? '600' : '400',
                              color: c.textPrimary,
                              transition: 'all 0.15s',
                              width: '100%',
                              justifyContent: 'center',
                            }}
                          >
                            <span>{ch.icon}</span>
                            <span>{ch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: c.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1,
                marginTop: '4px',
              }}
            >
              {creating ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Plus style={{ width: '16px', height: '16px' }} />
              )}
              {creating ? 'Membuat...' : 'Buat Invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 12px 0' }}>
          Daftar Invoice ({invoices.length})
        </h3>

        {invoices.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 20px' }}>
            <FileText style={{ width: '48px', height: '48px', color: c.textMuted, margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 8px 0' }}>
              Belum Ada Invoice
            </h3>
            <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
              Buat invoice baru untuk menerima pembayaran online dari jemaah
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile: Card List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invoices.map((inv) => {
              const sc = statusConfig[inv.status];
              return (
                <div key={inv.id} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, fontFamily: 'monospace' }}>{inv.id}</p>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '4px 0 0 0' }}>
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: sc.bg,
                        color: sc.color,
                      }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                    <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0 }}>
                      {inv.channelLabel}
                    </p>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                      {formatDateTime(inv.createdAt)}
                    </p>
                    {inv.paidAt && (
                      <p style={{ fontSize: '12px', color: '#16A34A', margin: 0 }}>
                        Dibayar: {formatDateTime(inv.paidAt)}
                      </p>
                    )}
                    {inv.vaNumber && (
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, fontFamily: 'monospace' }}>
                        VA: {inv.vaNumber}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(inv.paymentUrl || inv.vaNumber) && (
                      <button
                        onClick={() => handleCopyLink(inv)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${c.border}`,
                          backgroundColor: copiedId === inv.id ? '#F0FDF4' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: copiedId === inv.id ? '#16A34A' : c.textPrimary,
                        }}
                      >
                        {copiedId === inv.id ? (
                          <Check style={{ width: '14px', height: '14px' }} />
                        ) : (
                          <Copy style={{ width: '14px', height: '14px' }} />
                        )}
                        {copiedId === inv.id ? 'Tersalin' : 'Salin'}
                      </button>
                    )}
                    {inv.paymentUrl && (
                      <a
                        href={inv.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${c.border}`,
                          backgroundColor: 'transparent',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: c.textPrimary,
                        }}
                      >
                        <ExternalLink style={{ width: '14px', height: '14px' }} />
                        Buka
                      </a>
                    )}
                    {inv.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(inv.id)}
                        disabled={cancelling === inv.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #FECACA',
                          backgroundColor: '#FEF2F2',
                          cursor: cancelling === inv.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#DC2626',
                          opacity: cancelling === inv.id ? 0.7 : 1,
                        }}
                      >
                        {cancelling === inv.id ? (
                          <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Ban style={{ width: '14px', height: '14px' }} />
                        )}
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop: Table */
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['ID', 'Jumlah', 'Channel', 'Status', 'Dibuat', 'Dibayar', 'Aksi'].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: '14px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: c.textMuted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => {
                    const sc = statusConfig[inv.status];
                    return (
                      <tr
                        key={inv.id}
                        style={{
                          borderBottom: idx < invoices.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: c.textSecondary, whiteSpace: 'nowrap' }}>
                          {inv.id}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: c.textPrimary, whiteSpace: 'nowrap' }}>
                          {formatCurrency(inv.amount)}
                        </td>
                        <td style={{ padding: '14px 16px', color: c.textSecondary, whiteSpace: 'nowrap' }}>
                          {inv.channelLabel}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: sc.bg,
                              color: sc.color,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {sc.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: c.textMuted, whiteSpace: 'nowrap' }}>
                          {formatDateTime(inv.createdAt)}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: inv.paidAt ? '#16A34A' : c.textMuted, whiteSpace: 'nowrap' }}>
                          {inv.paidAt ? formatDateTime(inv.paidAt) : '-'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {(inv.paymentUrl || inv.vaNumber) && (
                              <button
                                onClick={() => handleCopyLink(inv)}
                                title="Salin link pembayaran"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: `1px solid ${c.border}`,
                                  backgroundColor: copiedId === inv.id ? '#F0FDF4' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {copiedId === inv.id ? (
                                  <Check style={{ width: '14px', height: '14px', color: '#16A34A' }} />
                                ) : (
                                  <Copy style={{ width: '14px', height: '14px', color: c.textMuted }} />
                                )}
                              </button>
                            )}
                            {inv.paymentUrl && (
                              <a
                                href={inv.paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buka halaman pembayaran"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: `1px solid ${c.border}`,
                                  backgroundColor: 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textDecoration: 'none',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <ExternalLink style={{ width: '14px', height: '14px', color: c.textMuted }} />
                              </a>
                            )}
                            {inv.status === 'pending' && (
                              <button
                                onClick={() => handleCancel(inv.id)}
                                disabled={cancelling === inv.id}
                                title="Batalkan invoice"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: '1px solid #FECACA',
                                  backgroundColor: '#FEF2F2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: cancelling === inv.id ? 'not-allowed' : 'pointer',
                                  opacity: cancelling === inv.id ? 0.7 : 1,
                                  transition: 'all 0.15s',
                                }}
                              >
                                {cancelling === inv.id ? (
                                  <Loader2 style={{ width: '14px', height: '14px', color: '#DC2626', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  <Ban style={{ width: '14px', height: '14px', color: '#DC2626' }} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
