'use client';

import { Users, Package, Plane, FileText, Bell, UserPlus, PackagePlus, CalendarPlus } from 'lucide-react';

export default function DashboardPage() {
  // Mock data untuk stats
  const stats = [
    { label: 'Total Jemaah', value: '156', icon: Users, change: '+12', changeType: 'positive' as const, color: '#3B82F6' },
    { label: 'Paket Aktif', value: '8', icon: Package, change: '+2', changeType: 'positive' as const, color: '#10B981' },
    { label: 'Trip Aktif', value: '3', icon: Plane, change: '0', changeType: 'neutral' as const, color: '#F59E0B' },
    { label: 'Dokumen Pending', value: '23', icon: FileText, change: '-5', changeType: 'negative' as const, color: '#EF4444' },
  ];

  // Mock alerts
  const alerts = [
    { id: 1, type: 'warning', title: '15 Jemaah belum upload dokumen lengkap', count: 15, href: '/pilgrims' },
    { id: 2, type: 'info', title: '2 Trip perlu finalisasi manifest', count: 2, href: '/trips' },
    { id: 3, type: 'danger', title: 'PPIU License akan expired dalam 90 hari', count: 1, href: '/agency' },
  ];

  // Mock upcoming departures
  const upcomingTrips = [
    { id: 1, name: 'Umrah Reguler - Maret 2026', date: '2026-03-15', participants: 32, status: 'preparing' },
    { id: 2, name: 'Umrah Plus Dubai - April 2026', date: '2026-04-10', participants: 25, status: 'open' },
    { id: 3, name: 'Umrah Ramadhan - Mei 2026', date: '2026-05-20', participants: 45, status: 'ready' },
  ];

  // Mock recent activities
  const recentActivities = [
    { id: 1, action: 'Ahmad Fauzi membayar DP', time: '2 jam lalu', icon: '💰' },
    { id: 2, action: 'Siti Aminah mengunggah passport', time: '4 jam lalu', icon: '📄' },
    { id: 3, action: 'Trip Maret 2026 - manifest updated', time: '5 jam lalu', icon: '✈️' },
    { id: 4, action: 'Paket baru "Umrah VIP" dibuat', time: '1 hari lalu', icon: '📦' },
  ];

  const quickActions = [
    { label: 'Tambah Jemaah', icon: UserPlus, href: '/pilgrims/new', color: '#3B82F6' },
    { label: 'Buat Paket', icon: PackagePlus, href: '/packages/new', color: '#10B981' },
    { label: 'Buat Trip', icon: CalendarPlus, href: '/trips/new', color: '#F59E0B' },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' };
      case 'warning': return { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' };
      case 'info': return { bg: '#DBEAFE', border: '#3B82F6', text: '#2563EB' };
      default: return { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return { bg: '#DCFCE7', text: '#15803D', label: 'Ready' };
      case 'preparing': return { bg: '#FEF3C7', text: '#D97706', label: 'Preparing' };
      case 'open': return { bg: '#DBEAFE', text: '#2563EB', label: 'Open' };
      default: return { bg: '#F3F4F6', text: '#6B7280', label: 'Unknown' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
          Selamat datang kembali! Berikut ringkasan operasional Anda hari ini.
        </p>
      </div>

      {/* GEZMA BANNER */}
      <div style={{
        backgroundColor: '#3B82F6',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>🇮🇩</span>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
            GEZMA (Generasi Gen Z & Milenial)
          </h2>
        </div>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.95)',
          lineHeight: '1.6',
          margin: 0,
          maxWidth: '900px',
        }}>
          Tujuannya untuk membina generasi dari para anggota aspirasi yang berniat memberi tongkat estafet ke generasinya menuju Indonesia Emas 2030.
        </p>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>{stat.label}</span>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: stat.color + '15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{stat.value}</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: stat.changeType === 'positive' ? '#10B981' : stat.changeType === 'negative' ? '#EF4444' : '#6B7280',
                }}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTION CENTER & QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* ACTION CENTER */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Action Center</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert) => {
              const colors = getAlertColor(alert.type);
              return (
                <div
                  key={alert.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: colors.border + '25',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: colors.text,
                    }}>
                      {alert.count}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>
                      {alert.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '18px', color: colors.text, opacity: 0.5 }}>→</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = action.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px', color: action.color }} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* UPCOMING TRIPS & RECENT ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* UPCOMING TRIPS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>Upcoming Departures</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingTrips.map((trip) => {
              const statusColor = getStatusColor(trip.status);
              return (
                <div
                  key={trip.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FAFAFA',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>{trip.name}</h4>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                    }}>
                      {statusColor.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>📅 {trip.date}</span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>👥 {trip.participants} jemaah</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>Recent Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentActivities.map((activity) => (
              <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px', lineHeight: 1 }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 4px 0', fontWeight: '500' }}>
                    {activity.action}
                  </p>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
