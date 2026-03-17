'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, Users, AlertCircle, Download, ArrowUpRight, ArrowDownRight, GitCompareArrows, BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useLanguage } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// ========== TYPES ==========
interface FinancialReportData {
  totalRevenue: number;
  totalOutstanding: number;
  totalPilgrims: number;
  paidPilgrims: number;
  methodBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  tripRevenue: { name: string; revenue: number; outstanding: number; pilgrimCount: number }[];
  monthlyRevenue: { month: string; amount: number }[];
}

interface FinancialReport extends FinancialReportData {
  comparison?: FinancialReportData;
}

interface DemographicsReport {
  total: number;
  genderBreakdown: { gender: string; count: number }[];
  provinceBreakdown: { province: string; count: number }[];
  ageBreakdown: { range: string; count: number }[];
}

interface DocumentsReport {
  totalPilgrims: number;
  completion: { type: string; label: string; verified: number; uploaded: number; missing: number; total: number; completionRate: number }[];
}

interface AgingReport {
  totalOutstanding: number;
  agingBuckets: { range: string; amount: number }[];
  topDebtors: { name: string; outstanding: number; daysOverdue: number }[];
}

interface ConversionReport {
  total: number;
  funnel: { step: string; label: string; count: number; percentage: number }[];
}

// ========== CONSTANTS ==========
// Tab keys and labels are set inside component to access translations
const PIE_COLORS = ['#3B82F6', '#EC4899', '#94A3B8', '#10B981', '#F59E0B', '#8B5CF6'];
const AGING_COLORS: Record<string, string> = { '0-30': '#10B981', '31-60': '#F59E0B', '61-90': '#F97316', '90+': '#EF4444' };

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function DeltaIndicator({ current, previous, isCurrency }: { current: number; previous: number; isCurrency?: boolean }) {
  if (previous === 0) return null;
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const isPositive = diff >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const color = isPositive ? '#10B981' : '#EF4444';
  const bg = isPositive ? '#ECFDF5' : '#FEF2F2';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '2px',
      padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
      fontWeight: 600, backgroundColor: bg, color,
    }}>
      <Icon style={{ width: '12px', height: '12px' }} />
      {isPositive ? '+' : ''}{pct}%
      {isCurrency && <span style={{ fontWeight: 400, marginLeft: '2px' }}>({formatCurrency(Math.abs(diff))})</span>}
    </span>
  );
}

export default function ReportsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const TABS = [
    { key: 'keuangan', label: t.reports.tabFinancial },
    { key: 'demografi', label: t.reports.tabDemographics },
    { key: 'dokumen', label: t.reports.tabDocuments },
    { key: 'aging', label: t.reports.tabAging },
    { key: 'funnel', label: t.reports.tabFunnel },
  ];

  const methodLabels: Record<string, string> = { transfer: t.reports.methodTransfer, cash: t.reports.methodCash, card: t.reports.methodCard };
  const typeLabels: Record<string, string> = { dp: t.reports.typeDp, installment: t.reports.typeInstallment, full: t.reports.typeFull, refund: t.reports.typeRefund };
  const GENDER_LABELS: Record<string, string> = { male: t.reports.genderMale, female: t.reports.genderFemale, unknown: t.reports.genderUnknown };

  const [activeTab, setActiveTab] = useState('keuangan');
  const [loading, setLoading] = useState(true);

  const [financial, setFinancial] = useState<FinancialReport | null>(null);
  const [demographics, setDemographics] = useState<DemographicsReport | null>(null);
  const [documents, setDocuments] = useState<DocumentsReport | null>(null);
  const [aging, setAging] = useState<AgingReport | null>(null);
  const [conversion, setConversion] = useState<ConversionReport | null>(null);

  // Comparison state
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareFrom, setCompareFrom] = useState('');
  const [compareTo, setCompareTo] = useState('');

  useEffect(() => {
    setLoading(true);
    const endpoints: Record<string, string> = {
      keuangan: '/api/reports/financial',
      demografi: '/api/reports/demographics',
      dokumen: '/api/reports/documents',
      aging: '/api/reports/payment-aging',
      funnel: '/api/reports/conversion',
    };

    let url = endpoints[activeTab];
    if (activeTab === 'keuangan' && compareEnabled && compareFrom && compareTo) {
      url += `?compareFrom=${compareFrom}&compareTo=${compareTo}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (activeTab === 'keuangan') setFinancial(data);
        else if (activeTab === 'demografi') setDemographics(data);
        else if (activeTab === 'dokumen') setDocuments(data);
        else if (activeTab === 'aging') setAging(data);
        else if (activeTab === 'funnel') setConversion(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab, compareEnabled, compareFrom, compareTo]);

  const handleExportCSV = async () => {
    try {
      const endpoint = activeTab === 'keuangan'
        ? '/api/reports/financial/export'
        : `/api/pilgrims/export`;
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silently fail */ }
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: isMobile ? '10px 14px' : '10px 20px',
    minHeight: '44px',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? c.primary : c.textMuted,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: isActive ? `2px solid ${c.primary}` : '2px solid transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg, borderRadius: '12px',
    border: `1px solid ${c.border}`, overflow: 'hidden',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', flexWrap: 'wrap', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
        <PageHeader title={t.reports.title} description={t.reports.description} />
        <button
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', minHeight: '44px', borderRadius: '10px',
            backgroundColor: c.cardBg, color: c.textSecondary,
            border: `1px solid ${c.border}`, fontSize: '14px',
            fontWeight: 500, cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center',
          }}
        >
          <Download style={{ width: '16px', height: '16px' }} />
          {t.reports.exportCsv}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0', overflowX: 'auto',
        borderBottom: `1px solid ${c.border}`,
        WebkitOverflowScrolling: 'touch' as const,
      }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabStyle(activeTab === tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Period Comparison Controls */}
      {activeTab === 'keuangan' && (
        <div style={{
          backgroundColor: c.cardBg, borderRadius: '12px',
          border: `1px solid ${c.border}`, padding: isMobile ? '12px' : '16px',
        }}>
          <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', gap: '12px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
            <button
              onClick={() => setCompareEnabled(!compareEnabled)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px 14px', minHeight: '44px', borderRadius: '8px',
                border: compareEnabled ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                backgroundColor: compareEnabled ? c.primaryLight : 'transparent',
                color: compareEnabled ? c.primary : c.textSecondary,
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <GitCompareArrows style={{ width: '14px', height: '14px' }} />
              {t.reports.comparePeriod}
            </button>
            {compareEnabled && (
              <>
                <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', gap: '6px', flexDirection: isMobile ? 'column' : 'row', flex: isMobile ? 1 : undefined }}>
                  <label style={{ fontSize: '12px', color: c.textMuted }}>{t.reports.compareFrom}</label>
                  <input
                    type="date"
                    value={compareFrom}
                    onChange={e => setCompareFrom(e.target.value)}
                    style={{
                      padding: '8px 10px', minHeight: '46px', fontSize: '13px', borderRadius: '6px',
                      border: `1px solid ${c.border}`, backgroundColor: c.inputBg,
                      color: c.textPrimary, outline: 'none',
                      boxSizing: 'border-box' as const, width: isMobile ? '100%' : undefined,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', gap: '6px', flexDirection: isMobile ? 'column' : 'row', flex: isMobile ? 1 : undefined }}>
                  <label style={{ fontSize: '12px', color: c.textMuted }}>{t.reports.compareTo}</label>
                  <input
                    type="date"
                    value={compareTo}
                    onChange={e => setCompareTo(e.target.value)}
                    style={{
                      padding: '8px 10px', minHeight: '46px', fontSize: '13px', borderRadius: '6px',
                      border: `1px solid ${c.border}`, backgroundColor: c.inputBg,
                      color: c.textPrimary, outline: 'none',
                      boxSizing: 'border-box' as const, width: isMobile ? '100%' : undefined,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>{t.common.loadingData}</div>
      ) : (
        <>
          {/* Keuangan Tab */}
          {activeTab === 'keuangan' && financial && <FinancialTab data={financial} c={c} isMobile={isMobile} />}

          {/* Demografi Tab */}
          {activeTab === 'demografi' && demographics && <DemografiTab data={demographics} c={c} isMobile={isMobile} />}

          {/* Dokumen Tab */}
          {activeTab === 'dokumen' && documents && <DokumenTab data={documents} c={c} isMobile={isMobile} />}

          {/* Aging Tab */}
          {activeTab === 'aging' && aging && <AgingTab data={aging} c={c} isMobile={isMobile} />}

          {/* Funnel Tab */}
          {activeTab === 'funnel' && conversion && <FunnelTab data={conversion} c={c} isMobile={isMobile} />}
        </>
      )}
    </div>
  );
}

// ========== TAB COMPONENTS ==========

function FinancialTab({ data, c, isMobile }: { data: FinancialReport; c: ReturnType<typeof useTheme>['c']; isMobile: boolean }) {
  const { t } = useLanguage();
  const comp = data.comparison;
  const collectionRate = data.totalPilgrims > 0 ? Math.round((data.paidPilgrims / data.totalPilgrims) * 100) : 0;
  const compCollectionRate = comp && comp.totalPilgrims > 0 ? Math.round((comp.paidPilgrims / comp.totalPilgrims) * 100) : 0;

  const stats = [
    { label: t.reports.totalRevenue, value: formatCurrency(data.totalRevenue), icon: DollarSign, color: c.success, bg: c.successLight, current: data.totalRevenue, compare: comp?.totalRevenue, isCurrency: true },
    { label: t.reports.outstanding, value: formatCurrency(data.totalOutstanding), icon: AlertCircle, color: c.error, bg: c.errorLight, current: data.totalOutstanding, compare: comp?.totalOutstanding, isCurrency: true },
    { label: t.reports.paidPilgrims, value: `${data.paidPilgrims}/${data.totalPilgrims}`, icon: Users, color: c.info, bg: c.infoLight, current: data.paidPilgrims, compare: comp?.paidPilgrims, isCurrency: false },
    { label: t.reports.collectionRate, value: `${collectionRate}%`, icon: TrendingUp, color: '#7C3AED', bg: '#F3E8FF', current: collectionRate, compare: compCollectionRate || undefined, isCurrency: false },
  ];

  const maxMonthly = Math.max(...data.monthlyRevenue.map(m => m.amount), 1);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: isMobile ? '16px' : '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '20px', height: '20px', color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0 0 0' }}>{s.label}</p>
              {comp && s.compare !== undefined && (
                <div style={{ marginTop: '6px' }}>
                  <DeltaIndicator current={s.current} previous={s.compare} isCurrency={s.isCurrency} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison summary card */}
      {comp && (
        <div style={{
          backgroundColor: c.cardBg, borderRadius: '12px',
          border: `1px solid ${c.border}`, padding: isMobile ? '16px' : '20px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitCompareArrows style={{ width: '16px', height: '16px', color: c.primary }} />
            {t.reports.comparisonTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px 0' }}>{t.reports.comparisonRevenue}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>{formatCurrency(comp.totalRevenue)}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px 0' }}>{t.reports.comparisonPaid}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>{comp.paidPilgrims}/{comp.totalPilgrims}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px 0' }}>{t.reports.comparisonOutstanding}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: c.error, margin: 0 }}>{formatCurrency(comp.totalOutstanding)}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>{t.reports.revenuePerTrip}</h3>
          </div>
          <div>
            {data.tripRevenue.length === 0 ? (
              <EmptyState icon={BarChart3} title={t.reports.noData} />
            ) : data.tripRevenue.map((trip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '4px' : '16px', padding: isMobile ? '12px 16px' : '14px 20px',
                borderBottom: i < data.tripRevenue.length - 1 ? `1px solid ${c.borderLight}` : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: c.textPrimary, margin: 0 }}>{trip.name}</p>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>{trip.pilgrimCount} {t.common.pilgrims}</p>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: c.success, margin: 0 }}>{formatCurrency(trip.revenue)}</p>
                  {trip.outstanding > 0 && <p style={{ fontSize: '12px', color: c.error, margin: '2px 0 0 0' }}>{t.reports.remaining} {formatCurrency(trip.outstanding)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <BreakdownCard title={t.reports.byMethod} data={data.methodBreakdown} labels={{ transfer: t.reports.methodTransfer, cash: t.reports.methodCash, card: t.reports.methodCard }} color={c.info} c={c} isMobile={isMobile} />
          <BreakdownCard title={t.reports.byType} data={data.typeBreakdown} labels={{ dp: t.reports.typeDp, installment: t.reports.typeInstallment, full: t.reports.typeFull, refund: t.reports.typeRefund }} color={c.success} c={c} isMobile={isMobile} />
        </div>
      </div>

      {data.monthlyRevenue.length > 0 && (
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>{t.reports.monthlyRevenue}</h3>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.monthlyRevenue.map(m => (
              <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: c.textMuted, width: '80px', flexShrink: 0 }}>{formatMonth(m.month)}</span>
                <div style={{ flex: 1, height: '24px', backgroundColor: c.cardBgHover, borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(m.amount / maxMonthly) * 100}%`, background: `linear-gradient(90deg, ${c.info}, ${c.info}88)`, borderRadius: '6px', minWidth: '2px' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary, width: '120px', textAlign: 'right', flexShrink: 0 }}>{formatCurrency(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function BreakdownCard({ title, data, labels, color, c, isMobile }: {
  title: string; data: Record<string, number>; labels: Record<string, string>;
  color: string; c: ReturnType<typeof useTheme>['c']; isMobile: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
      <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(data).map(([key, amount]) => {
          const total = Object.values(data).reduce((a, b) => a + b, 0);
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: c.textSecondary }}>{labels[key] || key}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary }}>{formatCurrency(amount)}</span>
              </div>
              <div style={{ height: '6px', backgroundColor: c.cardBgHover, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px' }} />
              </div>
            </div>
          );
        })}
        {Object.keys(data).length === 0 && (
          <EmptyState icon={BarChart3} title="Belum ada data" />
        )}
      </div>
    </div>
  );
}

function DemografiTab({ data, c, isMobile }: { data: DemographicsReport; c: ReturnType<typeof useTheme>['c']; isMobile: boolean }) {
  const { t } = useLanguage();
  const genderLabels: Record<string, string> = { male: t.reports.genderMale, female: t.reports.genderFemale, unknown: t.reports.genderUnknown };
  const genderData = data.genderBreakdown.map((g, i) => ({
    name: genderLabels[g.gender] || g.gender,
    value: g.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* Gender pie */}
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>{t.reports.genderTitle}</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" nameKey="name" paddingAngle={2}>
                  {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age bar */}
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>{t.reports.ageTitle}</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={data.ageBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.borderLight} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: c.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: c.textMuted }} width={30} />
                <Tooltip contentStyle={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '13px' }} />
                <Bar dataKey="count" name={t.reports.ageChartLabel} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Province table */}
      <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>{t.reports.topProvinces}</h3>
        </div>
        <div>
          {data.provinceBreakdown.length === 0 ? (
            <EmptyState icon={BarChart3} title={t.common.noData} />
          ) : data.provinceBreakdown.map((p, i) => (
            <div key={p.province} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 20px', borderBottom: i < data.provinceBreakdown.length - 1 ? `1px solid ${c.borderLight}` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: c.textLight, width: '24px' }}>{i + 1}</span>
                <span style={{ fontSize: '14px', color: c.textPrimary }}>{p.province}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>{p.count}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function DokumenTab({ data, c }: { data: DocumentsReport; c: ReturnType<typeof useTheme>['c']; isMobile: boolean }) {
  const { t } = useLanguage();
  return (
    <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>{t.reports.docCompletion} ({data.totalPilgrims} {t.common.pilgrims})</h3>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.completion.length === 0 ? (
          <EmptyState icon={BarChart3} title="Belum ada data" />
        ) : data.completion.map(doc => (
          <div key={doc.type}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: c.textPrimary }}>{doc.label}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>{doc.completionRate}%</span>
            </div>
            <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', backgroundColor: c.cardBgHover }}>
              <div style={{ width: `${doc.total > 0 ? (doc.verified / doc.total) * 100 : 0}%`, backgroundColor: '#10B981' }} />
              <div style={{ width: `${doc.total > 0 ? (doc.uploaded / doc.total) * 100 : 0}%`, backgroundColor: '#F59E0B' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: '#10B981' }}>{t.reports.docVerified}: {doc.verified}</span>
              <span style={{ fontSize: '11px', color: '#F59E0B' }}>{t.reports.docUploaded}: {doc.uploaded}</span>
              <span style={{ fontSize: '11px', color: '#EF4444' }}>{t.reports.docMissing}: {doc.missing}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgingTab({ data, c, isMobile }: { data: AgingReport; c: ReturnType<typeof useTheme>['c']; isMobile: boolean }) {
  const { t } = useLanguage();
  const chartData = data.agingBuckets.map(b => ({
    ...b,
    fill: AGING_COLORS[b.range] || '#94A3B8',
  }));

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* Aging buckets chart */}
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px 0' }}>{t.reports.agingTitle}</h3>
          <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 16px 0' }}>Total: {formatCurrency(data.totalOutstanding)}</p>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.borderLight} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: c.textMuted }} label={{ value: t.reports.agingDaysLabel, position: 'insideBottomRight', offset: -5, fontSize: 11, fill: c.textMuted }} />
                <YAxis tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`} tick={{ fontSize: 11, fill: c.textMuted }} width={50} />
                <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value)), t.reports.agingOutstandingLabel]} contentStyle={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '13px' }} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top debtors */}
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>{t.reports.topDebtors}</h3>
          </div>
          <div>
            {data.topDebtors.length === 0 ? (
              <EmptyState icon={BarChart3} title={t.reports.noDebtors} />
            ) : data.topDebtors.map((d, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px', borderBottom: i < data.topDebtors.length - 1 ? `1px solid ${c.borderLight}` : 'none',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: c.textPrimary, margin: 0 }}>{d.name}</p>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>{d.daysOverdue} {t.reports.agingDaysUnit}</p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>{formatCurrency(d.outstanding)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FunnelTab({ data, c }: { data: ConversionReport; c: ReturnType<typeof useTheme>['c']; isMobile: boolean }) {
  const { t } = useLanguage();
  const FUNNEL_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC', '#059669', '#0EA5E9', '#10B981'];

  return (
    <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px 0' }}>{t.reports.funnelTitle}</h3>
      <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 20px 0' }}>Total: {data.total} {t.common.pilgrims}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.funnel.map((step, i) => {
          const widthPct = data.total > 0 ? Math.max(5, (step.count / data.total) * 100) : 5;
          return (
            <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: c.textMuted, width: '70px', flexShrink: 0, textAlign: 'right' }}>
                {step.label}
              </span>
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{
                  height: '36px',
                  width: `${widthPct}%`,
                  backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '12px',
                  transition: 'width 0.3s',
                  minWidth: '60px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
                    {step.count}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: c.textSecondary, width: '40px', flexShrink: 0 }}>
                {step.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
