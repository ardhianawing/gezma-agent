'use client';

import { useState } from 'react';
import { Receipt, Building2, TrendingUp, CheckCircle, AlertCircle, XCircle, FileText, ArrowUpDown, Ban } from 'lucide-react';

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

type PlanType = 'Starter' | 'Professional' | 'Enterprise';
type StatusType = 'active' | 'trial' | 'overdue' | 'cancelled';
type FilterTab = 'semua' | 'active' | 'trial' | 'overdue' | 'cancelled';

interface Agency {
  id: string;
  name: string;
  plan: PlanType;
  priceMonth: number;
  status: StatusType;
  nextInvoice: string;
  paymentMethod: string;
  joinedDate: string;
}

const PLAN_COLORS: Record<PlanType, { bg: string; text: string }> = {
  Starter:      { bg: '#F1F5F9', text: '#475569' },
  Professional: { bg: '#DBEAFE', text: '#1D4ED8' },
  Enterprise:   { bg: '#F3E8FF', text: '#7C3AED' },
};

const STATUS_COLORS: Record<StatusType, { bg: string; text: string; label: string }> = {
  active:    { bg: '#DCFCE7', text: '#15803D', label: 'Active' },
  trial:     { bg: '#DBEAFE', text: '#1D4ED8', label: 'Trial' },
  overdue:   { bg: '#FEE2E2', text: '#DC2626', label: 'Overdue' },
  cancelled: { bg: '#F1F5F9', text: '#64748B', label: 'Cancelled' },
};

const PLAN_PRICE: Record<PlanType, number> = {
  Starter: 199000,
  Professional: 499000,
  Enterprise: 999000,
};

const MOCK_AGENCIES: Agency[] = [
  { id: '1',  name: 'PT Nur Ilahi Tour',       plan: 'Enterprise',   priceMonth: PLAN_PRICE.Enterprise,   status: 'active',    nextInvoice: '2026-05-01', paymentMethod: 'Auto Debit BCA',    joinedDate: '2024-03-15' },
  { id: '2',  name: 'Al-Barokah Travel',        plan: 'Professional', priceMonth: PLAN_PRICE.Professional, status: 'active',    nextInvoice: '2026-05-05', paymentMethod: 'Transfer BNI',      joinedDate: '2024-06-20' },
  { id: '3',  name: 'Arminareka Perdana',       plan: 'Enterprise',   priceMonth: PLAN_PRICE.Enterprise,   status: 'overdue',   nextInvoice: '2026-04-01', paymentMethod: 'Kartu Kredit',      joinedDate: '2023-11-08' },
  { id: '4',  name: 'Fazam Tour & Travel',      plan: 'Starter',      priceMonth: PLAN_PRICE.Starter,      status: 'trial',     nextInvoice: '2026-04-20', paymentMethod: '-',                 joinedDate: '2026-03-25' },
  { id: '5',  name: 'Baitussalam Tour',         plan: 'Professional', priceMonth: PLAN_PRICE.Professional, status: 'active',    nextInvoice: '2026-05-10', paymentMethod: 'Auto Debit Mandiri', joinedDate: '2024-09-12' },
  { id: '6',  name: 'Khalifa Wisata',           plan: 'Starter',      priceMonth: PLAN_PRICE.Starter,      status: 'active',    nextInvoice: '2026-05-03', paymentMethod: 'Transfer BCA',      joinedDate: '2025-01-17' },
  { id: '7',  name: 'PT Mina Wisata Islami',    plan: 'Enterprise',   priceMonth: PLAN_PRICE.Enterprise,   status: 'active',    nextInvoice: '2026-05-08', paymentMethod: 'Auto Debit BRI',    joinedDate: '2023-08-30' },
  { id: '8',  name: 'Safari Suci Tour',         plan: 'Professional', priceMonth: PLAN_PRICE.Professional, status: 'overdue',   nextInvoice: '2026-03-28', paymentMethod: 'Kartu Kredit',      joinedDate: '2024-12-01' },
  { id: '9',  name: 'Rabani Travel',            plan: 'Starter',      priceMonth: PLAN_PRICE.Starter,      status: 'trial',     nextInvoice: '2026-04-18', paymentMethod: '-',                 joinedDate: '2026-03-28' },
  { id: '10', name: 'Duta Wisata Haji',         plan: 'Professional', priceMonth: PLAN_PRICE.Professional, status: 'active',    nextInvoice: '2026-05-12', paymentMethod: 'Transfer BNI',      joinedDate: '2024-07-05' },
  { id: '11', name: 'Raudhah Wisata',           plan: 'Starter',      priceMonth: PLAN_PRICE.Starter,      status: 'cancelled', nextInvoice: '-',          paymentMethod: '-',                 joinedDate: '2025-02-14' },
  { id: '12', name: 'Zam-Zam Tour Indonesia',   plan: 'Professional', priceMonth: PLAN_PRICE.Professional, status: 'active',    nextInvoice: '2026-05-07', paymentMethod: 'Auto Debit BCA',    joinedDate: '2024-05-22' },
];

function formatIDR(amount: number): string {
  if (amount === 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  if (dateStr === '-') return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CCBillingPage() {
  const [agencies] = useState<Agency[]>(MOCK_AGENCIES);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');

  const filtered = agencies.filter(a => {
    if (activeTab === 'semua') return true;
    return a.status === activeTab;
  });

  const activeCount = agencies.filter(a => a.status === 'active').length;
  const overdueCount = agencies.filter(a => a.status === 'overdue').length;
  const mrr = agencies
    .filter(a => a.status === 'active' || a.status === 'overdue')
    .reduce((sum, a) => sum + a.priceMonth, 0);
  const activeSubs = agencies.filter(a => a.status === 'active' || a.status === 'trial').length;
  const cancelledCount = agencies.filter(a => a.status === 'cancelled').length;
  const churnRate = ((cancelledCount / agencies.length) * 100).toFixed(1);

  const statCards = [
    { label: 'Total Agencies', value: agencies.length, icon: Building2, color: '#2563EB' },
    { label: 'MRR (IDR)', value: formatIDR(mrr), icon: TrendingUp, color: '#10B981', isText: true },
    { label: 'Active Subscriptions', value: activeSubs, icon: CheckCircle, color: '#10B981' },
    { label: 'Overdue Invoices', value: overdueCount, icon: AlertCircle, color: '#EF4444' },
    { label: 'Churn Rate', value: `${churnRate}%`, icon: XCircle, color: '#F59E0B', isText: true },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'active', label: 'Active' },
    { key: 'trial', label: 'Trial' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

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
            <Receipt style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Billing &amp; Subscriptions
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Kelola paket langganan, tagihan, dan pembayaran seluruh agensi dalam ekosistem GEZMA.
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
                <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0, whiteSpace: 'nowrap' }}>{card.label}</p>
                <p style={{
                  fontSize: card.isText ? '16px' : '22px',
                  fontWeight: '700',
                  color: cc.textPrimary,
                  margin: '4px 0 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${cc.border}`, paddingLeft: '20px' }}>
          {filterTabs.map(tab => {
            const isActive = activeTab === tab.key;
            const badgeCount = tab.key === 'overdue' ? overdueCount : 0;
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
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                {badgeCount > 0 && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#EF4444',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: cc.borderLight }}>
                {['Agency Name', 'Plan', 'Price/Month', 'Status', 'Next Invoice', 'Payment Method', 'Joined Date', 'Actions'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 16px',
                      textAlign: col === 'Actions' ? 'center' : 'left',
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : filtered.map((agency, i) => {
                const planCfg = PLAN_COLORS[agency.plan];
                const statusCfg = STATUS_COLORS[agency.status];
                return (
                  <tr
                    key={agency.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    {/* Agency Name */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Building2 style={{ width: '16px', height: '16px', color: '#2563EB' }} />
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0, whiteSpace: 'nowrap' }}>
                          {agency.name}
                        </p>
                      </div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: planCfg.text,
                        backgroundColor: planCfg.bg,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}>
                        {agency.plan}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0 }}>
                        {formatIDR(agency.priceMonth)}
                      </p>
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

                    {/* Next Invoice */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(agency.nextInvoice)}
                    </td>

                    {/* Payment Method */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: cc.textSecondary, whiteSpace: 'nowrap' }}>
                      {agency.paymentMethod}
                    </td>

                    {/* Joined Date */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(agency.joinedDate)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        {/* View Invoice */}
                        <button
                          title="View Invoice"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: `1px solid ${cc.border}`,
                            backgroundColor: cc.cardBg,
                            color: cc.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <FileText style={{ width: '14px', height: '14px' }} />
                        </button>

                        {/* Upgrade/Downgrade */}
                        <button
                          title="Upgrade / Downgrade Plan"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: `1px solid ${cc.border}`,
                            backgroundColor: cc.cardBg,
                            color: '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <ArrowUpDown style={{ width: '14px', height: '14px' }} />
                        </button>

                        {/* Suspend */}
                        <button
                          title="Suspend Agency"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: `1px solid #FECACA`,
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <Ban style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${cc.borderLight}` }}>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Menampilkan {filtered.length} dari {agencies.length} agensi
          </p>
        </div>
      </div>
    </div>
  );
}
