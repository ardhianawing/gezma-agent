'use client';

import { useState, useMemo } from 'react';
import { Users, CheckCircle2, Clock, FileWarning, Building2, Search, AlertTriangle } from 'lucide-react';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  inputBg: '#F8FAFC',
};

type PilgrimStatus = 'active' | 'completed' | 'pending' | 'flagged';

interface Pilgrim {
  id: string;
  name: string;
  nik: string;
  agency: string;
  package: string;
  status: PilgrimStatus;
  docsComplete: number;
  docsTotal: number;
  phone: string;
  registeredDate: string;
}

const MOCK_PILGRIMS: Pilgrim[] = [
  { id: '1', name: 'Ahmad Fauzi Harahap', nik: '3174051203850001', agency: 'PT Al-Mabrur Travel', package: 'Paket Reguler 2026', status: 'active', docsComplete: 8, docsTotal: 10, phone: '081234567890', registeredDate: '2025-11-03' },
  { id: '2', name: 'Siti Nurhaliza Ramdhani', nik: '3275046507900002', agency: 'PT Armina Reza', package: 'Paket Plus 2026', status: 'active', docsComplete: 10, docsTotal: 10, phone: '082345678901', registeredDate: '2025-10-18' },
  { id: '3', name: 'Muhammad Rizki Santoso', nik: '3578021108880003', agency: 'CV Baitullah Tours', package: 'Paket Reguler 2026', status: 'pending', docsComplete: 4, docsTotal: 10, phone: '083456789012', registeredDate: '2025-12-01' },
  { id: '4', name: 'Dewi Rahmawati Kusuma', nik: '3374096209870004', agency: 'PT Al-Mabrur Travel', package: 'Paket VIP 2026', status: 'completed', docsComplete: 10, docsTotal: 10, phone: '084567890123', registeredDate: '2025-09-15' },
  { id: '5', name: 'Hendra Wijaya Saputra', nik: '3201071505760005', agency: 'PT Pandu Persada Wisata', package: 'Paket Reguler 2026', status: 'flagged', docsComplete: 6, docsTotal: 10, phone: '085678901234', registeredDate: '2025-11-20' },
  { id: '6', name: 'Nurul Fadilah Nasution', nik: '1271046812910006', agency: 'PT Armina Reza', package: 'Paket Reguler 2026', status: 'active', docsComplete: 9, docsTotal: 10, phone: '086789012345', registeredDate: '2025-10-05' },
  { id: '7', name: 'Budi Santoso Wardoyo', nik: '3578031203850007', agency: 'CV Baitullah Tours', package: 'Paket Plus 2026', status: 'pending', docsComplete: 2, docsTotal: 10, phone: '087890123456', registeredDate: '2025-12-10' },
  { id: '8', name: 'Fatimah Zahra Lubis', nik: '1271014507930008', agency: 'PT Al-Hijaz Mulia', package: 'Paket VIP 2026', status: 'completed', docsComplete: 10, docsTotal: 10, phone: '088901234567', registeredDate: '2025-08-22' },
  { id: '9', name: 'Agus Setiawan Prasetyo', nik: '3374090908800009', agency: 'PT Pandu Persada Wisata', package: 'Paket Reguler 2026', status: 'active', docsComplete: 7, docsTotal: 10, phone: '089012345678', registeredDate: '2025-11-11' },
  { id: '10', name: 'Rina Marlina Effendi', nik: '3201074510860010', agency: 'PT Al-Hijaz Mulia', package: 'Paket Plus 2026', status: 'flagged', docsComplete: 5, docsTotal: 10, phone: '081123456789', registeredDate: '2025-10-30' },
  { id: '11', name: 'Dodi Firmansyah Kosasih', nik: '3275040106820011', agency: 'CV Baitullah Tours', package: 'Paket Reguler 2026', status: 'active', docsComplete: 10, docsTotal: 10, phone: '082234567890', registeredDate: '2025-09-28' },
  { id: '12', name: 'Yeni Suryani Pangesti', nik: '3374062808950012', agency: 'PT Al-Mabrur Travel', package: 'Paket Reguler 2026', status: 'pending', docsComplete: 3, docsTotal: 10, phone: '083345678901', registeredDate: '2025-12-05' },
  { id: '13', name: 'Irfan Hakim Maulana', nik: '3578050709890013', agency: 'PT Armina Reza', package: 'Paket VIP 2026', status: 'completed', docsComplete: 10, docsTotal: 10, phone: '084456789012', registeredDate: '2025-08-10' },
  { id: '14', name: 'Sari Dewi Anggraini', nik: '1271043004920014', agency: 'PT Pandu Persada Wisata', package: 'Paket Plus 2026', status: 'active', docsComplete: 8, docsTotal: 10, phone: '085567890123', registeredDate: '2025-11-07' },
];

const MOCK_DUPLICATES = [
  {
    nik: '3578021108880003',
    entries: [
      { name: 'Muhammad Rizki Santoso', agency: 'CV Baitullah Tours', registeredDate: '2025-12-01' },
      { name: 'M. Rizki Santoso', agency: 'PT Al-Mabrur Travel', registeredDate: '2025-11-25' },
    ],
  },
  {
    nik: '1271046812910006',
    entries: [
      { name: 'Nurul Fadilah Nasution', agency: 'PT Armina Reza', registeredDate: '2025-10-05' },
      { name: 'Nurul F. Nasution', agency: 'PT Al-Hijaz Mulia', registeredDate: '2025-09-30' },
    ],
  },
  {
    nik: '3374090908800009',
    entries: [
      { name: 'Agus Setiawan Prasetyo', agency: 'PT Pandu Persada Wisata', registeredDate: '2025-11-11' },
      { name: 'Agus S. Prasetyo', agency: 'CV Baitullah Tours', registeredDate: '2025-11-08' },
    ],
  },
];

const STATUS_CONFIG: Record<PilgrimStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Aktif', bg: '#DCFCE7', text: '#15803D' },
  completed: { label: 'Selesai', bg: '#DBEAFE', text: '#1D4ED8' },
  pending: { label: 'Pending', bg: '#FEF3C7', text: '#D97706' },
  flagged: { label: 'Flagged', bg: '#FEE2E2', text: '#DC2626' },
};

type FilterTab = 'all' | PilgrimStatus;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CCPilgrimsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const agencies = useMemo(() => [...new Set(MOCK_PILGRIMS.map(p => p.agency))], []);

  const stats = useMemo(() => ({
    total: MOCK_PILGRIMS.length,
    active: MOCK_PILGRIMS.filter(p => p.status === 'active').length,
    completed: MOCK_PILGRIMS.filter(p => p.status === 'completed').length,
    pending: MOCK_PILGRIMS.filter(p => p.status === 'pending').length,
    flagged: MOCK_PILGRIMS.filter(p => p.status === 'flagged').length,
    agencies: agencies.length,
  }), [agencies]);

  const filtered = useMemo(() => {
    return MOCK_PILGRIMS.filter(p => {
      const matchTab = activeTab === 'all' || p.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.nik.includes(q);
      return matchTab && matchSearch;
    });
  }, [search, activeTab]);

  const statCards = [
    { label: 'Total Jamaah', value: stats.total, icon: Users, color: '#2563EB' },
    { label: 'Aktif', value: stats.active, icon: CheckCircle2, color: '#15803D' },
    { label: 'Selesai', value: stats.completed, icon: CheckCircle2, color: '#1D4ED8' },
    { label: 'Dokumen Pending', value: stats.pending, icon: FileWarning, color: '#D97706' },
    { label: 'Jumlah Agensi', value: stats.agencies, icon: Building2, color: '#8B5CF6' },
  ];

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Semua', count: stats.total },
    { key: 'active', label: 'Aktif', count: stats.active },
    { key: 'completed', label: 'Selesai', count: stats.completed },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'flagged', label: 'Flagged', count: stats.flagged },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
          Pilgrims Overview
        </h1>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px' }}>
          Pantau seluruh data jamaah dari semua agensi dalam ekosistem GEZMA.
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
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: `${card.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '22px', height: '22px', color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0, fontWeight: 500 }}>{card.label}</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: cc.textPrimary, margin: '2px 0 0 0' }}>
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter Tabs */}
      <div
        style={{
          backgroundColor: cc.cardBg,
          borderRadius: '12px',
          border: `1px solid ${cc.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Search bar */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${cc.borderLight}` }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: cc.textMuted,
              }}
            />
            <input
              type="text"
              placeholder="Cari nama atau NIK jamaah..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: `1px solid ${cc.border}`,
                backgroundColor: cc.inputBg,
                color: cc.textPrimary,
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            borderBottom: `1px solid ${cc.border}`,
            paddingLeft: '20px',
          }}
        >
          {filterTabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${cc.primary}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? cc.primary : cc.textMuted,
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: isActive ? '#EFF6FF' : cc.borderLight,
                    color: isActive ? cc.primary : cc.textMuted,
                    padding: '1px 7px',
                    borderRadius: '10px',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: cc.pageBg }}>
                {['Nama', 'NIK', 'Agensi', 'Paket', 'Status', 'Dokumen', 'No. HP', 'Tgl Daftar'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: cc.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      borderBottom: `1px solid ${cc.borderLight}`,
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
                  <td
                    colSpan={8}
                    style={{
                      padding: '48px 16px',
                      textAlign: 'center',
                      color: cc.textMuted,
                      fontSize: '14px',
                    }}
                  >
                    Tidak ada data jamaah yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((pilgrim, i) => {
                  const statusCfg = STATUS_CONFIG[pilgrim.status];
                  const docsOk = pilgrim.docsComplete === pilgrim.docsTotal;
                  return (
                    <tr
                      key={pilgrim.id}
                      style={{
                        backgroundColor: i % 2 === 0 ? '#FFFFFF' : cc.pageBg,
                        borderBottom: `1px solid ${cc.borderLight}`,
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: cc.textPrimary,
                            margin: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {pilgrim.name}
                        </p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            color: cc.textMuted,
                            fontFamily: 'monospace',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {pilgrim.nik}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textSecondary, whiteSpace: 'nowrap' }}>
                        {pilgrim.agency}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                        {pilgrim.package}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.text,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '5px',
                              borderRadius: '3px',
                              backgroundColor: cc.borderLight,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${(pilgrim.docsComplete / pilgrim.docsTotal) * 100}%`,
                                backgroundColor: docsOk ? '#15803D' : '#D97706',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '12px',
                              color: docsOk ? '#15803D' : '#D97706',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {pilgrim.docsComplete}/{pilgrim.docsTotal}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                        {pilgrim.phone}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                        {formatDate(pilgrim.registeredDate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${cc.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Menampilkan {filtered.length} dari {MOCK_PILGRIMS.length} jamaah
          </p>
          <p style={{ fontSize: '12px', color: cc.textMuted, margin: 0 }}>
            Data mock — integrasi API segera hadir
          </p>
        </div>
      </div>

      {/* Duplicate Detection Section */}
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid #FED7AA',
          backgroundColor: '#FFFBEB',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid #FED7AA',
          }}
        >
          <AlertTriangle style={{ width: '22px', height: '22px', color: '#EA580C', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>
              Deteksi Duplikat NIK — {MOCK_DUPLICATES.length} potensi duplikat ditemukan
            </p>
            <p style={{ fontSize: '13px', color: cc.textMuted, margin: '2px 0 0 0' }}>
              NIK yang sama terdeteksi terdaftar di lebih dari satu agensi. Harap segera verifikasi.
            </p>
          </div>
        </div>

        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {MOCK_DUPLICATES.map(dup => (
            <div
              key={dup.nik}
              style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FDBA74',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertTriangle style={{ width: '15px', height: '15px', color: '#EA580C', flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#EA580C',
                    fontFamily: 'monospace',
                    letterSpacing: '0.04em',
                  }}
                >
                  NIK: {dup.nik}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dup.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: cc.cardBg,
                      borderRadius: '8px',
                      border: `1px solid ${cc.borderLight}`,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0 }}>
                        {entry.name}
                      </p>
                      <p style={{ fontSize: '12px', color: cc.textMuted, margin: '2px 0 0 0' }}>
                        {entry.agency}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {formatDate(entry.registeredDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
