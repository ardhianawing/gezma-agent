'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, Users, DollarSign, ArrowLeftRight, AlertTriangle, Lock, Unlock } from 'lucide-react';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  inputBg: '#F8FAFC',
};

type TxType = 'topup' | 'transfer' | 'payment';
type TxStatus = 'success' | 'pending' | 'failed' | 'flagged';
type WalletStatus = 'active' | 'blocked';
type TxFilter = 'all' | 'topup' | 'transfer' | 'payment' | 'flagged';

interface Transaction {
  id: string;
  date: string;
  from: string;
  to: string;
  amount: number;
  type: TxType;
  status: TxStatus;
}

interface WalletEntry {
  id: string;
  agencyName: string;
  balance: number;
  lastActivity: string;
  status: WalletStatus;
}

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(2)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(2)}Jt`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-001', date: '2026-04-11T08:14:00', from: 'Al-Mabrur Travel', to: 'Platform GezmaPay', amount: 5000000, type: 'topup', status: 'success' },
  { id: 'tx-002', date: '2026-04-11T09:30:00', from: 'Baitussalam Tour', to: 'Vendor Katering', amount: 12500000, type: 'payment', status: 'success' },
  { id: 'tx-003', date: '2026-04-11T10:05:00', from: 'Cahaya Haji Umrah', to: 'Al-Mabrur Travel', amount: 3000000, type: 'transfer', status: 'pending' },
  { id: 'tx-004', date: '2026-04-10T14:22:00', from: 'Darul Ihsan Travel', to: 'Vendor Hotel', amount: 25000000, type: 'payment', status: 'success' },
  { id: 'tx-005', date: '2026-04-10T15:47:00', from: 'El-Nusa Wisata', to: 'Platform GezmaPay', amount: 10000000, type: 'topup', status: 'success' },
  { id: 'tx-006', date: '2026-04-10T16:30:00', from: 'Fastabiqul Khairat', to: 'Baitussalam Tour', amount: 85000000, type: 'transfer', status: 'flagged' },
  { id: 'tx-007', date: '2026-04-10T17:00:00', from: 'Ghifari Hajj & Umrah', to: 'Vendor Transportasi', amount: 7500000, type: 'payment', status: 'failed' },
  { id: 'tx-008', date: '2026-04-09T09:15:00', from: 'Hasanah Travel', to: 'Platform GezmaPay', amount: 20000000, type: 'topup', status: 'success' },
  { id: 'tx-009', date: '2026-04-09T11:00:00', from: 'Ihsan Wisata', to: 'El-Nusa Wisata', amount: 150000000, type: 'transfer', status: 'flagged' },
  { id: 'tx-010', date: '2026-04-09T13:45:00', from: 'Jannatan Tour', to: 'Vendor Visa', amount: 45000000, type: 'payment', status: 'success' },
  { id: 'tx-011', date: '2026-04-08T10:00:00', from: 'Karima Haji', to: 'Platform GezmaPay', amount: 8000000, type: 'topup', status: 'success' },
  { id: 'tx-012', date: '2026-04-08T14:20:00', from: 'Labbaik Travel', to: 'Hasanah Travel', amount: 6000000, type: 'transfer', status: 'pending' },
];

const MOCK_WALLETS: WalletEntry[] = [
  { id: 'w-001', agencyName: 'Al-Mabrur Travel', balance: 32500000, lastActivity: '2026-04-11T08:14:00', status: 'active' },
  { id: 'w-002', agencyName: 'Baitussalam Tour', balance: 18750000, lastActivity: '2026-04-11T09:30:00', status: 'active' },
  { id: 'w-003', agencyName: 'Cahaya Haji Umrah', balance: 5200000, lastActivity: '2026-04-11T10:05:00', status: 'active' },
  { id: 'w-004', agencyName: 'Darul Ihsan Travel', balance: 0, lastActivity: '2026-04-10T14:22:00', status: 'blocked' },
  { id: 'w-005', agencyName: 'El-Nusa Wisata', balance: 62300000, lastActivity: '2026-04-10T15:47:00', status: 'active' },
  { id: 'w-006', agencyName: 'Fastabiqul Khairat', balance: 95000000, lastActivity: '2026-04-10T16:30:00', status: 'blocked' },
  { id: 'w-007', agencyName: 'Ghifari Hajj & Umrah', balance: 11400000, lastActivity: '2026-04-10T17:00:00', status: 'active' },
  { id: 'w-008', agencyName: 'Hasanah Travel', balance: 44800000, lastActivity: '2026-04-09T09:15:00', status: 'active' },
];

const TX_STATUS_COLORS: Record<TxStatus, { bg: string; text: string; label: string }> = {
  success: { bg: '#DCFCE7', text: '#15803D', label: 'Sukses' },
  pending: { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
  failed: { bg: '#FEE2E2', text: '#DC2626', label: 'Gagal' },
  flagged: { bg: '#FFF7ED', text: '#EA580C', label: 'Ditandai' },
};

const TX_TYPE_COLORS: Record<TxType, { bg: string; text: string; label: string }> = {
  topup: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Top Up' },
  transfer: { bg: '#EDE9FE', text: '#6D28D9', label: 'Transfer' },
  payment: { bg: '#DCFCE7', text: '#15803D', label: 'Pembayaran' },
};

const TX_FILTER_LABELS: Record<TxFilter, string> = {
  all: 'Semua',
  topup: 'Top Up',
  transfer: 'Transfer',
  payment: 'Pembayaran',
  flagged: 'Ditandai',
};

export default function GezmapayAdminPage() {
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [wallets, setWallets] = useState<WalletEntry[]>(MOCK_WALLETS);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const activeWallets = wallets.filter(w => w.status === 'active').length;
  const todayTxs = MOCK_TRANSACTIONS.filter(tx => tx.date.startsWith('2026-04-11'));
  const flaggedTxs = MOCK_TRANSACTIONS.filter(tx => tx.status === 'flagged');

  const filteredTxs = MOCK_TRANSACTIONS.filter(tx => {
    if (txFilter === 'all') return true;
    if (txFilter === 'flagged') return tx.status === 'flagged';
    return tx.type === txFilter;
  });

  const statCards = [
    { label: 'Total Wallets', value: wallets.length.toString(), icon: Wallet, color: '#2563EB' },
    { label: 'Wallet Aktif', value: activeWallets.toString(), icon: Users, color: '#10B981' },
    { label: 'Total Saldo (IDR)', value: formatRupiah(totalBalance), icon: DollarSign, color: '#8B5CF6' },
    { label: 'Transaksi Hari Ini', value: todayTxs.length.toString(), icon: TrendingUp, color: '#F59E0B' },
    { label: 'Transaksi Ditandai', value: flaggedTxs.length.toString(), icon: AlertTriangle, color: '#EF4444' },
  ];

  const handleToggleBlock = (walletId: string) => {
    setBlockingId(walletId);
    setTimeout(() => {
      setWallets(prev =>
        prev.map(w =>
          w.id === walletId
            ? { ...w, status: w.status === 'active' ? 'blocked' : 'active' }
            : w
        )
      );
      setBlockingId(null);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Wallet style={{ width: '22px', height: '22px', color: 'white' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            GezmaPay Administration
          </h1>
          <p style={{ fontSize: '13px', color: cc.textMuted, marginTop: '2px' }}>
            Monitor transaksi, kelola wallet, dan tangani aktivitas mencurigakan.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: cc.cardBg,
                borderRadius: '12px',
                border: `1px solid ${cc.border}`,
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: `${card.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '22px', height: '22px', color: card.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0, fontWeight: 500 }}>{card.label}</p>
                <p style={{ fontSize: '18px', fontWeight: '700', color: cc.textPrimary, margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 1: Recent Transactions */}
      <div
        style={{
          backgroundColor: cc.cardBg,
          borderRadius: '12px',
          border: `1px solid ${cc.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: `1px solid ${cc.borderLight}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowLeftRight style={{ width: '20px', height: '20px', color: cc.primary }} />
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>
              Transaksi Terbaru
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: cc.textMuted,
                backgroundColor: cc.borderLight,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              {filteredTxs.length} entri
            </span>
          </div>

          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(Object.keys(TX_FILTER_LABELS) as TxFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${txFilter === f ? cc.primary : cc.border}`,
                  backgroundColor: txFilter === f ? '#EFF6FF' : cc.cardBg,
                  color: txFilter === f ? cc.primary : cc.textMuted,
                  fontSize: '12px',
                  fontWeight: txFilter === f ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {TX_FILTER_LABELS[f]}
                {f === 'flagged' && flaggedTxs.length > 0 && (
                  <span
                    style={{
                      marginLeft: '5px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '10px',
                    }}
                  >
                    {flaggedTxs.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: cc.borderLight }}>
                {['Tanggal', 'Dari (Agensi)', 'Kepada', 'Jumlah', 'Tipe', 'Status'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: cc.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTxs.map((tx, i) => {
                const statusCfg = TX_STATUS_COLORS[tx.status];
                const typeCfg = TX_TYPE_COLORS[tx.type];
                return (
                  <tr
                    key={tx.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: tx.status === 'flagged'
                        ? '#FFFBEB'
                        : i % 2 === 0 ? '#FFFFFF' : cc.pageBg,
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: cc.textPrimary, whiteSpace: 'nowrap' }}>
                      {tx.from}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textSecondary, whiteSpace: 'nowrap' }}>
                      {tx.to}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: cc.textPrimary, whiteSpace: 'nowrap' }}>
                      {formatRupiah(tx.amount)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: typeCfg.text,
                          backgroundColor: typeCfg.bg,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {typeCfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: statusCfg.text,
                          backgroundColor: statusCfg.bg,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tx.status === 'flagged' && '⚠ '}{statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Wallet Overview */}
      <div
        style={{
          backgroundColor: cc.cardBg,
          borderRadius: '12px',
          border: `1px solid ${cc.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: `1px solid ${cc.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Wallet style={{ width: '20px', height: '20px', color: cc.primary }} />
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>
            Wallet Overview
          </h2>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: cc.textMuted,
              backgroundColor: cc.borderLight,
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            {wallets.length} wallet
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: cc.borderLight }}>
                {['Nama Agensi', 'Saldo', 'Aktivitas Terakhir', 'Status', 'Aksi'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: col === 'Saldo' ? 'right' : 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: cc.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet, i) => {
                const isBlocked = wallet.status === 'blocked';
                const isLoading = blockingId === wallet.id;
                return (
                  <tr
                    key={wallet.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: isBlocked
                        ? '#FEF2F2'
                        : i % 2 === 0 ? '#FFFFFF' : cc.pageBg,
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            backgroundColor: isBlocked ? '#FEE2E2' : '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Wallet style={{ width: '16px', height: '16px', color: isBlocked ? '#DC2626' : cc.primary }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary }}>
                          {wallet.agencyName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: isBlocked ? '#DC2626' : cc.textPrimary }}>
                      {isBlocked ? '—' : formatRupiah(wallet.balance)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(wallet.lastActivity)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: isBlocked ? '#DC2626' : '#15803D',
                          backgroundColor: isBlocked ? '#FEE2E2' : '#DCFCE7',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isBlocked ? 'Diblokir' : 'Aktif'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleBlock(wallet.id)}
                        disabled={isLoading}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${isBlocked ? '#BBF7D0' : '#FECACA'}`,
                          backgroundColor: isBlocked ? '#F0FDF4' : '#FEF2F2',
                          color: isBlocked ? '#15803D' : '#DC2626',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          opacity: isLoading ? 0.6 : 1,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                      >
                        {isLoading ? (
                          <span>Memproses...</span>
                        ) : isBlocked ? (
                          <>
                            <Unlock style={{ width: '13px', height: '13px' }} />
                            Buka Blokir
                          </>
                        ) : (
                          <>
                            <Lock style={{ width: '13px', height: '13px' }} />
                            Blokir
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${cc.borderLight}`,
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', color: cc.textMuted }}>
            <strong style={{ color: cc.textPrimary }}>{activeWallets}</strong> wallet aktif
          </span>
          <span style={{ fontSize: '12px', color: cc.textMuted }}>
            <strong style={{ color: '#DC2626' }}>{wallets.length - activeWallets}</strong> wallet diblokir
          </span>
          <span style={{ fontSize: '12px', color: cc.textMuted }}>
            Total saldo aktif: <strong style={{ color: cc.textPrimary }}>{formatRupiah(wallets.filter(w => w.status === 'active').reduce((s, w) => s + w.balance, 0))}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
