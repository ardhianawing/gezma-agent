'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';

interface FinancialReport {
  totalRevenue: number;
  totalOutstanding: number;
  totalPilgrims: number;
  paidPilgrims: number;
  methodBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  tripRevenue: { name: string; revenue: number; outstanding: number; pilgrimCount: number }[];
  monthlyRevenue: { month: string; amount: number }[];
}

const methodLabels: Record<string, string> = { transfer: 'Transfer', cash: 'Cash', card: 'Kartu' };
const typeLabels: Record<string, string> = { dp: 'DP', installment: 'Cicilan', full: 'Lunas', refund: 'Refund' };

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export default function ReportsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [data, setData] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/financial')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '24px', width: '200px', borderRadius: '8px', backgroundColor: c.cardBgHover, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '100px', borderRadius: '12px', backgroundColor: c.cardBgHover, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const collectionRate = data.totalPilgrims > 0 ? Math.round((data.paidPilgrims / data.totalPilgrims) * 100) : 0;

  const stats = [
    { label: 'Total Pemasukan', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: c.success, bg: c.successLight },
    { label: 'Outstanding', value: formatCurrency(data.totalOutstanding), icon: AlertCircle, color: c.error, bg: c.errorLight },
    { label: 'Jemaah Lunas', value: `${data.paidPilgrims}/${data.totalPilgrims}`, icon: Users, color: c.info, bg: c.infoLight },
    { label: 'Collection Rate', value: `${collectionRate}%`, icon: TrendingUp, color: '#7C3AED', bg: '#F3E8FF' },
  ];

  const maxMonthly = Math.max(...data.monthlyRevenue.map((m) => m.amount), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader title="Laporan Keuangan" description="Ringkasan pemasukan, outstanding, dan breakdown pembayaran" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              style={{
                backgroundColor: c.cardBg,
                borderRadius: '12px',
                border: `1px solid ${c.border}`,
                padding: isMobile ? '16px' : '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '20px', height: '20px', color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0 0 0' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
        {/* Revenue per Trip */}
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Pemasukan per Trip</h3>
          </div>
          <div>
            {data.tripRevenue.length === 0 ? (
              <p style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: c.textMuted }}>Belum ada data</p>
            ) : (
              data.tripRevenue.map((trip, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '4px' : '16px',
                    padding: isMobile ? '12px 16px' : '14px 20px',
                    borderBottom: i < data.tripRevenue.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>{trip.name}</p>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>{trip.pilgrimCount} jemaah</p>
                  </div>
                  <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: c.success, margin: 0 }}>{formatCurrency(trip.revenue)}</p>
                    {trip.outstanding > 0 && (
                      <p style={{ fontSize: '12px', color: c.error, margin: '2px 0 0 0' }}>Sisa: {formatCurrency(trip.outstanding)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Method Breakdown */}
          <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
            <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Per Metode Bayar</h3>
            </div>
            <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(data.methodBreakdown).map(([method, amount]) => {
                const total = Object.values(data.methodBreakdown).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                return (
                  <div key={method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: c.textSecondary }}>{methodLabels[method] || method}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{formatCurrency(amount)}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: c.cardBgHover, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: c.info, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(data.methodBreakdown).length === 0 && (
                <p style={{ fontSize: '13px', color: c.textMuted, textAlign: 'center' }}>Belum ada data</p>
              )}
            </div>
          </div>

          {/* Type Breakdown */}
          <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
            <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Per Tipe Pembayaran</h3>
            </div>
            <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(data.typeBreakdown).map(([type, amount]) => {
                const total = Object.values(data.typeBreakdown).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: c.textSecondary }}>{typeLabels[type] || type}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{formatCurrency(amount)}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: c.cardBgHover, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: c.success, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(data.typeBreakdown).length === 0 && (
                <p style={{ fontSize: '13px', color: c.textMuted, textAlign: 'center' }}>Belum ada data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue */}
      {data.monthlyRevenue.length > 0 && (
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Pemasukan Bulanan</h3>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.monthlyRevenue.map((m) => (
              <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: c.textMuted, width: '80px', flexShrink: 0 }}>{formatMonth(m.month)}</span>
                <div style={{ flex: 1, height: '24px', backgroundColor: c.cardBgHover, borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(m.amount / maxMonthly) * 100}%`,
                      background: `linear-gradient(90deg, ${c.info}, ${c.info}88)`,
                      borderRadius: '6px',
                      minWidth: '2px',
                    }}
                  />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary, width: '120px', textAlign: 'right', flexShrink: 0 }}>
                  {formatCurrency(m.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
