'use client';

import { useState } from 'react';
import { Plug, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, FileText, BookOpen, Globe, CreditCard, MessageCircle, Banknote } from 'lucide-react';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

type IntegrationStatus = 'connected' | 'active' | 'error' | 'pending';

interface IntegrationStat {
  label: string;
  value: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastSync?: string;
  stats: IntegrationStat[];
  primaryAction: { label: string; icon: React.ElementType; color: string; bg: string; border: string };
  secondaryAction?: { label: string; icon: React.ElementType };
  iconColor: string;
  iconBg: string;
  Icon: React.ElementType;
}

const STATUS_CFG: Record<IntegrationStatus, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  connected: { label: 'Connected',      bg: '#DCFCE7', text: '#15803D', Icon: CheckCircle },
  active:    { label: 'Active',         bg: '#DCFCE7', text: '#15803D', Icon: CheckCircle },
  error:     { label: 'Error',          bg: '#FEE2E2', text: '#DC2626', Icon: XCircle },
  pending:   { label: 'Pending Setup',  bg: '#FEF3C7', text: '#D97706', Icon: AlertCircle },
};

const INTEGRATIONS: Integration[] = [
  {
    id: 'nusuk',
    name: 'Nusuk API',
    description: 'Integrasi resmi dengan platform manajemen umrah Arab Saudi untuk verifikasi izin jemaah dan pemesanan layanan.',
    status: 'connected',
    lastSync: '2026-04-11 08:42',
    stats: [
      { label: 'API Calls Today', value: '1,847' },
      { label: 'Success Rate', value: '99.3%' },
    ],
    iconColor: '#1D4ED8',
    iconBg: '#DBEAFE',
    Icon: Globe,
    primaryAction: { label: 'Test Connection', icon: RefreshCw, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    secondaryAction: { label: 'View Logs', icon: FileText },
  },
  {
    id: 'payment',
    name: 'Payment Gateway',
    description: 'Midtrans sebagai payment gateway utama untuk transaksi pembayaran paket umrah dan cicilan jemaah.',
    status: 'active',
    lastSync: '2026-04-11 09:15',
    stats: [
      { label: 'Transaksi Hari Ini', value: '234' },
      { label: 'Total Volume', value: 'Rp 847jt' },
    ],
    iconColor: '#0F766E',
    iconBg: '#CCFBF1',
    Icon: CreditCard,
    primaryAction: { label: 'Configure', icon: Settings, color: '#0F766E', bg: '#F0FDF9', border: '#99F6E4' },
    secondaryAction: { label: 'View Logs', icon: FileText },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'WhatsApp Business API untuk notifikasi otomatis kepada jemaah: konfirmasi, pengingat keberangkatan, dan pembaruan status.',
    status: 'connected',
    lastSync: '2026-04-11 09:30',
    stats: [
      { label: 'Pesan Terkirim Hari Ini', value: '3,412' },
      { label: 'Delivery Rate', value: '97.8%' },
    ],
    iconColor: '#15803D',
    iconBg: '#DCFCE7',
    Icon: MessageCircle,
    primaryAction: { label: 'Configure', icon: Settings, color: '#15803D', bg: '#F0FDF4', border: '#86EFAC' },
    secondaryAction: { label: 'View Logs', icon: FileText },
  },
  {
    id: 'umrahcash',
    name: 'UmrahCash',
    description: 'Layanan pembiayaan syariah untuk jemaah umrah — cicilan 0% tanpa riba, dikelola melalui GEZMA PayLater.',
    status: 'pending',
    stats: [
      { label: 'Status', value: 'Belum Dikonfigurasi' },
      { label: 'Estimasi Go-Live', value: 'Mei 2026' },
    ],
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    Icon: Banknote,
    primaryAction: { label: 'Setup Now', icon: Settings, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    secondaryAction: { label: 'View Docs', icon: BookOpen },
  },
];

const API_USAGE = [
  { name: 'Nusuk API',          callsToday: 1847, callsMonth: 48320, rateLimit: '5,000/day',   status: 'normal' as const },
  { name: 'Midtrans Payment',   callsToday: 234,  callsMonth: 6780,  rateLimit: '10,000/day',  status: 'normal' as const },
  { name: 'WhatsApp Business',  callsToday: 3412, callsMonth: 89400, rateLimit: '100,000/day', status: 'normal' as const },
  { name: 'UmrahCash API',      callsToday: 0,    callsMonth: 0,     rateLimit: '1,000/day',   status: 'pending' as const },
];

type ApiStatus = 'normal' | 'warning' | 'pending';

const API_STATUS_CFG: Record<ApiStatus, { label: string; bg: string; text: string }> = {
  normal:  { label: 'Normal',  bg: '#DCFCE7', text: '#15803D' },
  warning: { label: 'Warning', bg: '#FEF3C7', text: '#D97706' },
  pending: { label: 'Pending', bg: '#F1F5F9', text: '#64748B' },
};

export default function CCIntegrationsPage() {
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTest = (id: string) => {
    setTestingId(id);
    setTimeout(() => setTestingId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#2563EB18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Plug style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Platform Integrations
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Monitor dan kelola semua integrasi layanan eksternal yang terhubung dengan ekosistem GEZMA.
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {INTEGRATIONS.map(integration => {
          const statusCfg = STATUS_CFG[integration.status];
          const StatusIcon = statusCfg.Icon;
          const IntegrationIcon = integration.Icon;
          const PrimaryIcon = integration.primaryAction.icon;
          const isTesting = testingId === integration.id;

          return (
            <div
              key={integration.id}
              style={{
                backgroundColor: cc.cardBg,
                borderRadius: '16px',
                border: `1px solid ${cc.border}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Card Top: Icon + Name + Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: integration.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IntegrationIcon style={{ width: '26px', height: '26px', color: integration.iconColor }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
                      {integration.name}
                    </h3>
                    {integration.lastSync && (
                      <p style={{ fontSize: '11px', color: cc.textMuted, margin: '2px 0 0 0' }}>
                        Last sync: {integration.lastSync}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: statusCfg.bg,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  flexShrink: 0,
                }}>
                  <StatusIcon style={{ width: '12px', height: '12px', color: statusCfg.text }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: statusCfg.text }}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0, lineHeight: '1.6' }}>
                {integration.description}
              </p>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                backgroundColor: cc.pageBg,
                borderRadius: '10px',
                padding: '14px',
              }}>
                {integration.stats.map(stat => (
                  <div key={stat.label}>
                    <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0 }}>{stat.label}</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: cc.textPrimary, margin: '2px 0 0 0' }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => integration.id === 'nusuk' && handleTest(integration.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${integration.primaryAction.border}`,
                    backgroundColor: integration.primaryAction.bg,
                    color: integration.primaryAction.color,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <PrimaryIcon style={{
                    width: '14px',
                    height: '14px',
                    animation: isTesting ? 'spin 1s linear infinite' : 'none',
                  }} />
                  {isTesting ? 'Testing...' : integration.primaryAction.label}
                </button>

                {integration.secondaryAction && (() => {
                  const SecIcon = integration.secondaryAction.icon;
                  return (
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${cc.border}`,
                        backgroundColor: cc.cardBg,
                        color: cc.textSecondary,
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <SecIcon style={{ width: '14px', height: '14px' }} />
                      {integration.secondaryAction.label}
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Usage Section */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cc.border}` }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            API Usage Summary
          </h2>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: '4px 0 0 0' }}>
            Ringkasan penggunaan API seluruh integrasi aktif.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: cc.borderLight }}>
                {['API Name', 'Calls Today', 'Calls This Month', 'Rate Limit', 'Status'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: cc.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {API_USAGE.map((api, i) => {
                const statusCfg = API_STATUS_CFG[api.status];
                return (
                  <tr
                    key={api.name}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0 }}>
                        {api.name}
                      </p>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: cc.textSecondary, fontWeight: 500 }}>
                      {api.callsToday.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: cc.textSecondary, fontWeight: 500 }}>
                      {api.callsMonth.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: cc.textMuted }}>
                      {api.rateLimit}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: statusCfg.text,
                        backgroundColor: statusCfg.bg,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}>
                        {statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: `1px solid ${cc.borderLight}` }}>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Data diperbarui setiap 5 menit. Terakhir diperbarui: 11 Apr 2026, 09:35
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
