'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Users, DollarSign, Plane, Package, CheckCircle, XCircle } from 'lucide-react';
import { DetailSkeleton } from '@/components/shared/loading-skeleton';
import { useLanguage } from '@/lib/i18n';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  success: '#16A34A',
  error: '#DC2626',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  active: { bg: '#DCFCE7', text: '#15803D' },
  expiring: { bg: '#FFEDD5', text: '#EA580C' },
  expired: { bg: '#FEE2E2', text: '#DC2626' },
  suspended: { bg: '#F1F5F9', text: '#64748B' },
};

interface AgencyDetail {
  id: string;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  ppiuNumber: string | null;
  ppiuStatus: string;
  isVerified: boolean;
  city: string | null;
  province: string | null;
  createdAt: string;
  totalRevenue: number;
  users: { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null }[];
  _count: { pilgrims: number; packages: number; trips: number };
}

export default function CCAgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [agency, setAgency] = useState<AgencyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/command-center/agencies/${id}`)
      .then(r => r.json())
      .then(setAgency)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (ppiuStatus: string) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/command-center/agencies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ppiuStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAgency(prev => prev ? { ...prev, ppiuStatus: updated.ppiuStatus } : null);
        setMessage(`Status diubah ke ${ppiuStatus}`);
      }
    } catch {
      setMessage(t.common.error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!agency) {
    return <p style={{ color: cc.error }}>{t.common.noData}</p>;
  }

  const status = statusColors[agency.ppiuStatus] || statusColors.pending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back */}
      <Link href="/command-center/agencies" style={{ color: cc.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> Kembali ke Daftar
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 style={{ width: '28px', height: '28px', color: cc.primary }} />
            {agency.name}
          </h1>
          <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px' }}>{agency.legalName}</p>
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', padding: '6px 14px', borderRadius: '8px', backgroundColor: status.bg, color: status.text, textTransform: 'capitalize' }}>
          {agency.ppiuStatus}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Jemaah', value: agency._count.pilgrims, icon: Users, color: '#3B82F6' },
          { label: 'Paket', value: agency._count.packages, icon: Package, color: '#10B981' },
          { label: 'Trips', value: agency._count.trips, icon: Plane, color: '#F59E0B' },
          { label: 'Revenue', value: `Rp ${(agency.totalRevenue / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: '#8B5CF6' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: '20px', height: '20px', color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: cc.textMuted, margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: cc.textPrimary, margin: '2px 0 0 0' }}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info + Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Agency Info */}
        <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>{t.commandCenter.agenciesTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Email', value: agency.email },
              { label: 'Telepon', value: agency.phone },
              { label: 'PPIU', value: agency.ppiuNumber || '-' },
              { label: 'Lokasi', value: [agency.city, agency.province].filter(Boolean).join(', ') || '-' },
              { label: 'Terdaftar', value: new Date(agency.createdAt).toLocaleDateString('id-ID') },
              { label: 'Terverifikasi', value: agency.isVerified ? 'Ya' : 'Belum' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${cc.borderLight}` }}>
                <span style={{ fontSize: '13px', color: cc.textMuted }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: cc.textPrimary }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>{t.common.actions}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => updateStatus('active')} disabled={actionLoading || agency.ppiuStatus === 'active'} style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: agency.ppiuStatus === 'active' ? 0.5 : 1 }}>
              <CheckCircle style={{ width: '16px', height: '16px' }} /> Approve (Active)
            </button>
            <button onClick={() => updateStatus('suspended')} disabled={actionLoading || agency.ppiuStatus === 'suspended'} style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: agency.ppiuStatus === 'suspended' ? 0.5 : 1 }}>
              <XCircle style={{ width: '16px', height: '16px' }} /> Suspend
            </button>
            <button onClick={() => updateStatus('pending')} disabled={actionLoading} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${cc.border}`, backgroundColor: 'transparent', color: cc.textMuted, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Reset ke Pending
            </button>
          </div>
          {message && <p style={{ fontSize: '13px', color: cc.primary, marginTop: '12px' }}>{message}</p>}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${cc.borderLight}` }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>
            Users ({agency.users.length})
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${cc.borderLight}` }}>
              {['Nama', 'Email', 'Role', 'Status', 'Last Login'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: cc.textMuted, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agency.users.map(user => (
              <tr key={user.id} style={{ borderBottom: `1px solid ${cc.borderLight}` }}>
                <td style={{ padding: '12px 16px', fontWeight: '500', color: cc.textPrimary }}>{user.name}</td>
                <td style={{ padding: '12px 16px', color: cc.textMuted }}>{user.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', textTransform: 'capitalize' }}>{user.role}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', backgroundColor: user.isActive ? '#DCFCE7' : '#FEE2E2', color: user.isActive ? '#15803D' : '#DC2626' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: cc.textMuted, fontSize: '12px' }}>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('id-ID') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
