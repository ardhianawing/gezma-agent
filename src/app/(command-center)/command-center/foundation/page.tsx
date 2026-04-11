'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, TrendingUp, Users, Package, Building2, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

const cc = {
  primary: '#DC2626',
  blue: '#2563EB',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  inputBg: '#F8FAFC',
};

interface FoundationStats {
  activeCampaigns: number;
  totalRaised: number;
  totalDonors: number;
  goodsAvailable: number;
  activeFinancings: number;
  peopleImpacted: number;
}

interface FinancingItem {
  id: string;
  amount: number;
  purpose: string;
  tenorMonths: number;
  monthlyAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
  agency: { name: string; email: string };
}

interface CampaignItem {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  createdAt: string;
  agency: { name: string } | null;
  _count: { donations: number };
}

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  approved: { bg: '#DCFCE7', text: '#15803D' },
  rejected: { bg: '#FEE2E2', text: '#DC2626' },
  active: { bg: '#DBEAFE', text: '#1D4ED8' },
  completed: { bg: '#F1F5F9', text: '#64748B' },
  cancelled: { bg: '#F1F5F9', text: '#64748B' },
};

type ActiveTab = 'overview' | 'financing' | 'campaigns';

export default function CCFoundationPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [stats, setStats] = useState<FoundationStats | null>(null);
  const [financings, setFinancings] = useState<FinancingItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFinancings, setLoadingFinancings] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [searchFinancing, setSearchFinancing] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/foundation/stats')
      .then(r => r.json())
      .then(data => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  const fetchFinancings = useCallback(async () => {
    setLoadingFinancings(true);
    try {
      // CC can see all financings via this endpoint; for now use agency-scoped
      const params = new URLSearchParams({ limit: '50' });
      const res = await fetch(`/api/foundation/financing?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFinancings(data.financings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFinancings(false);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const params = new URLSearchParams({ limit: '50', status: 'all' });
      const res = await fetch(`/api/foundation/campaigns?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'financing') fetchFinancings();
    if (activeTab === 'campaigns') fetchCampaigns();
  }, [activeTab, fetchFinancings, fetchCampaigns]);

  const handleFinancingAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/foundation/financing/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: actionNote[id] || '' }),
      });
      if (res.ok) {
        setSuccessMsg(`Pengajuan berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchFinancings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFinancings = financings.filter(f => {
    const matchSearch = f.agency?.name?.toLowerCase().includes(searchFinancing.toLowerCase()) ||
      f.purpose.toLowerCase().includes(searchFinancing.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'financing', label: 'Approval Pendanaan' },
    { key: 'campaigns', label: 'Kelola Kampanye' },
  ];

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid ' + cc.border,
    backgroundColor: cc.inputBg,
    color: cc.textPrimary,
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: cc.pageBg, padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DC262618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart style={{ width: '20px', height: '20px', color: '#DC2626' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
            Gezma Foundation — Command Center
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, margin: 0 }}>
          Kelola kampanye donasi, approval pendanaan, dan pantau dampak sosial
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>
          {'\u{2705}'} {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid ' + cc.border, paddingBottom: '0' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderBottom: isActive ? '2px solid ' + cc.primary : '2px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? cc.primary : cc.textMuted,
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { icon: TrendingUp, label: 'Total Dana Terkumpul', value: stats ? formatRupiah(stats.totalRaised) : '-', color: '#DC2626' },
              { icon: Heart, label: 'Kampanye Aktif', value: stats ? String(stats.activeCampaigns) : '-', color: '#DC2626' },
              { icon: Users, label: 'Total Donatur', value: stats ? stats.totalDonors.toLocaleString() : '-', color: '#2563EB' },
              { icon: Package, label: 'Barang Tersedia', value: stats ? String(stats.goodsAvailable) : '-', color: '#D97706' },
              { icon: Building2, label: 'Pendanaan Aktif', value: stats ? String(stats.activeFinancings) : '-', color: '#7C3AED' },
              { icon: Users, label: 'Orang Dibantu', value: stats ? stats.peopleImpacted.toLocaleString() : '-', color: '#16A34A' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: cc.cardBg,
                    border: '1px solid ' + cc.border,
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: stat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: cc.textMuted, margin: '0 0 2px', fontWeight: 500 }}>{stat.label}</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
                      {loadingStats ? '...' : stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FINANCING APPROVAL TAB */}
      {activeTab === 'financing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: cc.textMuted }} />
              <input
                type="text"
                placeholder="Cari agensi atau tujuan..."
                value={searchFinancing}
                onChange={(e) => setSearchFinancing(e.target.value)}
                style={{ ...inputStyle, width: '100%', paddingLeft: '32px', boxSizing: 'border-box' as const, minHeight: '40px' }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, minHeight: '40px', cursor: 'pointer' }}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            {filteredFinancings.length} pengajuan
          </p>

          {loadingFinancings ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: cc.cardBg, borderRadius: '12px', border: '1px solid ' + cc.border }}>
              <p style={{ color: cc.textMuted }}>Memuat data...</p>
            </div>
          ) : filteredFinancings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: cc.cardBg, borderRadius: '12px', border: '1px solid ' + cc.border }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\u{1F3E6}'}</div>
              <p style={{ color: cc.textMuted }}>Tidak ada pengajuan pendanaan</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredFinancings.map((item) => {
                const statusCfg = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
                const isPending = item.status === 'pending';
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: cc.cardBg,
                      border: '1px solid ' + cc.border,
                      borderRadius: '12px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: cc.textPrimary }}>
                            {formatRupiah(item.amount)}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: statusCfg.text, backgroundColor: statusCfg.bg, padding: '2px 8px', borderRadius: '6px' }}>
                            {item.status === 'pending' ? 'Menunggu' : item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : item.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textSecondary, margin: '0 0 4px' }}>
                          {item.agency?.name || '-'}
                        </p>
                        <p style={{ fontSize: '13px', color: cc.textMuted, margin: '0 0 4px' }}>
                          {item.purpose}
                        </p>
                        <p style={{ fontSize: '12px', color: cc.textMuted, margin: 0 }}>
                          {item.tenorMonths} bulan · {formatRupiah(item.monthlyAmount)}/bulan · {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    {isPending && (
                      <div style={{ borderTop: '1px solid ' + cc.borderLight, paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: cc.textMuted, marginBottom: '4px' }}>
                            Catatan (opsional)
                          </label>
                          <input
                            type="text"
                            placeholder="Catatan untuk agensi..."
                            value={actionNote[item.id] || ''}
                            onChange={(e) => setActionNote({ ...actionNote, [item.id]: e.target.value })}
                            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' as const }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleFinancingAction(item.id, 'approve')}
                            disabled={actionLoading === item.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '8px 20px', borderRadius: '8px', border: 'none',
                              backgroundColor: actionLoading === item.id ? cc.border : '#16A34A',
                              color: '#fff', fontSize: '13px', fontWeight: 600,
                              cursor: actionLoading === item.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <CheckCircle style={{ width: '14px', height: '14px' }} />
                            Setujui
                          </button>
                          <button
                            onClick={() => handleFinancingAction(item.id, 'reject')}
                            disabled={actionLoading === item.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '8px 20px', borderRadius: '8px', border: '1px solid #FECACA',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626', fontSize: '13px', fontWeight: 600,
                              cursor: actionLoading === item.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <XCircle style={{ width: '14px', height: '14px' }} />
                            Tolak
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Pantau semua kampanye donasi yang dibuat oleh agensi
          </p>

          {loadingCampaigns ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: cc.cardBg, borderRadius: '12px', border: '1px solid ' + cc.border }}>
              <p style={{ color: cc.textMuted }}>Memuat data...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', backgroundColor: cc.cardBg, borderRadius: '12px', border: '1px solid ' + cc.border }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: cc.cardBgHover, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '32px' }}>{'\u{1F91D}'}</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 4px 0' }}>Belum ada kampanye</h3>
              <p style={{ fontSize: '14px', color: cc.textMuted, margin: 0, maxWidth: '320px' }}>Kampanye penggalangan dana akan muncul di sini setelah dibuat.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: cc.cardBg, border: '1px solid ' + cc.border, borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: cc.borderLight }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase' }}>Kampanye</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase' }}>Agensi</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase' }}>Target</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase' }}>Terkumpul</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase' }}>Donatur</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => {
                    const statusCfg = STATUS_COLORS[c.status] || STATUS_COLORS.active;
                    const pct = Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100));
                    return (
                      <tr key={c.id} style={{ borderTop: '1px solid ' + cc.borderLight, backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg }}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: '0 0 2px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.title}
                          </p>
                          <span style={{ fontSize: '11px', color: '#DC2626', backgroundColor: '#DC262618', padding: '1px 6px', borderRadius: '4px' }}>
                            {c.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textSecondary }}>
                          {c.agency?.name || 'Platform'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: cc.textMuted }}>
                          {formatRupiah(c.targetAmount)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', margin: '0 0 4px' }}>
                            {formatRupiah(c.currentAmount)}
                          </p>
                          <div style={{ width: '80px', height: '4px', borderRadius: '2px', backgroundColor: cc.borderLight, marginLeft: 'auto', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#DC2626', borderRadius: '2px' }} />
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: cc.textMuted }}>
                          {c._count.donations}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: statusCfg.text, backgroundColor: statusCfg.bg, padding: '3px 10px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                            {c.status === 'active' ? 'Aktif' : c.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
