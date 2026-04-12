'use client';

import { useState } from 'react';
import { MessageSquare, Flag, Pin, Lock, Users, Eye, Trash2, ExternalLink, PinOff, Unlock } from 'lucide-react';

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

type ThreadStatus = 'active' | 'reported' | 'locked' | 'pinned';
type FilterTab = 'semua' | 'reported' | 'pinned' | 'locked';

interface Thread {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  status: ThreadStatus;
  date: string;
  reportCount?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Regulasi:    { bg: '#DBEAFE', text: '#1D4ED8' },
  Review:      { bg: '#DCFCE7', text: '#15803D' },
  Operasional: { bg: '#FEF3C7', text: '#D97706' },
  Sharing:     { bg: '#F3E8FF', text: '#7C3AED' },
  'Scam Alert':{ bg: '#FEE2E2', text: '#DC2626' },
};

const STATUS_COLORS: Record<ThreadStatus, { bg: string; text: string; label: string }> = {
  active:   { bg: '#DCFCE7', text: '#15803D', label: 'Aktif' },
  reported: { bg: '#FEE2E2', text: '#DC2626', label: 'Dilaporkan' },
  locked:   { bg: '#F1F5F9', text: '#64748B', label: 'Terkunci' },
  pinned:   { bg: '#FEF3C7', text: '#D97706', label: 'Disematkan' },
};

const MOCK_THREADS: Thread[] = [
  {
    id: '1',
    title: 'Update Regulasi PPIU 2026 — Apa yang Perlu Diketahui Agensi?',
    author: 'PT Nur Ilahi Tour',
    category: 'Regulasi',
    replies: 42,
    views: 1240,
    status: 'pinned',
    date: '2026-04-10',
  },
  {
    id: '2',
    title: 'Review Jujur: Hotel Al-Safwah Makkah vs Pullman ZamZam',
    author: 'Al-Barokah Travel',
    category: 'Review',
    replies: 87,
    views: 3560,
    status: 'active',
    date: '2026-04-09',
  },
  {
    id: '3',
    title: 'WASPADA: Oknum mengatasnamakan GEZMA minta transfer DP',
    author: 'Arminareka Perdana',
    category: 'Scam Alert',
    replies: 23,
    views: 890,
    status: 'reported',
    date: '2026-04-08',
    reportCount: 5,
  },
  {
    id: '4',
    title: 'Tips Operasional Manasik Massal: Pengalaman 500+ Jemaah',
    author: 'Fazam Tour & Travel',
    category: 'Operasional',
    replies: 31,
    views: 670,
    status: 'pinned',
    date: '2026-04-07',
  },
  {
    id: '5',
    title: 'Sharing: Cara Kami Naikkan Rating Google ke 4.9 Bintang',
    author: 'Baitussalam Tour',
    category: 'Sharing',
    replies: 56,
    views: 2100,
    status: 'active',
    date: '2026-04-06',
  },
  {
    id: '6',
    title: 'Apakah Maskapai Saudi Airlines Layak untuk Jemaah Plus?',
    author: 'Khalifa Wisata',
    category: 'Review',
    replies: 19,
    views: 480,
    status: 'reported',
    date: '2026-04-05',
    reportCount: 3,
  },
  {
    id: '7',
    title: 'Diskusi: Standar Minimal Fasilitas Paket Umrah Reguler',
    author: 'PT Mina Wisata Islami',
    category: 'Regulasi',
    replies: 64,
    views: 1870,
    status: 'locked',
    date: '2026-04-04',
  },
  {
    id: '8',
    title: 'Pengalaman Pakai Aplikasi GEZMA untuk Tracking Jemaah Realtime',
    author: 'Safari Suci Tour',
    category: 'Sharing',
    replies: 28,
    views: 920,
    status: 'active',
    date: '2026-04-03',
  },
  {
    id: '9',
    title: 'LAPORAN: Agensi X menjual paket tanpa izin PPIU aktif',
    author: 'Rabani Travel',
    category: 'Scam Alert',
    replies: 12,
    views: 560,
    status: 'reported',
    date: '2026-04-02',
    reportCount: 8,
  },
  {
    id: '10',
    title: 'Panduan Lengkap Pengurusan Visa Umrah Cepat 2026',
    author: 'Duta Wisata Haji',
    category: 'Operasional',
    replies: 74,
    views: 2450,
    status: 'active',
    date: '2026-04-01',
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CCForumPage() {
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const stats = {
    total: threads.length,
    activeToday: threads.filter(t => t.date === '2026-04-10' || t.date === '2026-04-09').length,
    reported: threads.filter(t => t.status === 'reported').length,
    banned: 2, // mock
  };

  const filtered = threads.filter(t => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'reported') return t.status === 'reported';
    if (activeTab === 'pinned') return t.status === 'pinned';
    if (activeTab === 'locked') return t.status === 'locked';
    return true;
  });

  const togglePin = (id: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: t.status === 'pinned' ? 'active' : 'pinned' };
    }));
  };

  const toggleLock = (id: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: t.status === 'locked' ? 'active' : 'locked' };
    }));
  };

  const deleteThread = (id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  const statCards = [
    { label: 'Total Threads', value: stats.total, icon: MessageSquare, color: '#2563EB' },
    { label: 'Aktif Hari Ini', value: stats.activeToday, icon: Eye, color: '#10B981' },
    { label: 'Reported Posts', value: stats.reported, icon: Flag, color: '#EF4444' },
    { label: 'Banned Users', value: stats.banned, icon: Users, color: '#F59E0B' },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'reported', label: 'Reported' },
    { key: 'pinned', label: 'Pinned' },
    { key: 'locked', label: 'Locked' },
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
            <MessageSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Forum Moderation
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Pantau dan moderasi semua thread forum agensi dalam ekosistem GEZMA.
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
                {tab.key === 'reported' && stats.reported > 0 && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#EF4444',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}>
                    {stats.reported}
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
                  Judul Thread
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Author (Agensi)
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Kategori
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Balasan
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Views
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Tanggal
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
                    Tidak ada thread ditemukan.
                  </td>
                </tr>
              ) : filtered.map((thread, i) => {
                const catColor = CATEGORY_COLORS[thread.category] || { bg: '#F1F5F9', text: '#64748B' };
                const statusCfg = STATUS_COLORS[thread.status];
                const isPinned = thread.status === 'pinned';
                const isLocked = thread.status === 'locked';

                return (
                  <tr
                    key={thread.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        {isPinned && <Pin style={{ width: '13px', height: '13px', color: '#D97706', flexShrink: 0, marginTop: '2px' }} />}
                        {isLocked && <Lock style={{ width: '13px', height: '13px', color: '#64748B', flexShrink: 0, marginTop: '2px' }} />}
                        <div>
                          <p style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: cc.textPrimary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {thread.title}
                          </p>
                          {thread.reportCount && thread.reportCount > 0 && (
                            <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>
                              {thread.reportCount} laporan masuk
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textSecondary, margin: 0, fontWeight: 500 }}>
                        {thread.author}
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
                        whiteSpace: 'nowrap',
                      }}>
                        {thread.category}
                      </span>
                    </td>

                    {/* Replies */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: cc.textMuted }}>
                      {thread.replies}
                    </td>

                    {/* Views */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: cc.textMuted }}>
                      {thread.views.toLocaleString('id-ID')}
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
                      {formatDate(thread.date)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        {/* Pin/Unpin */}
                        <button
                          title={isPinned ? 'Lepas Sematkan' : 'Sematkan'}
                          onClick={() => togglePin(thread.id)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: `1px solid ${cc.border}`,
                            backgroundColor: isPinned ? '#FEF3C7' : cc.cardBg,
                            color: isPinned ? '#D97706' : cc.textMuted,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          {isPinned
                            ? <PinOff style={{ width: '14px', height: '14px' }} />
                            : <Pin style={{ width: '14px', height: '14px' }} />
                          }
                        </button>

                        {/* Lock/Unlock */}
                        <button
                          title={isLocked ? 'Buka Kunci' : 'Kunci Thread'}
                          onClick={() => toggleLock(thread.id)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: `1px solid ${cc.border}`,
                            backgroundColor: isLocked ? '#F1F5F9' : cc.cardBg,
                            color: isLocked ? '#64748B' : cc.textMuted,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          {isLocked
                            ? <Unlock style={{ width: '14px', height: '14px' }} />
                            : <Lock style={{ width: '14px', height: '14px' }} />
                          }
                        </button>

                        {/* View */}
                        <button
                          title="Lihat Thread"
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
                          <ExternalLink style={{ width: '14px', height: '14px' }} />
                        </button>

                        {/* Delete */}
                        {deleteConfirm === thread.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => deleteThread(thread.id)}
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
                              Ya, Hapus
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
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
                            title="Hapus Thread"
                            onClick={() => setDeleteConfirm(thread.id)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: `1px solid #FECACA`,
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
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
            Menampilkan {filtered.length} dari {threads.length} thread
          </p>
        </div>
      </div>
    </div>
  );
}
