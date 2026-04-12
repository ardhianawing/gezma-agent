'use client';

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Eye, ShieldCheck, ShieldOff } from 'lucide-react';

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

type CertStatus = 'issued' | 'verified' | 'revoked';
type FilterTab = 'semua' | 'issued' | 'verified' | 'revoked';

interface Certificate {
  id: string;
  certNo: string;
  pilgrimName: string;
  agency: string;
  trip: string;
  issuedDate: string;
  status: CertStatus;
}

const STATUS_COLORS: Record<CertStatus, { bg: string; text: string; label: string }> = {
  issued:   { bg: '#DBEAFE', text: '#1D4ED8', label: 'Issued' },
  verified: { bg: '#DCFCE7', text: '#15803D', label: 'Verified' },
  revoked:  { bg: '#FEE2E2', text: '#DC2626', label: 'Revoked' },
};

const MOCK_CERTS: Certificate[] = [
  {
    id: '1',
    certNo: 'CERT-2026-00142',
    pilgrimName: 'Budi Santoso',
    agency: 'PT Nur Ilahi Tour',
    trip: 'Umrah Reguler Ramadan 2026',
    issuedDate: '2026-04-10',
    status: 'verified',
  },
  {
    id: '2',
    certNo: 'CERT-2026-00138',
    pilgrimName: 'Siti Rahayu',
    agency: 'Arminareka Perdana',
    trip: 'Paket VIP Platinum Makkah',
    issuedDate: '2026-04-10',
    status: 'issued',
  },
  {
    id: '3',
    certNo: 'CERT-2026-00131',
    pilgrimName: 'Ahmad Fauzi',
    agency: 'Al-Barokah Travel',
    trip: 'Umrah Ekonomi Syawal 2026',
    issuedDate: '2026-04-09',
    status: 'verified',
  },
  {
    id: '4',
    certNo: 'CERT-2026-00129',
    pilgrimName: 'Nurul Hidayah',
    agency: 'Fazam Tour & Travel',
    trip: 'Paket Seasonal Dzulhijjah',
    issuedDate: '2026-04-09',
    status: 'issued',
  },
  {
    id: '5',
    certNo: 'CERT-2026-00117',
    pilgrimName: 'Hendra Wijaya',
    agency: 'Khalifa Wisata',
    trip: 'Umrah VIP Gold Madinah First',
    issuedDate: '2026-04-08',
    status: 'verified',
  },
  {
    id: '6',
    certNo: 'CERT-2026-00105',
    pilgrimName: 'Dewi Kusuma',
    agency: 'Baitussalam Tour',
    trip: 'Paket Reguler Muharram',
    issuedDate: '2026-04-07',
    status: 'revoked',
  },
  {
    id: '7',
    certNo: 'CERT-2026-00098',
    pilgrimName: 'Rizky Pratama',
    agency: 'Safari Suci Tour',
    trip: 'Umrah Reguler Business Class',
    issuedDate: '2026-04-06',
    status: 'issued',
  },
  {
    id: '8',
    certNo: 'CERT-2026-00087',
    pilgrimName: 'Aisyah Putri',
    agency: 'Rabani Travel',
    trip: 'Paket Seasonal Akhir Tahun 2026',
    issuedDate: '2026-04-05',
    status: 'verified',
  },
  {
    id: '9',
    certNo: 'CERT-2026-00074',
    pilgrimName: 'Sugiyono',
    agency: 'PT Mina Wisata Islami',
    trip: 'Umrah Ekonomi Budget Plus',
    issuedDate: '2026-04-04',
    status: 'revoked',
  },
  {
    id: '10',
    certNo: 'CERT-2026-00063',
    pilgrimName: 'Lestari Wulandari',
    agency: 'Duta Wisata Haji',
    trip: 'Paket VIP Family Suite',
    issuedDate: '2026-04-03',
    status: 'issued',
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CCBlockchainPage() {
  const [certs, setCerts] = useState<Certificate[]>(MOCK_CERTS);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [actionConfirm, setActionConfirm] = useState<{ id: string; type: 'verify' | 'revoke' } | null>(null);

  const stats = {
    totalIssued: certs.length,
    verifiedToday: certs.filter(c => c.status === 'verified' && c.issuedDate === '2026-04-10').length,
    revoked: certs.filter(c => c.status === 'revoked').length,
    pending: certs.filter(c => c.status === 'issued').length,
  };

  const filtered = certs.filter(c => {
    if (activeTab === 'semua') return true;
    return c.status === activeTab;
  });

  const handleAction = (id: string, type: 'verify' | 'revoke') => {
    setCerts(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: type === 'verify' ? 'verified' : 'revoked' };
    }));
    setActionConfirm(null);
  };

  const statCards = [
    { label: 'Total Issued', value: stats.totalIssued, icon: Shield, color: '#2563EB' },
    { label: 'Verified Today', value: stats.verifiedToday, icon: CheckCircle, color: '#10B981' },
    { label: 'Revoked', value: stats.revoked, icon: XCircle, color: '#EF4444' },
    { label: 'Pending Verification', value: stats.pending, icon: Clock, color: '#F59E0B' },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'issued', label: 'Issued' },
    { key: 'verified', label: 'Verified' },
    { key: 'revoked', label: 'Revoked' },
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
            <Shield style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Certificate Administration
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Kelola dan verifikasi sertifikat blockchain jemaah umrah di ekosistem GEZMA.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
                gap: '16px',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '24px', height: '24px', color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: cc.textMuted, margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: cc.textPrimary, margin: '4px 0 0 0' }}>
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
        <div style={{
          display: 'flex',
          gap: '0',
          borderBottom: `1px solid ${cc.border}`,
          paddingLeft: '20px',
        }}>
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
                {tab.key === 'issued' && stats.pending > 0 && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}>
                    {stats.pending}
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
                {[
                  'No. Sertifikat', 'Nama Jemaah', 'Agensi', 'Trip', 'Tanggal Terbit', 'Status', 'Aksi',
                ].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
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
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>
                    Tidak ada sertifikat ditemukan.
                  </td>
                </tr>
              ) : filtered.map((cert, i) => {
                const statusCfg = STATUS_COLORS[cert.status];
                const isConfirming = actionConfirm?.id === cert.id;

                return (
                  <tr
                    key={cert.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    {/* Cert No */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: cc.primary,
                        margin: 0,
                        fontFamily: 'monospace',
                        letterSpacing: '0.03em',
                      }}>
                        {cert.certNo}
                      </p>
                    </td>

                    {/* Pilgrim Name */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0 }}>
                        {cert.pilgrimName}
                      </p>
                    </td>

                    {/* Agency */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textSecondary, margin: 0, fontWeight: 500 }}>
                        {cert.agency}
                      </p>
                    </td>

                    {/* Trip */}
                    <td style={{ padding: '14px 16px', maxWidth: '220px' }}>
                      <p style={{
                        fontSize: '13px',
                        color: cc.textMuted,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {cert.trip}
                      </p>
                    </td>

                    {/* Issued Date */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(cert.issuedDate)}
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

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {/* View */}
                        <button
                          title="Lihat Sertifikat"
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
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>

                        {/* Verify / Revoke confirm */}
                        {isConfirming ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleAction(cert.id, actionConfirm.type)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: actionConfirm.type === 'verify' ? '#10B981' : '#DC2626',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {actionConfirm.type === 'verify' ? 'Ya, Verify' : 'Ya, Revoke'}
                            </button>
                            <button
                              onClick={() => setActionConfirm(null)}
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
                          <>
                            {/* Verify button — only for issued */}
                            {cert.status === 'issued' && (
                              <button
                                title="Verifikasi"
                                onClick={() => setActionConfirm({ id: cert.id, type: 'verify' })}
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  border: '1px solid #BBF7D0',
                                  backgroundColor: '#F0FDF4',
                                  color: '#15803D',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                <ShieldCheck style={{ width: '14px', height: '14px' }} />
                              </button>
                            )}

                            {/* Revoke button — only for issued or verified */}
                            {cert.status !== 'revoked' && (
                              <button
                                title="Cabut Sertifikat"
                                onClick={() => setActionConfirm({ id: cert.id, type: 'revoke' })}
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  border: '1px solid #FECACA',
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                <ShieldOff style={{ width: '14px', height: '14px' }} />
                              </button>
                            )}
                          </>
                        )}
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
            Menampilkan {filtered.length} dari {certs.length} sertifikat
          </p>
        </div>
      </div>
    </div>
  );
}
