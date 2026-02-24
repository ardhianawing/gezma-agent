'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/lib/theme';

interface RevenueChartProps {
  data: { month: string; amount: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

function formatMonth(ym: string) {
  const [, m] = ym.split('-');
  return MONTHS[parseInt(m) - 1] || ym;
}

function formatAmount(val: number) {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
  return String(val);
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { c } = useTheme();

  return (
    <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
        Tren Pemasukan (12 Bulan)
      </h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.borderLight} />
            <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11, fill: c.textMuted }} />
            <YAxis tickFormatter={formatAmount} tick={{ fontSize: 11, fill: c.textMuted }} width={50} />
            <Tooltip
              formatter={(value: unknown) => ['Rp ' + new Intl.NumberFormat('id-ID').format(Number(value)), 'Pemasukan']}
              labelFormatter={(label: unknown) => formatMonth(String(label))}
              contentStyle={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '13px' }}
            />
            <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
