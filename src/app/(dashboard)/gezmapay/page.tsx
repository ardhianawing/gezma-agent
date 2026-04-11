'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUpCircle, Send, QrCode, Clock, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface Wallet {
  balance: number;
  currency: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// PRESET_AMOUNTS moved inside component for i18n

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTransactionIcon(type: string): { icon: string; color: string } {
  switch (type) {
    case 'topup':
      return { icon: '\u2191', color: '#22c55e' };
    case 'payment':
      return { icon: '\u2193', color: '#ef4444' };
    case 'refund':
      return { icon: '\u21A9', color: '#3b82f6' };
    case 'transfer':
      return { icon: '\u2192', color: '#f97316' };
    default:
      return { icon: '\u2022', color: '#6b7280' };
  }
}

// getStatusBadge moved inside component for i18n

export default function GezmaPayPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();

  const PRESET_AMOUNTS = [
    { label: t.gezmaPay.preset100k, value: 100000 },
    { label: t.gezmaPay.preset500k, value: 500000 },
    { label: t.gezmaPay.preset1m, value: 1000000 },
    { label: t.gezmaPay.preset5m, value: 5000000 },
  ];

  function getStatusBadge(status: string): { bg: string; text: string; label: string } {
    switch (status) {
      case 'completed':
        return { bg: '#dcfce7', text: '#166534', label: t.gezmaPay.statusCompleted };
      case 'pending':
        return { bg: '#fef9c3', text: '#854d0e', label: t.gezmaPay.statusPending };
      case 'failed':
        return { bg: '#fecaca', text: '#991b1b', label: t.gezmaPay.statusFailed };
      default:
        return { bg: c.borderLight, text: c.textMuted, label: status };
    }
  }

  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: 'IDR' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  const fetchData = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gezmapay?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Gagal memuat data GezmaPay:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) return;

    setTopupLoading(true);
    try {
      const res = await fetch('/api/gezmapay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setShowTopupModal(false);
        setTopupAmount('');
        fetchData(1);
      }
    } catch (error) {
      console.error('Gagal topup:', error);
    } finally {
      setTopupLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t.gezmaPay.title}
        description={t.gezmaPay.description}
      />

      {/* Wallet Balance Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e40af 100%)',
          borderRadius: '20px',
          padding: isMobile ? '24px' : '32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial gradient texture overlay for depth */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            right: '60px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: '0 0 8px', fontWeight: 500 }}>
          {t.gezmaPay.balance}
        </p>
        <p style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 700, margin: '0 0 4px', color: '#FFFFFF' }}>
          {formatCurrency(wallet.balance)}
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
          {wallet.currency}
        </p>
        <button
          onClick={() => setShowTopupModal(true)}
          style={{
            padding: '12px 28px',
            minHeight: '44px',
            borderRadius: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            width: isMobile ? '100%' : 'auto',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.15)';
          }}
        >
          {t.gezmaPay.topUp}
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '16px' : '20px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: isMobile ? '8px' : '12px',
          }}
        >
          {[
            { icon: <ArrowUpCircle size={24} />, label: t.gezmaPay.topUp, onClick: () => setShowTopupModal(true) },
            { icon: <Send size={24} />, label: 'Transfer', onClick: () => {} },
            { icon: <QrCode size={24} />, label: 'Scan QR', onClick: () => {} },
            { icon: <Clock size={24} />, label: 'Riwayat', onClick: () => {} },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: isMobile ? '12px 4px' : '16px 8px',
                borderRadius: '14px',
                border: '1px solid ' + c.borderLight,
                backgroundColor: c.pageBg,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = c.primary + '12';
                (e.currentTarget as HTMLButtonElement).style.borderColor = c.primary + '50';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = c.pageBg;
                (e.currentTarget as HTMLButtonElement).style.borderColor = c.borderLight;
              }}
            >
              <div
                style={{
                  width: isMobile ? '44px' : '52px',
                  height: isMobile ? '44px' : '52px',
                  borderRadius: '50%',
                  backgroundColor: c.primary + '18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.primary,
                  flexShrink: 0,
                }}
              >
                {action.icon}
              </div>
              <span
                style={{
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: 600,
                  color: c.textPrimary,
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}
              >
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '16px' : '24px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
          {t.gezmaPay.txHistory}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '14px', color: c.textMuted }}>{t.common.loadingData}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '32px 16px' : '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: c.borderLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px',
              }}
            >
              <Receipt size={48} color={c.textLight} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '17px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
              {t.gezmaPay.emptyTitle || 'Belum ada transaksi'}
            </p>
            <p style={{ fontSize: '14px', color: c.textMuted, margin: 0, maxWidth: '280px', lineHeight: '1.5' }}>
              {t.gezmaPay.emptyDesc || 'Mulai dengan top up saldo GezmaPay Anda'}
            </p>
            <button
              onClick={() => setShowTopupModal(true)}
              style={{
                marginTop: '8px',
                padding: '12px 28px',
                minHeight: '44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: c.primary,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              Top Up Sekarang
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.map((tx) => {
              const txIcon = getTransactionIcon(tx.type);
              const statusBadge = getStatusBadge(tx.status);
              const isPositive = tx.type === 'topup' || tx.type === 'refund';

              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid ' + c.borderLight,
                    backgroundColor: c.pageBg,
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: txIcon.color + '18',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: txIcon.color,
                      flexShrink: 0,
                    }}
                  >
                    {txIcon.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: '0 0 2px' }}>
                      {tx.description}
                    </p>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isPositive ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.text,
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '20px',
            }}
          >
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                padding: '10px 14px',
                minHeight: '44px',
                borderRadius: '8px',
                border: '1px solid ' + c.border,
                backgroundColor: pagination.page <= 1 ? c.pageBg : c.cardBg,
                color: pagination.page <= 1 ? c.textMuted : c.textPrimary,
                fontSize: '13px',
                fontWeight: 500,
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1,
              }}
            >
              {t.common.previous}
            </button>
            <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 500 }}>
              {t.common.pageOf.replace('{page}', String(pagination.page)).replace('{total}', String(pagination.totalPages))}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              style={{
                padding: '10px 14px',
                minHeight: '44px',
                borderRadius: '8px',
                border: '1px solid ' + c.border,
                backgroundColor: pagination.page >= pagination.totalPages ? c.pageBg : c.cardBg,
                color: pagination.page >= pagination.totalPages ? c.textMuted : c.textPrimary,
                fontSize: '13px',
                fontWeight: 500,
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
              }}
            >
              {t.common.next}
            </button>
          </div>
        )}
      </div>

      {/* Topup Modal */}
      {showTopupModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: isMobile ? '0' : '20px',
          }}
          onClick={() => setShowTopupModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: c.cardBg,
              borderRadius: isMobile ? '0' : '20px',
              padding: isMobile ? '20px' : '28px',
              width: '100%',
              maxWidth: isMobile ? '100%' : '440px',
              maxHeight: isMobile ? '100%' : '90vh',
              height: isMobile ? '100%' : 'auto',
              overflow: 'auto',
              border: isMobile ? 'none' : '1px solid ' + c.border,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
                {t.gezmaPay.topUpTitle}
              </h3>
              <button
                onClick={() => setShowTopupModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: c.textMuted,
                  cursor: 'pointer',
                  padding: '10px',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {'\u2715'}
              </button>
            </div>

            {/* Preset Amount Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setTopupAmount(String(preset.value))}
                  style={{
                    padding: '12px',
                    minHeight: '46px',
                    borderRadius: '10px',
                    border: topupAmount === String(preset.value)
                      ? '2px solid ' + c.primary
                      : '1px solid ' + c.border,
                    backgroundColor: topupAmount === String(preset.value) ? c.primary + '12' : c.pageBg,
                    color: topupAmount === String(preset.value) ? c.primary : c.textPrimary,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                {t.gezmaPay.topUpCustomLabel}
              </label>
              <input
                type="number"
                placeholder={t.gezmaPay.topUpCustomPlaceholder}
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  minHeight: '46px',
                  borderRadius: '10px',
                  border: '1px solid ' + c.border,
                  backgroundColor: c.inputBg,
                  color: c.textPrimary,
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }}
                onBlur={(e) => { e.target.style.borderColor = c.border; }}
              />
            </div>

            {topupAmount && parseFloat(topupAmount) > 0 && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: c.pageBg,
                  border: '1px solid ' + c.borderLight,
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: c.textMuted }}>{t.gezmaPay.topUpAmountLabel}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: c.primary }}>
                    {formatCurrency(parseFloat(topupAmount))}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleTopup}
              disabled={topupLoading || !topupAmount || parseFloat(topupAmount) <= 0}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: (!topupAmount || parseFloat(topupAmount) <= 0) ? c.border : c.primary,
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (!topupAmount || parseFloat(topupAmount) <= 0) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                opacity: topupLoading ? 0.7 : 1,
              }}
            >
              {topupLoading ? t.gezmaPay.topUpLoading : t.gezmaPay.topUpBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
