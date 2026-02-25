'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  RefreshCw,
  Lock,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
  ChevronDown,
  Loader2,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface UmrahCashConfig {
  isEnabled: boolean;
  partnerId: string | null;
  partnerStatus: 'pending' | 'active' | 'suspended' | 'not_registered';
  apiKey: string | null;
}

interface ExchangeRate {
  pair: 'IDR_SAR';
  rate: number;
  lockedUntil: string | null;
  source: string;
  updatedAt: string;
}

interface UmrahCashTransaction {
  id: string;
  type: 'transfer' | 'rate_lock';
  amountIDR: number;
  amountSAR: number;
  rate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  pilgrimId: string | null;
  createdAt: string;
  completedAt: string | null;
  fee: number;
}

const BANKS = [
  { value: 'Al Rajhi Bank', label: 'Al Rajhi Bank' },
  { value: 'NCB (National Commercial Bank)', label: 'NCB (National Commercial Bank)' },
  { value: 'Riyad Bank', label: 'Riyad Bank' },
];

function formatIDR(amount: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}

function formatSAR(amount: number): string {
  return 'SAR ' + new Intl.NumberFormat('en-US').format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status, c }: { status: string; c: Record<string, string> }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    not_registered: { bg: '#FEF3C7', color: '#92400E', label: 'Belum Terdaftar' },
    pending: { bg: '#FEF3C7', color: '#92400E', label: 'Menunggu Verifikasi' },
    active: { bg: '#D1FAE5', color: '#065F46', label: 'Aktif' },
    suspended: { bg: '#FEE2E2', color: '#991B1B', label: 'Ditangguhkan' },
    processing: { bg: '#DBEAFE', color: '#1E40AF', label: 'Diproses' },
    completed: { bg: '#D1FAE5', color: '#065F46', label: 'Selesai' },
    failed: { bg: '#FEE2E2', color: '#991B1B', label: 'Gagal' },
  };

  const s = config[status] || { bg: c.cardBgHover, color: c.textMuted, label: status };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      {status === 'completed' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
      {status === 'failed' && <XCircle style={{ width: '12px', height: '12px' }} />}
      {status === 'processing' && <Loader2 style={{ width: '12px', height: '12px' }} />}
      {status === 'pending' && <Clock style={{ width: '12px', height: '12px' }} />}
      {s.label}
    </span>
  );
}

export default function UmrahCashSettingsPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { addToast } = useToast();

  // State
  const [config, setConfig] = useState<UmrahCashConfig | null>(null);
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [lockedRate, setLockedRate] = useState<ExchangeRate | null>(null);
  const [transactions, setTransactions] = useState<UmrahCashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockLoading, setLockLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Transfer form
  const [amountSAR, setAmountSAR] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  // API key display
  const [showApiKey, setShowApiKey] = useState(false);

  const AMBER = '#D97706';
  const AMBER_LIGHT = '#FEF3C7';
  const AMBER_BG = '#FFFBEB';

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [configRes, rateRes, txRes] = await Promise.all([
        fetch('/api/integrations/umrahcash'),
        fetch('/api/integrations/umrahcash/rate'),
        fetch('/api/integrations/umrahcash/transfer'),
      ]);

      const configData = await configRes.json();
      const rateData = await rateRes.json();
      const txData = await txRes.json();

      if (configData.data) {
        setConfig(configData.data.config);
        if (configData.data.rate) setRate(configData.data.rate);
      }
      if (rateData.data) {
        if (rateData.data.current) setRate(rateData.data.current);
        if (rateData.data.locked) setLockedRate(rateData.data.locked);
      }
      if (txData.data) setTransactions(txData.data);
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data UmrahCash' });
      addToast({ type: 'error', title: 'Gagal memuat data UmrahCash' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Countdown timer for locked rate
  useEffect(() => {
    if (lockedRate?.lockedUntil) {
      const updateCountdown = () => {
        const remaining = Math.max(0, Math.floor((new Date(lockedRate.lockedUntil!).getTime() - Date.now()) / 1000));
        setLockCountdown(remaining);
        if (remaining <= 0) {
          setLockedRate(null);
          if (countdownRef.current) clearInterval(countdownRef.current);
        }
      };
      updateCountdown();
      countdownRef.current = setInterval(updateCountdown, 1000);
      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    } else {
      setLockCountdown(0);
    }
  }, [lockedRate]);

  // Register as partner
  const handleRegister = async () => {
    setRegisterLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/integrations/umrahcash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerStatus: 'pending',
          partnerId: 'UC-' + Date.now().toString(36).toUpperCase(),
        }),
      });
      const data = await res.json();
      if (data.data) {
        setConfig(data.data);
        setMessage({ type: 'success', text: 'Pendaftaran berhasil dikirim! Tim UmrahCash akan menghubungi Anda dalam 1-3 hari kerja.' });
        addToast({ type: 'success', title: 'Pendaftaran berhasil dikirim' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal mendaftar. Silakan coba lagi.' });
      addToast({ type: 'error', title: 'Gagal mendaftar' });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Lock rate
  const handleLockRate = async () => {
    const amount = parseFloat(amountSAR) || 1000;
    setLockLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/integrations/umrahcash/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountSAR: amount }),
      });
      const data = await res.json();
      if (data.data) {
        setLockedRate(data.data);
        setMessage({ type: 'success', text: 'Kurs berhasil dikunci selama 30 menit!' });
        addToast({ type: 'success', title: 'Kurs berhasil dikunci' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal mengunci kurs' });
      addToast({ type: 'error', title: 'Gagal mengunci kurs' });
    } finally {
      setLockLoading(false);
    }
  };

  // Create transfer
  const handleCreateTransfer = async () => {
    const amount = parseFloat(amountSAR);
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Jumlah SAR harus lebih dari 0' });
      return;
    }
    if (!recipientName || !recipientBank || !recipientAccount) {
      setMessage({ type: 'error', text: 'Lengkapi semua data penerima' });
      return;
    }
    setTransferLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/integrations/umrahcash/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountSAR: amount,
          recipientName,
          recipientBank,
          recipientAccount,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: 'error', text: data.error });
      } else if (data.data) {
        setTransactions((prev) => [data.data, ...prev]);
        setMessage({ type: 'success', text: 'Transfer berhasil dibuat! Status: Pending' });
        addToast({ type: 'success', title: 'Transfer berhasil dibuat' });
        setAmountSAR('');
        setRecipientName('');
        setRecipientBank('');
        setRecipientAccount('');
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal membuat transfer' });
      addToast({ type: 'error', title: 'Gagal membuat transfer' });
    } finally {
      setTransferLoading(false);
    }
  };

  const currentRate = lockedRate?.rate || rate?.rate || 4150;
  const parsedAmount = parseFloat(amountSAR) || 0;
  const calculatedIDR = parsedAmount * currentRate;
  const totalIDR = calculatedIDR + 25000;
  const isPartnerActive = config?.partnerStatus === 'active';
  const isNotRegistered = !config || config.partnerStatus === 'not_registered';
  const isPending = config?.partnerStatus === 'pending';

  const cardStyle = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: isMobile ? '16px' : '20px',
  };

  const inputStyle = {
    width: '100%',
    height: '44px',
    padding: '0 14px',
    fontSize: '14px',
    border: '1px solid ' + c.border,
    borderRadius: '10px',
    backgroundColor: c.cardBg,
    color: c.textPrimary,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '500' as const,
    color: c.textSecondary,
    marginBottom: '6px',
    display: 'block' as const,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <PageHeader title="UmrahCash" description="Integrasi pembayaran lintas negara IDR ke SAR" />
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: c.textMuted }}>
            <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px' }}>Memuat data UmrahCash...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>

      {/* Back button + Header */}
      <div>
        <Link
          href="/settings/integrations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: c.textMuted,
            textDecoration: 'none',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Kembali ke Integrasi
        </Link>
        <PageHeader
          title="UmrahCash"
          description="Pembayaran lintas negara IDR ke SAR untuk kebutuhan umrah"
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: AMBER_LIGHT,
                  color: AMBER,
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                <DollarSign style={{ width: '14px', height: '14px' }} />
                Fintech
              </div>
            </div>
          }
        />
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          ) : (
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          )}
          {message.text}
        </div>
      )}

      {/* Status Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${AMBER}, #F59E0B)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <DollarSign style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
                Status Partnership
              </h3>
              <p style={{ fontSize: '13px', color: c.textMuted, margin: '2px 0 0 0' }}>
                UmrahCash Payment Gateway
              </p>
            </div>
          </div>
          <StatusBadge status={config?.partnerStatus || 'not_registered'} c={c} />
        </div>

        {/* Not Registered State */}
        {isNotRegistered && (
          <div
            style={{
              backgroundColor: AMBER_BG,
              border: '1px solid ' + AMBER_LIGHT,
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#92400E', margin: '0 0 8px 0' }}>
              Bergabung sebagai Partner UmrahCash
            </h4>
            <p style={{ fontSize: '13px', color: '#78350F', margin: '0 0 16px 0', lineHeight: '1.6' }}>
              UmrahCash adalah layanan fintech yang memungkinkan travel umrah melakukan transfer IDR ke SAR
              dengan kurs kompetitif dan biaya rendah. Daftarkan agensi Anda untuk mulai menggunakan layanan ini.
            </p>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '13px', color: '#78350F', lineHeight: '1.8' }}>
              <li>Kurs kompetitif dengan rate lock hingga 30 menit</li>
              <li>Transfer cepat ke bank-bank utama Saudi Arabia</li>
              <li>Biaya transfer tetap hanya Rp 25.000 per transaksi</li>
              <li>Terintegrasi langsung dengan data jamaah GEZMA</li>
            </ul>
            <button
              onClick={handleRegister}
              disabled={registerLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                background: `linear-gradient(135deg, ${AMBER}, #F59E0B)`,
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: registerLoading ? 'not-allowed' : 'pointer',
                opacity: registerLoading ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {registerLoading ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <ExternalLink style={{ width: '16px', height: '16px' }} />
              )}
              {registerLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </div>
        )}

        {/* Pending State */}
        {isPending && (
          <div
            style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Clock style={{ width: '20px', height: '20px', color: '#92400E', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400E', margin: '0 0 4px 0' }}>
                Pendaftaran Sedang Diproses
              </h4>
              <p style={{ fontSize: '13px', color: '#78350F', margin: 0, lineHeight: '1.5' }}>
                Terima kasih telah mendaftar sebagai partner UmrahCash. Tim kami sedang memverifikasi data Anda.
                Proses ini biasanya memakan waktu 1-3 hari kerja. Anda akan menerima notifikasi setelah akun diaktifkan.
              </p>
              {config?.partnerId && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#92400E', fontWeight: '500' }}>Partner ID:</span>
                  <code
                    style={{
                      fontSize: '12px',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#78350F',
                      fontFamily: 'monospace',
                    }}
                  >
                    {config.partnerId}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active State */}
        {isPartnerActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={labelStyle}>Partner ID</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code
                    style={{
                      fontSize: '14px',
                      backgroundColor: c.cardBgHover,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: c.textPrimary,
                      fontFamily: 'monospace',
                      flex: 1,
                    }}
                  >
                    {config?.partnerId || '-'}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(config?.partnerId || '')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid ' + c.border,
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: c.textMuted,
                    }}
                  >
                    <Copy style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={labelStyle}>API Key</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config?.apiKey || 'uc_live_xxxxxxxxxxxx'}
                    readOnly
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid ' + c.border,
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: c.textMuted,
                    }}
                  >
                    {showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
          gap: isMobile ? '16px' : '24px',
        }}
      >
        {/* Exchange Rate Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: AMBER }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
                Kurs Saat Ini
              </h3>
            </div>
            <button
              onClick={fetchData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid ' + c.border,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '12px',
                color: c.textMuted,
              }}
            >
              <RefreshCw style={{ width: '12px', height: '12px' }} />
              Refresh
            </button>
          </div>

          {/* Rate Display */}
          <div
            style={{
              background: `linear-gradient(135deg, ${AMBER_BG}, #FEF3C7)`,
              border: '1px solid ' + AMBER_LIGHT,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            <p style={{ fontSize: '13px', color: '#92400E', margin: '0 0 4px 0' }}>1 SAR =</p>
            <p style={{ fontSize: '32px', fontWeight: '800', color: '#78350F', margin: '0 0 4px 0', fontFamily: 'monospace' }}>
              {formatIDR(currentRate)}
            </p>
            <p style={{ fontSize: '12px', color: '#A16207', margin: 0 }}>
              {rate?.source || 'UmrahCash Market Rate'}
            </p>
          </div>

          {/* Last Updated */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock style={{ width: '14px', height: '14px', color: c.textMuted }} />
              <span style={{ fontSize: '12px', color: c.textMuted }}>
                Update: {rate?.updatedAt ? formatDate(rate.updatedAt) : '-'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#16A34A',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
              Auto-refresh
            </div>
          </div>

          {/* Locked Rate */}
          {lockedRate && lockCountdown > 0 ? (
            <div
              style={{
                backgroundColor: '#D1FAE5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock style={{ width: '16px', height: '16px', color: '#065F46' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#065F46', margin: 0 }}>Kurs Terkunci</p>
                  <p style={{ fontSize: '12px', color: '#047857', margin: '2px 0 0 0' }}>
                    {formatIDR(lockedRate.rate)} / SAR
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '18px', fontWeight: '700', color: '#065F46', margin: 0, fontFamily: 'monospace' }}>
                  {Math.floor(lockCountdown / 60).toString().padStart(2, '0')}:{(lockCountdown % 60).toString().padStart(2, '0')}
                </p>
                <p style={{ fontSize: '11px', color: '#047857', margin: '2px 0 0 0' }}>tersisa</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLockRate}
              disabled={lockLoading || (!isPartnerActive && !isPending && !isNotRegistered)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: `linear-gradient(135deg, ${AMBER}, #F59E0B)`,
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: lockLoading ? 'not-allowed' : 'pointer',
                opacity: lockLoading ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {lockLoading ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Lock style={{ width: '16px', height: '16px' }} />
              )}
              {lockLoading ? 'Mengunci...' : 'Kunci Kurs 30 Menit'}
            </button>
          )}
        </div>

        {/* Transfer Calculator */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Send style={{ width: '20px', height: '20px', color: AMBER }} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
              Kalkulator Transfer
            </h3>
          </div>

          {/* Amount SAR Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Jumlah (SAR)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                placeholder="Contoh: 5000"
                value={amountSAR}
                onChange={(e) => setAmountSAR(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  height: '52px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: AMBER,
                }}
              >
                SAR
              </span>
            </div>
          </div>

          {/* Calculation Display */}
          {parsedAmount > 0 && (
            <div
              style={{
                backgroundColor: c.cardBgHover,
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: c.textMuted }}>Konversi ({formatSAR(parsedAmount)} x {formatIDR(currentRate)})</span>
                <span style={{ color: c.textPrimary, fontWeight: '500' }}>{formatIDR(calculatedIDR)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: c.textMuted }}>Biaya transfer</span>
                <span style={{ color: c.textPrimary, fontWeight: '500' }}>{formatIDR(25000)}</span>
              </div>
              <div style={{ borderTop: '1px solid ' + c.border, paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: AMBER }}>{formatIDR(totalIDR)}</span>
              </div>
            </div>
          )}

          {/* Recipient Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Nama Penerima</label>
              <input
                type="text"
                placeholder="Nama lengkap penerima"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Bank Penerima</label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                  style={{
                    ...inputStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    backgroundColor: c.cardBg,
                  }}
                >
                  <span style={{ color: recipientBank ? c.textPrimary : c.textMuted }}>
                    {recipientBank || 'Pilih bank...'}
                  </span>
                  <ChevronDown style={{ width: '16px', height: '16px', color: c.textMuted }} />
                </button>
                {bankDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: c.cardBg,
                      border: '1px solid ' + c.border,
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 50,
                      overflow: 'hidden',
                    }}
                  >
                    {BANKS.map((bank) => (
                      <button
                        key={bank.value}
                        onClick={() => {
                          setRecipientBank(bank.value);
                          setBankDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          textAlign: 'left',
                          border: 'none',
                          backgroundColor: recipientBank === bank.value ? AMBER_BG : 'transparent',
                          color: c.textPrimary,
                          fontSize: '14px',
                          cursor: 'pointer',
                          borderBottom: '1px solid ' + c.borderLight,
                        }}
                      >
                        {bank.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nomor Rekening</label>
              <input
                type="text"
                placeholder="Contoh: SA4420000001234567891"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Create Transfer Button */}
          <button
            onClick={handleCreateTransfer}
            disabled={transferLoading || parsedAmount <= 0}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: parsedAmount > 0
                ? `linear-gradient(135deg, ${AMBER}, #F59E0B)`
                : c.cardBgHover,
              color: parsedAmount > 0 ? 'white' : c.textMuted,
              fontSize: '14px',
              fontWeight: '600',
              cursor: transferLoading || parsedAmount <= 0 ? 'not-allowed' : 'pointer',
              opacity: transferLoading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {transferLoading ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send style={{ width: '16px', height: '16px' }} />
            )}
            {transferLoading ? 'Memproses...' : 'Buat Transfer'}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock style={{ width: '20px', height: '20px', color: AMBER }} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
              Riwayat Transaksi
            </h3>
          </div>
          <span style={{ fontSize: '13px', color: c.textMuted }}>
            {transactions.length} transaksi
          </span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: c.textMuted }}>
            <DollarSign style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: '14px', margin: 0 }}>Belum ada transaksi</p>
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  backgroundColor: c.cardBgHover,
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>{tx.recipientName}</span>
                  <StatusBadge status={tx.status} c={c} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: c.textMuted }}>{formatSAR(tx.amountSAR)}</span>
                  <span style={{ color: AMBER, fontWeight: '600' }}>{formatIDR(tx.amountIDR)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: c.textMuted }}>
                  <span>{tx.recipientBank}</span>
                  <span>{formatDate(tx.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr>
                  {['Tanggal', 'Penerima', 'Jumlah (SAR)', 'Jumlah (IDR)', 'Kurs', 'Status'].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: c.textMuted,
                        borderBottom: '2px solid ' + c.border,
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid ' + c.borderLight, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                      {formatDate(tx.createdAt)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid ' + c.borderLight }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: '500', color: c.textPrimary }}>{tx.recipientName}</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: c.textMuted }}>{tx.recipientBank}</p>
                      </div>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid ' + c.borderLight, fontWeight: '600', color: c.textPrimary, whiteSpace: 'nowrap' }}>
                      {formatSAR(tx.amountSAR)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid ' + c.borderLight, fontWeight: '600', color: AMBER, whiteSpace: 'nowrap' }}>
                      {formatIDR(tx.amountIDR)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid ' + c.borderLight, color: c.textSecondary, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {formatIDR(tx.rate)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid ' + c.borderLight }}>
                      <StatusBadge status={tx.status} c={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div
        style={{
          ...cardStyle,
          background: `linear-gradient(135deg, ${AMBER_BG}, #FEF3C7)`,
          border: '1px solid ' + AMBER_LIGHT,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${AMBER}, #F59E0B)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DollarSign style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#78350F', margin: 0 }}>
              Tentang UmrahCash
            </h3>
            <p style={{ fontSize: '13px', color: '#92400E', margin: '2px 0 0 0' }}>
              Solusi pembayaran lintas negara untuk travel umrah
            </p>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.7', margin: '0 0 20px 0' }}>
          UmrahCash adalah platform fintech yang dirancang khusus untuk industri travel umrah di Indonesia.
          Dengan UmrahCash, agensi umrah dapat melakukan transfer dana dari IDR ke SAR secara langsung,
          dengan kurs yang kompetitif dan proses yang cepat.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {[
            {
              icon: Lock,
              title: 'Rate Lock',
              desc: 'Kunci kurs hingga 30 menit untuk menghindari fluktuasi saat proses pembayaran.',
            },
            {
              icon: Zap,
              title: 'Transfer Cepat',
              desc: 'Dana sampai ke rekening Saudi Arabia dalam hitungan menit, bukan hari.',
            },
            {
              icon: Shield,
              title: 'Biaya Rendah',
              desc: 'Biaya tetap Rp 25.000 per transaksi, tanpa biaya tersembunyi.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: AMBER_LIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px', color: AMBER }} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#78350F', margin: '0 0 4px 0' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
          }}
        >
          <AlertCircle style={{ width: '18px', height: '18px', color: '#92400E', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>
            <strong>Butuh bantuan?</strong> Hubungi tim partnership UmrahCash di{' '}
            <span style={{ fontWeight: '600' }}>partnership@umrahcash.id</span> atau WhatsApp{' '}
            <span style={{ fontWeight: '600' }}>+62 812-3456-7890</span>
          </div>
        </div>
      </div>
    </div>
  );
}
