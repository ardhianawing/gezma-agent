'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/lib/theme';

interface TripCapacityChartProps {
  data: { name: string; capacity: number; registered: number }[];
}

export function TripCapacityChart({ data }: TripCapacityChartProps) {
  const { c } = useTheme();

  if (data.length === 0) {
    return (
      <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
          Kapasitas Trip
        </h3>
        <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '40px 0' }}>Belum ada trip aktif</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
        Kapasitas Trip
      </h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.borderLight} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: c.textMuted }} />
            <YAxis tick={{ fontSize: 11, fill: c.textMuted }} width={40} />
            <Tooltip
              contentStyle={{ backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="capacity" name="Kapasitas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="registered" name="Terdaftar" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
