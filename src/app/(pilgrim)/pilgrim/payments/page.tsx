'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';

const PILGRIM_GREEN = '#059669';

function formatCurrency(amount: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'DP (Uang Muka)': { bg: '#DBEAFE', text: '#2563EB' },
  dp: { bg: '#DBEAFE', text: '#2563EB' },
  full: { bg: '#F0FDF4', text: '#16A34A' },
  installment: { bg: '#FEF3C7', text: '#D97706' },
};

export default function PilgrimPaymentsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { data } = usePilgrim();

  if (!data) return null;

  const { payments, totalPackagePrice, totalPaid, remainingBalance } = data;
  const paymentPercentage = totalPackagePrice > 0 ? Math.round((totalPaid / totalPackagePrice) * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px 0' }}>
        Riwayat Pembayaran
      </h1>
      <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 20px 0' }}>
        Detail lengkap pembayaran paket umrah Anda.
      </p>

      {/* Progress bar card */}
      <div style={{
        backgroundColor: c.cardBg, border: '1px solid ' + c.border,
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>Progress Pembayaran</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: PILGRIM_GREEN }}>{paymentPercentage}%</span>
        </div>
        <div style={{ height: '12px', backgroundColor: c.borderLight, borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{
            height: '100%', width: `${paymentPercentage}%`,
            backgroundColor: PILGRIM_GREEN, borderRadius: '6px', transition: 'width 0.5s',
          }} />
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: c.pageBg, borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', color: c.textMuted, margin: '0 0 4px 0', fontWeight: 500 }}>Total Paket</p>
            <p style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
              {formatCurrency(totalPackagePrice)}
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', color: c.textMuted, margin: '0 0 4px 0', fontWeight: 500 }}>Sudah Bayar</p>
            <p style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 700, color: '#16A34A', margin: 0 }}>
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: remainingBalance > 0 ? '#FEF2F2' : '#F0FDF4', borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', color: c.textMuted, margin: '0 0 4px 0', fontWeight: 500 }}>Sisa</p>
            <p style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 700, color: remainingBalance > 0 ? '#DC2626' : '#16A34A', margin: 0 }}>
              {formatCurrency(remainingBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment timeline */}
      <div style={{
        backgroundColor: c.cardBg, border: '1px solid ' + c.border,
        borderRadius: '16px', padding: '20px',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
          Riwayat Transaksi
        </h2>

        {payments.length === 0 ? (
          <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '24px 0' }}>
            Belum ada riwayat pembayaran.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {payments.map((pay, i) => {
              const typeColor = TYPE_COLORS[pay.type] || TYPE_COLORS[pay.type.toLowerCase()] || { bg: '#F3F4F6', text: '#6B7280' };
              return (
                <div key={pay.id} style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}>
                  {/* Timeline dot + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: PILGRIM_GREEN, marginTop: '4px', flexShrink: 0,
                    }} />
                    {i < payments.length - 1 && (
                      <div style={{ width: '2px', flex: 1, backgroundColor: c.borderLight, minHeight: '40px' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{
                    flex: 1, paddingBottom: i < payments.length - 1 ? '16px' : '0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: '8px',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 600,
                          padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: typeColor.bg, color: typeColor.text,
                        }}>
                          {pay.type}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 2px 0' }}>
                        {formatDate(pay.date)}
                      </p>
                      <p style={{ fontSize: '12px', color: c.textLight, margin: 0 }}>
                        {pay.method}
                      </p>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#16A34A' }}>
                      {formatCurrency(pay.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
