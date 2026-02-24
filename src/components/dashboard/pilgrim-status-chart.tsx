'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/lib/theme';

interface PilgrimStatusChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  lead: '#94A3B8',
  dp: '#3B82F6',
  lunas: '#10B981',
  dokumen: '#F59E0B',
  visa: '#8B5CF6',
  ready: '#059669',
  departed: '#0EA5E9',
  completed: '#6366F1',
};

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  dp: 'DP',
  lunas: 'Lunas',
  dokumen: 'Dokumen',
  visa: 'Visa',
  ready: 'Ready',
  departed: 'Departed',
  completed: 'Completed',
};

export function PilgrimStatusChart({ data }: PilgrimStatusChartProps) {
  const { c } = useTheme();

  const chartData = data.map(d => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] || '#94A3B8',
  }));

  if (chartData.length === 0) {
    return (
      <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
          Distribusi Status Jemaah
        </h3>
        <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '40px 0' }}>Belum ada data</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
        Distribusi Status Jemaah
      </h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '13px' }}
              formatter={(value: unknown, name: unknown) => [Number(value) + ' jemaah', String(name)]}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value: string) => <span style={{ color: c.textSecondary }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
