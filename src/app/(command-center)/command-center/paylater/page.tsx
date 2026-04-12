'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, Users } from 'lucide-react';

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

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
  approved: { bg: '#DCFCE7', text: '#15803D', label: 'Disetujui' },
  rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'Ditolak' },
  active:   { bg: '#DBEAFE', text: '#1D4ED8', label: 'Aktif' },
  overdue:  { bg: '#FEE2E2', text: '#7C2D12', label: 'Overdue' },
};

interface PayLaterEntry {
  id: string;
  agencyName: string;
  pilgrimName: string;
  amount: number;
  tenor: number;
  monthly: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'overdue';
  submittedDate: string;
}

const MOCK_DATA: PayLaterEntry[] = [
  {
    id: 'pl-001',
    agencyName: 'PT Baitullah Mitra Utama',
    pilgrimName: 'Haji Arifin Sudrajat',
    amount: 25_000_000,
    tenor: 12,
    monthly: 2_208_333,
    status: 'pending',
    submittedDate: '2026-04-01',
  },
  {
    id: 'pl-002',
    agencyName: 'CV Al-Haramain Tour',
    pilgrimName: 'Ibu Siti Rahayu Wulandari',
    amount: 15_000_000,
    tenor: 6,
    monthly: 2_583_333,
    status: 'pending',
    submittedDate: '2026-04-03',
  },
  {
    id: 'pl-003',
    agencyName: 'PT Madinah Raya Travel',
    pilgrimName: 'Bapak Djamaluddin Nasution',
    amount: 30_000_000,
    tenor: 18,
    monthly: 1_722_222,
    status: 'approved',
    submittedDate: '2026-03-15',
  },
  {
    id: 'pl-004',
    agencyName: 'CV Zamzam Sejahtera',
    pilgrimName: 'Ibu Nurhayati Basri',
    amount: 10_000_000,
    tenor: 6,
    monthly: 1_716_667,
    status: 'active',
    submittedDate: '2026-02-20',
  },
  {
    id: 'pl-005',
    agencyName: 'PT Armina Haji Umrah',
    pilgrimName: 'Bapak Mochammad Ridwan',
    amount: 20_000_000,
    tenor: 12,
    monthly: 1_750_000,
    status: 'active',
    submittedDate: '2026-01-10',
  },
  {
    id: 'pl-006',
    agencyName: 'CV Multazam Tour & Travel',
    pilgrimName: 'Ibu Fatimah Zahra Kusuma',
    amount: 8_000_000,
    tenor: 3,
    monthly: 2_733_333,
    status: 'overdue',
    submittedDate: '2025-12-05',
  },
  {
    id: 'pl-007',
    agencyName: 'PT Al-Amin Wisata Religi',
    pilgrimName: 'Bapak Supriadi Kartono',
    amount: 18_000_000,
    tenor: 9,
    monthly: 2_066_667,
    status: 'rejected',
    submittedDate: '2026-03-28',
  },
  {
    id: 'pl-008',
    agencyName: 'CV Barokah Perjalanan Suci',
    pilgrimName: 'Ibu Endang Susilawati',
    amount: 12_000_000,
    tenor: 6,
    monthly: 2_066_667,
    status: 'overdue',
    submittedDate: '2025-11-18',
  },
  {
    id: 'pl-009',
    agencyName: 'PT Rabbani Haji Plus',
    pilgrimName: 'Bapak Hendra Gunawan Saputra',
    amount: 22_500_000,
    tenor: 12,
    monthly: 1_968_750,
    status: 'pending',
    submittedDate: '2026-04-08',
  },
  {
    id: 'pl-010',
    agencyName: 'CV Nur Ilahi Wisata',
    pilgrimName: 'Ibu Rosmawati Harahap',
    amount: 5_500_000,
    tenor: 3,
    monthly: 1_891_667,
    status: 'approved',
    submittedDate: '2026-03-22',
  },
];

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'overdue';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'Semua' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'active',   label: 'Active' },
  { key: 'overdue',  label: 'Overdue' },
];

export default function CCPayLaterPage() {
  const [data, setData] = useState<PayLaterEntry[]>(MOCK_DATA);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const stats = {
    total:     data.length,
    pending:   data.filter(d => d.status === 'pending').length,
    approved:  data.filter(d => d.status === 'approved').length,
    rejected:  data.filter(d => d.status === 'rejected').length,
    active:    data.filter(d => d.status === 'active').length,
    overdue:   data.filter(d => d.status === 'overdue').length,
    disbursed: data.filter(d => ['approved', 'active', 'overdue'].includes(d.status)).reduce((s, d) => s + d.amount, 0),
  };

  const filtered = activeFilter === 'all' ? data : data.filter(d => d.status === activeFilter);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    setTimeout(() => {
      setData(prev => prev.map(item =>
        item.id === id
          ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
          : item
      ));
      setSuccessMsg(`Pengajuan berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setActionLoading(null);
    }, 600);
  };

  const statCards = [
    { label: 'Total Pengajuan',   value: stats.total,                              icon: Users,         color: '#2563EB' },
    { label: 'Approved',          value: stats.approved,                           icon: CheckCircle,   color: '#15803D' },
    { label: 'Rejected',          value: stats.rejected,                           icon: XCircle,       color: '#DC2626' },
    { label: 'Active',            value: stats.active,                             icon: CreditCard,    color: '#1D4ED8' },
    { label: 'Overdue',           value: stats.overdue,                            icon: AlertTriangle, color: '#D97706' },
    { label: 'Total Disbursed',   value: formatRupiah(stats.disbursed),            icon: DollarSign,    color: '#7C3AED' },
  ];

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 600,
    color: cc.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap' as const,
  };

  const tdStyle = {
    padding: '14px 16px',
    fontSize: '13px',
    color: cc.textSecondary,
    verticalAlign: 'middle' as const,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: cc.pageBg, padding: '24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#2563EB18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
            PayLater Administration
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, margin: 0 }}>
          Kelola pengajuan cicilan jemaah dan pantau status pembayaran
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '13px', fontWeight: 500, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          {successMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: cc.cardBg,
                borderRadius: '12px',
                border: `1px solid ${cc.border}`,
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: cc.textMuted, margin: 0, lineHeight: 1.3 }}>{card.label}</p>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '16px', height: '16px', color: card.color }} />
                </div>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: `1px solid ${cc.border}` }}>
        {FILTER_TABS.map(tab => {
          const isActive = activeFilter === tab.key;
          const count = tab.key === 'all' ? data.length : data.filter(d => d.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? `2px solid ${cc.primary}` : '2px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? cc.primary : cc.textMuted,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#EFF6FF' : cc.borderLight,
                  color: isActive ? cc.primary : cc.textMuted,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: cc.cardBg, border: `1px solid ${cc.border}`, borderRadius: '12px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Clock style={{ width: '40px', height: '40px', color: cc.textMuted, margin: '0 auto 12px' }} />
            <p style={{ color: cc.textMuted, fontSize: '14px', margin: 0 }}>Tidak ada data pengajuan</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: cc.borderLight, borderBottom: `1px solid ${cc.border}` }}>
                  <th style={thStyle}>Nama Agensi</th>
                  <th style={thStyle}>Nama Jemaah</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Jumlah</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Tenor</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Cicilan/Bln</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                  <th style={thStyle}>Tgl Pengajuan</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const statusCfg = STATUS_COLORS[item.status];
                  const isPending = item.status === 'pending';
                  const isProcessing = actionLoading === item.id;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderTop: i > 0 ? `1px solid ${cc.borderLight}` : 'none',
                        backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC',
                        transition: 'background-color 0.1s',
                      }}
                    >
                      <td style={tdStyle}>
                        <p style={{ fontWeight: 600, color: cc.textPrimary, margin: 0, fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.agencyName}
                        </p>
                      </td>
                      <td style={tdStyle}>
                        <p style={{ margin: 0, fontSize: '13px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.pilgrimName}
                        </p>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: cc.textPrimary }}>
                          {formatRupiah(item.amount)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', color: cc.textMuted }}>
                          {item.tenor} bln
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', color: cc.textSecondary }}>
                          {formatRupiah(item.monthly)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.text,
                          whiteSpace: 'nowrap',
                        }}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        {formatDate(item.submittedDate)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              disabled={isProcessing}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 14px',
                                borderRadius: '7px',
                                border: 'none',
                                backgroundColor: isProcessing ? cc.border : '#16A34A',
                                color: isProcessing ? cc.textMuted : '#fff',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'background-color 0.15s',
                              }}
                            >
                              <CheckCircle style={{ width: '13px', height: '13px' }} />
                              {isProcessing ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleAction(item.id, 'reject')}
                              disabled={isProcessing}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 14px',
                                borderRadius: '7px',
                                border: '1px solid #FECACA',
                                backgroundColor: isProcessing ? cc.borderLight : '#FEF2F2',
                                color: isProcessing ? cc.textMuted : '#DC2626',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'background-color 0.15s',
                              }}
                            >
                              <XCircle style={{ width: '13px', height: '13px' }} />
                              {isProcessing ? '...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: cc.textMuted }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${cc.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Menampilkan {filtered.length} dari {data.length} pengajuan
          </p>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              style={{ fontSize: '12px', color: cc.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Tampilkan semua
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
