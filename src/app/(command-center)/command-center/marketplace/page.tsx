'use client';

import { useState } from 'react';
import { ShoppingBag, Package, Clock, DollarSign, Star, CheckCircle, XCircle, PauseCircle, Eye, StarOff } from 'lucide-react';

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

type ItemStatus = 'pending' | 'active' | 'suspended' | 'featured';
type FilterTab = 'semua' | 'pending' | 'active' | 'suspended';
type Category = 'Hotel' | 'Visa' | 'Bus' | 'Asuransi' | 'Mutawwif' | 'Tiket';

interface MarketplaceItem {
  id: string;
  supplierName: string;
  productName: string;
  category: Category;
  price: number;
  rating: number;
  status: ItemStatus;
  featured: boolean;
  addedDate: string;
}

const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> = {
  Hotel:     { bg: '#DBEAFE', text: '#1D4ED8' },
  Visa:      { bg: '#DCFCE7', text: '#15803D' },
  Bus:       { bg: '#FEF3C7', text: '#D97706' },
  Asuransi:  { bg: '#F3E8FF', text: '#7C3AED' },
  Mutawwif:  { bg: '#FFF1F2', text: '#BE123C' },
  Tiket:     { bg: '#ECFDF5', text: '#065F46' },
};

const STATUS_CONFIG: Record<ItemStatus, { bg: string; text: string; label: string }> = {
  pending:   { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
  active:    { bg: '#DCFCE7', text: '#15803D', label: 'Aktif' },
  suspended: { bg: '#FEE2E2', text: '#DC2626', label: 'Suspended' },
  featured:  { bg: '#DBEAFE', text: '#1D4ED8', label: 'Featured' },
};

const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: '1',
    supplierName: 'PT Al-Amin Hotel Management',
    productName: 'Hotel Bintang 5 Makkah — View Masjidil Haram',
    category: 'Hotel',
    price: 28_500_000,
    rating: 4.9,
    status: 'featured',
    featured: true,
    addedDate: '2026-04-01',
  },
  {
    id: '2',
    supplierName: 'Visa Express Indonesia',
    productName: 'Layanan Visa Umrah Ekspres 3 Hari',
    category: 'Visa',
    price: 1_750_000,
    rating: 4.7,
    status: 'active',
    featured: false,
    addedDate: '2026-04-02',
  },
  {
    id: '3',
    supplierName: 'Nusantara Bus Armada',
    productName: 'Armada Bus AC Premium — Antar Jemput Bandara',
    category: 'Bus',
    price: 450_000,
    rating: 4.5,
    status: 'active',
    featured: false,
    addedDate: '2026-04-03',
  },
  {
    id: '4',
    supplierName: 'Takaful Umrah Nusantara',
    productName: 'Asuransi Perjalanan Umrah Komprehensif',
    category: 'Asuransi',
    price: 320_000,
    rating: 4.3,
    status: 'pending',
    featured: false,
    addedDate: '2026-04-04',
  },
  {
    id: '5',
    supplierName: 'Ustadz Muthawwif Professional',
    productName: 'Paket Mutawwif Berpengalaman 15 Hari',
    category: 'Mutawwif',
    price: 5_000_000,
    rating: 4.8,
    status: 'active',
    featured: false,
    addedDate: '2026-04-04',
  },
  {
    id: '6',
    supplierName: 'Garuda Hajj & Umrah Travel',
    productName: 'Tiket Pesawat CGK–JED Kelas Ekonomi',
    category: 'Tiket',
    price: 12_800_000,
    rating: 4.6,
    status: 'featured',
    featured: true,
    addedDate: '2026-04-05',
  },
  {
    id: '7',
    supplierName: 'PT Madinah Suites Group',
    productName: 'Hotel Bintang 4 Madinah — Dekat Masjid Nabawi',
    category: 'Hotel',
    price: 18_200_000,
    rating: 4.4,
    status: 'pending',
    featured: false,
    addedDate: '2026-04-06',
  },
  {
    id: '8',
    supplierName: 'Cepat Visa Indonesia',
    productName: 'Jasa Pengurusan Visa Umrah Reguler',
    category: 'Visa',
    price: 950_000,
    rating: 3.8,
    status: 'suspended',
    featured: false,
    addedDate: '2026-04-06',
  },
  {
    id: '9',
    supplierName: 'Berkah Transport Islami',
    productName: 'Shuttle Bus Dalam Kota Madinah — Per Trip',
    category: 'Bus',
    price: 180_000,
    rating: 4.1,
    status: 'pending',
    featured: false,
    addedDate: '2026-04-07',
  },
  {
    id: '10',
    supplierName: 'Saudi Arabian Airlines Partner',
    productName: 'Tiket Pesawat SUB–MED Via Jeddah Kelas Bisnis',
    category: 'Tiket',
    price: 32_500_000,
    rating: 4.7,
    status: 'active',
    featured: false,
    addedDate: '2026-04-08',
  },
];

function formatIDR(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            fontSize: '13px',
            color: i <= full ? '#F59E0B' : (i === full + 1 && hasHalf ? '#FCD34D' : '#E2E8F0'),
          }}
        >
          ★
        </span>
      ))}
      <span style={{ fontSize: '12px', color: cc.textMuted, marginLeft: '4px' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export default function CCMarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>(MOCK_ITEMS);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: 'approve' | 'reject' | 'suspend' } | null>(null);

  const stats = {
    totalSuppliers: new Set(items.map(i => i.supplierName)).size,
    activeProducts: items.filter(i => i.status === 'active' || i.status === 'featured').length,
    pendingApproval: items.filter(i => i.status === 'pending').length,
    totalRevenue: items.reduce((sum, i) => sum + i.price * (i.status === 'active' || i.status === 'featured' ? 12 : 0), 0),
    avgRating: items.length > 0
      ? items.reduce((sum, i) => sum + i.rating, 0) / items.length
      : 0,
  };

  const filtered = items.filter(item => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'active') return item.status === 'active' || item.status === 'featured';
    if (activeTab === 'suspended') return item.status === 'suspended';
    return true;
  });

  const approveItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'active' } : i));
    setActionConfirm(null);
  };

  const rejectItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'suspended' } : i));
    setActionConfirm(null);
  };

  const suspendItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'suspended', featured: false } : i));
    setActionConfirm(null);
  };

  const toggleFeature = (id: string) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      return { ...i, featured: !i.featured, status: !i.featured ? 'featured' : 'active' };
    }));
  };

  const statCards = [
    { label: 'Total Suppliers', value: stats.totalSuppliers, icon: ShoppingBag, color: '#2563EB' },
    { label: 'Active Products', value: stats.activeProducts, icon: Package, color: '#10B981' },
    { label: 'Pending Approval', value: stats.pendingApproval, icon: Clock, color: '#F59E0B' },
    { label: 'Total Revenue (Est.)', value: formatIDR(stats.totalRevenue), icon: DollarSign, color: '#8B5CF6' },
    { label: 'Average Rating', value: stats.avgRating.toFixed(1), icon: Star, color: '#EF4444' },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'suspended', label: 'Suspended' },
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
            <ShoppingBag style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Marketplace Administration
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Kelola supplier, produk, dan layanan dalam ekosistem Marketplace GEZMA.
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
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '22px', height: '22px', color: card.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: cc.textPrimary, margin: '4px 0 0 0' }}>
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
                {tab.key === 'pending' && stats.pendingApproval > 0 && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}>
                    {stats.pendingApproval}
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Nama Supplier
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Produk / Layanan
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Kategori
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Harga
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Rating
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Ditambahkan
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>
                    Tidak ada item ditemukan.
                  </td>
                </tr>
              ) : filtered.map((item, i) => {
                const catColor = CATEGORY_COLORS[item.category];
                const statusCfg = STATUS_CONFIG[item.status];
                const isPending = item.status === 'pending';
                const isSuspended = item.status === 'suspended';
                const isConfirming = actionConfirm?.id === item.id;

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    {/* Supplier */}
                    <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: cc.textPrimary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.supplierName}
                      </p>
                    </td>

                    {/* Product */}
                    <td style={{ padding: '14px 16px', maxWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.featured && (
                          <Star style={{ width: '13px', height: '13px', color: '#2563EB', flexShrink: 0 }} />
                        )}
                        <p style={{
                          fontSize: '13px',
                          color: cc.textSecondary,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {item.productName}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: catColor.text,
                        backgroundColor: catColor.bg,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}>
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: cc.textPrimary }}>
                        {formatIDR(item.price)}
                      </span>
                    </td>

                    {/* Rating */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <StarRating rating={item.rating} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
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

                    {/* Date */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(item.addedDate)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      {isConfirming ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {actionConfirm.action === 'approve' && (
                            <button
                              onClick={() => approveItem(item.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#15803D',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Ya, Approve
                            </button>
                          )}
                          {actionConfirm.action === 'reject' && (
                            <button
                              onClick={() => rejectItem(item.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#DC2626',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Ya, Reject
                            </button>
                          )}
                          {actionConfirm.action === 'suspend' && (
                            <button
                              onClick={() => suspendItem(item.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#EA580C',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Ya, Suspend
                            </button>
                          )}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                          {/* Approve — show for pending */}
                          {isPending && (
                            <button
                              title="Approve"
                              onClick={() => setActionConfirm({ id: item.id, action: 'approve' })}
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
                              <CheckCircle style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}

                          {/* Reject — show for pending */}
                          {isPending && (
                            <button
                              title="Reject"
                              onClick={() => setActionConfirm({ id: item.id, action: 'reject' })}
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
                              <XCircle style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}

                          {/* Suspend — show for active/featured */}
                          {!isPending && !isSuspended && (
                            <button
                              title="Suspend"
                              onClick={() => setActionConfirm({ id: item.id, action: 'suspend' })}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                border: '1px solid #FED7AA',
                                backgroundColor: '#FFF7ED',
                                color: '#EA580C',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              <PauseCircle style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}

                          {/* Feature/Unfeature — show for active/featured */}
                          {!isPending && !isSuspended && (
                            <button
                              title={item.featured ? 'Hapus Featured' : 'Jadikan Featured'}
                              onClick={() => toggleFeature(item.id)}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                border: `1px solid ${item.featured ? '#BFDBFE' : cc.border}`,
                                backgroundColor: item.featured ? '#EFF6FF' : cc.cardBg,
                                color: item.featured ? '#2563EB' : cc.textMuted,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              {item.featured
                                ? <StarOff style={{ width: '14px', height: '14px' }} />
                                : <Star style={{ width: '14px', height: '14px' }} />
                              }
                            </button>
                          )}

                          {/* View */}
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
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${cc.borderLight}` }}>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Menampilkan {filtered.length} dari {items.length} item marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
