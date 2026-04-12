'use client';

import { useState } from 'react';
import { Package, Building2, TrendingUp, Users, Eye, Ban } from 'lucide-react';

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

type PackageCategory = 'Reguler' | 'VIP' | 'Ekonomi' | 'Seasonal';
type PackageStatus = 'active' | 'full' | 'suspended';
type FilterTab = 'semua' | 'Reguler' | 'VIP' | 'Ekonomi' | 'Seasonal';

interface UmrahPackage {
  id: string;
  name: string;
  agency: string;
  category: PackageCategory;
  price: number;
  duration: string;
  bookings: number;
  capacity: number;
  status: PackageStatus;
}

const CATEGORY_COLORS: Record<PackageCategory, { bg: string; text: string }> = {
  Reguler:  { bg: '#DBEAFE', text: '#1D4ED8' },
  VIP:      { bg: '#F3E8FF', text: '#7C3AED' },
  Ekonomi:  { bg: '#DCFCE7', text: '#15803D' },
  Seasonal: { bg: '#FEF3C7', text: '#D97706' },
};

const STATUS_COLORS: Record<PackageStatus, { bg: string; text: string; label: string }> = {
  active:    { bg: '#DCFCE7', text: '#15803D', label: 'Aktif' },
  full:      { bg: '#DBEAFE', text: '#1D4ED8', label: 'Full' },
  suspended: { bg: '#FEE2E2', text: '#DC2626', label: 'Suspended' },
};

const MOCK_PACKAGES: UmrahPackage[] = [
  {
    id: '1',
    name: 'Umrah Reguler Ramadan 2026',
    agency: 'PT Nur Ilahi Tour',
    category: 'Reguler',
    price: 28500000,
    duration: '12 Hari',
    bookings: 45,
    capacity: 50,
    status: 'full',
  },
  {
    id: '2',
    name: 'Paket VIP Platinum Makkah',
    agency: 'Arminareka Perdana',
    category: 'VIP',
    price: 55000000,
    duration: '14 Hari',
    bookings: 18,
    capacity: 30,
    status: 'active',
  },
  {
    id: '3',
    name: 'Umrah Ekonomi Syawal 2026',
    agency: 'Al-Barokah Travel',
    category: 'Ekonomi',
    price: 22000000,
    duration: '9 Hari',
    bookings: 88,
    capacity: 100,
    status: 'active',
  },
  {
    id: '4',
    name: 'Paket Seasonal Dzulhijjah',
    agency: 'Fazam Tour & Travel',
    category: 'Seasonal',
    price: 34000000,
    duration: '10 Hari',
    bookings: 30,
    capacity: 40,
    status: 'active',
  },
  {
    id: '5',
    name: 'Umrah VIP Gold Madinah First',
    agency: 'Khalifa Wisata',
    category: 'VIP',
    price: 48000000,
    duration: '15 Hari',
    bookings: 12,
    capacity: 20,
    status: 'active',
  },
  {
    id: '6',
    name: 'Paket Reguler Muharram',
    agency: 'Baitussalam Tour',
    category: 'Reguler',
    price: 27500000,
    duration: '12 Hari',
    bookings: 55,
    capacity: 55,
    status: 'full',
  },
  {
    id: '7',
    name: 'Umrah Ekonomi Budget Plus',
    agency: 'Safari Suci Tour',
    category: 'Ekonomi',
    price: 24000000,
    duration: '10 Hari',
    bookings: 0,
    capacity: 60,
    status: 'suspended',
  },
  {
    id: '8',
    name: 'Paket Seasonal Akhir Tahun 2026',
    agency: 'Rabani Travel',
    category: 'Seasonal',
    price: 31500000,
    duration: '11 Hari',
    bookings: 22,
    capacity: 50,
    status: 'active',
  },
  {
    id: '9',
    name: 'Umrah Reguler Business Class',
    agency: 'PT Mina Wisata Islami',
    category: 'Reguler',
    price: 32000000,
    duration: '13 Hari',
    bookings: 40,
    capacity: 45,
    status: 'active',
  },
  {
    id: '10',
    name: 'Paket VIP Family Suite',
    agency: 'Duta Wisata Haji',
    category: 'VIP',
    price: 52000000,
    duration: '14 Hari',
    bookings: 8,
    capacity: 15,
    status: 'active',
  },
];

function formatPrice(price: number): string {
  return 'Rp ' + (price / 1000000).toFixed(0) + ' jt';
}

export default function CCPackagesPage() {
  const [packages, setPackages] = useState<UmrahPackage[]>(MOCK_PACKAGES);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [suspendConfirm, setSuspendConfirm] = useState<string | null>(null);

  const stats = {
    totalPaket: packages.length,
    totalBookings: packages.reduce((sum, p) => sum + p.bookings, 0),
    avgOccupancy: Math.round(
      packages.reduce((sum, p) => sum + (p.bookings / p.capacity) * 100, 0) / packages.length
    ),
    activeAgencies: new Set(packages.filter(p => p.status !== 'suspended').map(p => p.agency)).size,
  };

  const filtered = packages.filter(p => {
    if (activeTab === 'semua') return true;
    return p.category === activeTab;
  });

  const suspendPackage = (id: string) => {
    setPackages(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, status: p.status === 'suspended' ? 'active' : 'suspended' };
    }));
    setSuspendConfirm(null);
  };

  const statCards = [
    { label: 'Total Paket', value: stats.totalPaket, icon: Package, color: '#2563EB' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Users, color: '#10B981' },
    { label: 'Avg Occupancy', value: `${stats.avgOccupancy}%`, icon: TrendingUp, color: '#F59E0B' },
    { label: 'Active Agencies', value: stats.activeAgencies, icon: Building2, color: '#8B5CF6' },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'Reguler', label: 'Reguler' },
    { key: 'VIP', label: 'VIP' },
    { key: 'Ekonomi', label: 'Ekonomi' },
    { key: 'Seasonal', label: 'Seasonal' },
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
            <Package style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Packages Overview
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Monitor dan kelola semua paket umrah yang terdaftar di ekosistem GEZMA.
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
                  'Nama Paket', 'Agensi', 'Kategori', 'Harga (IDR)',
                  'Durasi', 'Bookings', 'Occupancy', 'Status', 'Aksi',
                ].map((col, i) => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 16px',
                      textAlign: i >= 5 && i <= 6 ? 'center' : 'left',
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
                  <td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>
                    Tidak ada paket ditemukan.
                  </td>
                </tr>
              ) : filtered.map((pkg, i) => {
                const catColor = CATEGORY_COLORS[pkg.category];
                const statusCfg = STATUS_COLORS[pkg.status];
                const occupancy = Math.round((pkg.bookings / pkg.capacity) * 100);
                const isSuspended = pkg.status === 'suspended';

                return (
                  <tr
                    key={pkg.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    {/* Package Name */}
                    <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: cc.textPrimary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {pkg.name}
                      </p>
                    </td>

                    {/* Agency */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textSecondary, margin: 0, fontWeight: 500 }}>
                        {pkg.agency}
                      </p>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: catColor.text,
                        backgroundColor: catColor.bg,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}>
                        {pkg.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0 }}>
                        {formatPrice(pkg.price)}
                      </p>
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: cc.textMuted }}>
                      {pkg.duration}
                    </td>

                    {/* Bookings */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: cc.textMuted }}>
                      {pkg.bookings}/{pkg.capacity}
                    </td>

                    {/* Occupancy */}
                    <td style={{ padding: '14px 16px', minWidth: '100px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          backgroundColor: '#E2E8F0',
                          borderRadius: '99px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${occupancy}%`,
                            backgroundColor: occupancy >= 95 ? '#EF4444' : occupancy >= 70 ? '#F59E0B' : '#10B981',
                            borderRadius: '99px',
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap', minWidth: '32px' }}>
                          {occupancy}%
                        </span>
                      </div>
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
                        {/* View Details */}
                        <button
                          title="Lihat Detail"
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

                        {/* Suspend / Unsuspend */}
                        {suspendConfirm === pkg.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => suspendPackage(pkg.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: isSuspended ? '#10B981' : '#DC2626',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {isSuspended ? 'Ya, Aktifkan' : 'Ya, Suspend'}
                            </button>
                            <button
                              onClick={() => setSuspendConfirm(null)}
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
                          <button
                            title={isSuspended ? 'Aktifkan Paket' : 'Suspend Paket'}
                            onClick={() => setSuspendConfirm(pkg.id)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: isSuspended ? '1px solid #BBF7D0' : '1px solid #FECACA',
                              backgroundColor: isSuspended ? '#F0FDF4' : '#FEF2F2',
                              color: isSuspended ? '#15803D' : '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Ban style={{ width: '14px', height: '14px' }} />
                          </button>
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
            Menampilkan {filtered.length} dari {packages.length} paket
          </p>
        </div>
      </div>
    </div>
  );
}
