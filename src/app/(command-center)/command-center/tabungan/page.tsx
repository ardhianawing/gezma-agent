'use client';

import { useState } from 'react';
import { Landmark, Target, TrendingUp, Users, CheckCircle, Eye, Settings } from 'lucide-react';

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

type SavingStatus = 'active' | 'completed' | 'cancelled';
type FilterTab = 'semua' | 'active' | 'completed' | 'cancelled';

interface SavingPlan {
  id: string;
  pilgrimName: string;
  agency: string;
  goalAmount: number;
  savedAmount: number;
  monthlyDeposit: number;
  status: SavingStatus;
  startDate: string;
}

const STATUS_COLORS: Record<SavingStatus, { bg: string; text: string; label: string }> = {
  active:    { bg: '#DCFCE7', text: '#15803D', label: 'Aktif' },
  completed: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Selesai' },
  cancelled: { bg: '#F1F5F9', text: '#64748B', label: 'Dibatalkan' },
};

const MOCK_PLANS: SavingPlan[] = [
  { id: '1',  pilgrimName: 'Ahmad Fauzi',        agency: 'PT Nur Ilahi Tour',    goalAmount: 30000000, savedAmount: 24000000, monthlyDeposit: 2000000, status: 'active',    startDate: '2025-01-15' },
  { id: '2',  pilgrimName: 'Siti Rahmawati',     agency: 'Al-Barokah Travel',    goalAmount: 25000000, savedAmount: 25000000, monthlyDeposit: 1500000, status: 'completed', startDate: '2024-06-01' },
  { id: '3',  pilgrimName: 'Budi Santoso',       agency: 'Arminareka Perdana',   goalAmount: 35000000, savedAmount: 7000000,  monthlyDeposit: 2500000, status: 'active',    startDate: '2025-09-10' },
  { id: '4',  pilgrimName: 'Dewi Lestari',       agency: 'Fazam Tour & Travel',  goalAmount: 20000000, savedAmount: 18000000, monthlyDeposit: 1200000, status: 'active',    startDate: '2024-11-20' },
  { id: '5',  pilgrimName: 'Eko Prasetyo',       agency: 'Baitussalam Tour',     goalAmount: 28000000, savedAmount: 5600000,  monthlyDeposit: 1800000, status: 'active',    startDate: '2025-10-05' },
  { id: '6',  pilgrimName: 'Fatimah Zahra',      agency: 'Khalifa Wisata',       goalAmount: 15000000, savedAmount: 15000000, monthlyDeposit: 1000000, status: 'completed', startDate: '2024-03-12' },
  { id: '7',  pilgrimName: 'Gunawan Hadi',       agency: 'PT Mina Wisata Islami',goalAmount: 32000000, savedAmount: 9600000,  monthlyDeposit: 2200000, status: 'active',    startDate: '2025-08-18' },
  { id: '8',  pilgrimName: 'Hana Fitriani',      agency: 'Safari Suci Tour',     goalAmount: 22000000, savedAmount: 4400000,  monthlyDeposit: 1400000, status: 'cancelled', startDate: '2025-02-01' },
  { id: '9',  pilgrimName: 'Irfan Maulana',      agency: 'Rabani Travel',        goalAmount: 18000000, savedAmount: 18000000, monthlyDeposit: 1500000, status: 'completed', startDate: '2024-09-07' },
  { id: '10', pilgrimName: 'Juliana Putri',      agency: 'Duta Wisata Haji',     goalAmount: 26000000, savedAmount: 5200000,  monthlyDeposit: 1600000, status: 'active',    startDate: '2025-11-01' },
];

function formatRupiah(amount: number): string {
  if (amount >= 1000000) {
    const jt = amount / 1000000;
    return `Rp ${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1)} jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatRupiahFull(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 100 ? '#2563EB' : pct >= 60 ? '#10B981' : pct >= 30 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: color, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color, minWidth: '36px' }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

export default function CCTabunganPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [adjustTarget, setAdjustTarget] = useState<string | null>(null);

  const totalSaved = MOCK_PLANS.reduce((s, p) => s + p.savedAmount, 0);
  const activeSavers = MOCK_PLANS.filter(p => p.status === 'active').length;
  const completed = MOCK_PLANS.filter(p => p.status === 'completed');
  const completionRate = Math.round((completed.length / MOCK_PLANS.length) * 100);
  const avgGoal = Math.round(MOCK_PLANS.reduce((s, p) => s + p.goalAmount, 0) / MOCK_PLANS.length);

  const statCards = [
    { label: 'Total Plans',      value: MOCK_PLANS.length,         icon: Landmark,   color: '#2563EB', format: (v: number) => v.toString() },
    { label: 'Total Saved (IDR)',value: totalSaved,                icon: TrendingUp,  color: '#10B981', format: formatRupiah },
    { label: 'Active Savers',    value: activeSavers,              icon: Users,       color: '#F59E0B', format: (v: number) => v.toString() },
    { label: 'Completion Rate',  value: completionRate,            icon: CheckCircle, color: '#8B5CF6', format: (v: number) => `${v}%` },
    { label: 'Average Goal',     value: avgGoal,                   icon: Target,      color: '#EF4444', format: formatRupiah },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua',     label: 'Semua' },
    { key: 'active',    label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = MOCK_PLANS.filter(p => {
    if (activeTab === 'semua') return true;
    return p.status === activeTab;
  });

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
            <Landmark style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Tabungan Administration
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Kelola semua rencana tabungan jemaah dan pantau progress tabungan haji/umrah.
        </p>
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
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '22px', height: '22px', color: card.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.label}</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: cc.textPrimary, margin: '3px 0 0 0', whiteSpace: 'nowrap' }}>
                  {card.format(card.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${cc.border}`, paddingLeft: '20px' }}>
          {filterTabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${cc.primary}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? cc.primary : cc.textMuted,
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  marginBottom: '-1px',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: cc.borderLight }}>
                {['Pilgrim Name', 'Agency', 'Goal Amount', 'Saved Amount', 'Progress', 'Monthly Deposit', 'Status', 'Start Date', 'Actions'].map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>
                    Tidak ada data tabungan ditemukan.
                  </td>
                </tr>
              ) : filtered.map((plan, i) => {
                const pct = (plan.savedAmount / plan.goalAmount) * 100;
                const statusCfg = STATUS_COLORS[plan.status];
                return (
                  <tr
                    key={plan.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    {/* Pilgrim Name */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{plan.pilgrimName}</p>
                    </td>

                    {/* Agency */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textSecondary, margin: 0 }}>{plan.agency}</p>
                    </td>

                    {/* Goal Amount */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textPrimary, margin: 0, fontWeight: 500 }}>{formatRupiahFull(plan.goalAmount)}</p>
                    </td>

                    {/* Saved Amount */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: '#10B981', margin: 0, fontWeight: 600 }}>{formatRupiahFull(plan.savedAmount)}</p>
                    </td>

                    {/* Progress */}
                    <td style={{ padding: '14px 16px' }}>
                      <ProgressBar pct={pct} />
                    </td>

                    {/* Monthly Deposit */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>{formatRupiahFull(plan.monthlyDeposit)}/bln</p>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
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

                    {/* Start Date */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(plan.startDate)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* View Detail */}
                        <button
                          title="View Detail"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${cc.border}`,
                            backgroundColor: cc.cardBg,
                            color: cc.primary,
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Eye style={{ width: '13px', height: '13px' }} />
                          Detail
                        </button>

                        {/* Adjust */}
                        {adjustTarget === plan.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => setAdjustTarget(null)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#F59E0B',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setAdjustTarget(null)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: `1px solid ${cc.border}`,
                                backgroundColor: cc.cardBg,
                                color: cc.textMuted,
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            title="Adjust"
                            onClick={() => setAdjustTarget(plan.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: `1px solid #FDE68A`,
                              backgroundColor: '#FFFBEB',
                              color: '#D97706',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Settings style={{ width: '13px', height: '13px' }} />
                            Adjust
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

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${cc.borderLight}` }}>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Menampilkan {filtered.length} dari {MOCK_PLANS.length} rencana tabungan
          </p>
        </div>
      </div>
    </div>
  );
}
