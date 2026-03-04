'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  forumCategories,
  ForumCategory,
  ForumThread,
} from '@/data/mock-forum';

type SortBy = 'terbaru' | 'terpanas' | 'top';

const SORT_MAPPING: Record<SortBy, string> = {
  terbaru: 'latest',
  terpanas: 'hot',
  top: 'top',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`;
  return `${Math.floor(diffDay / 30)} bulan lalu`;
}

function getCategoryInfo(key: string) {
  return forumCategories.find((c) => c.key === key);
}

export default function ForumPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [activeCategory, setActiveCategory] = useState<ForumCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('terbaru');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalThreads, setTotalThreads] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('sort', SORT_MAPPING[sortBy]);
      params.set('page', '1');

      const res = await fetch(`/api/forum?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        // Map API fields (authorName) to ForumThread interface (author)
        const mapped = (json.data || []).map((t: Record<string, unknown>) => ({
          ...t,
          author: t.authorName ?? t.author ?? '',
        })) as ForumThread[];
        setThreads(mapped);
        setTotalThreads(json.stats?.totalThreads ?? json.total ?? 0);
        if (json.stats?.categoryCounts) {
          setCategoryCounts(json.stats.categoryCounts);
        }
      }
    } catch (error) {
      console.error('Failed to fetch forum threads:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const sortTabs: { key: SortBy; label: string }[] = [
    { key: 'terbaru', label: 'Terbaru' },
    { key: 'terpanas', label: 'Terpanas' },
    { key: 'top', label: 'Top' },
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: c.textPrimary, margin: 0 }}>
            Forum Komunitas
          </h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: c.textMuted }}>
            <span>
              <span style={{ fontWeight: 600, color: c.textSecondary }}>{totalThreads.toLocaleString('id-ID')}</span> thread
            </span>
          </div>
        </div>
        <button
          onClick={() => alert('Fitur forum akan segera tersedia')}
          style={{
            padding: '10px 20px',
            backgroundColor: c.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.primary)}
        >
          + Buat Thread
        </button>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {forumCategories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${isActive ? cat.color : c.borderLight}`,
                backgroundColor: isActive ? cat.color + '18' : c.cardBg,
                color: isActive ? cat.color : c.textSecondary,
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                style={{
                  backgroundColor: isActive ? cat.color + '30' : c.borderLight,
                  color: isActive ? cat.color : c.textMuted,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: 10,
                }}
              >
                {cat.key === 'all'
                  ? totalThreads
                  : categoryCounts[cat.key] ?? cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Cari thread, tag, atau author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px',
              borderRadius: 8,
              border: `1px solid ${c.borderLight}`,
              backgroundColor: c.cardBg,
              color: c.textPrimary,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: `1px solid ${c.borderLight}` }}>
          {sortTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSortBy(tab.key)}
              style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: sortBy === tab.key ? c.primary : c.cardBg,
                color: sortBy === tab.key ? '#fff' : c.textSecondary,
                fontWeight: sortBy === tab.key ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Thread Table */}
      <div
        style={{
          border: `1px solid ${c.border}`,
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: c.cardBg,
        }}
      >
        {/* Table Header (desktop only) */}
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px',
              backgroundColor: c.pageBg,
              borderBottom: `1px solid ${c.border}`,
              fontSize: 12,
              fontWeight: 600,
              color: c.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            <div style={{ flex: 1 }}>Thread</div>
            <div style={{ width: 80, textAlign: 'center' }}>Balas</div>
            <div style={{ width: 80, textAlign: 'center' }}>Lihat</div>
            <div style={{ width: 100, textAlign: 'right' }}>Terakhir</div>
          </div>
        )}

        {/* Thread Rows */}
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: c.textMuted, fontSize: 14 }}>
            Memuat thread...
          </div>
        )}
        {!loading && threads.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: c.textMuted, fontSize: 14 }}>
            Tidak ada thread ditemukan.
          </div>
        )}
        {!loading && threads.map((thread) => (
          <ThreadRow key={thread.id} thread={thread} c={c} isMobile={isMobile} />
        ))}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
          fontSize: 13,
          color: c.textMuted,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span>
          Menampilkan <strong style={{ color: c.textSecondary }}>1-{threads.length}</strong> dari{' '}
          <strong style={{ color: c.textSecondary }}>{totalThreads}</strong> thread
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, '...', 32].map((page, idx) => (
            <button
              key={idx}
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                border: page === 1 ? 'none' : `1px solid ${c.borderLight}`,
                backgroundColor: page === 1 ? c.primary : 'transparent',
                color: page === 1 ? '#fff' : c.textSecondary,
                fontWeight: page === 1 ? 600 : 400,
                fontSize: 13,
                cursor: typeof page === 'number' ? 'pointer' : 'default',
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThreadRow({
  thread,
  c,
  isMobile,
}: {
  thread: ForumThread;
  c: Record<string, string>;
  isMobile: boolean;
}) {
  const catInfo = getCategoryInfo(thread.category);
  const avatarColors: Record<string, string> = {
    AG: '#2563EB',
    MR: '#7C3AED',
    RA: '#D97706',
    WI: '#DC2626',
    TP: '#059669',
    DM: '#0891B2',
    NA: '#6366F1',
    AS: '#EA580C',
    PA: '#0D9488',
    CA: '#DC2626',
    MA: '#7C3AED',
    TN: '#2563EB',
  };

  const badgeColors: Record<string, string> = {
    Admin: '#DC2626',
    Moderator: '#7C3AED',
    Verified: '#059669',
    'Top Contributor': '#D97706',
  };

  const rowBg = thread.isPinned ? c.warningLight : 'transparent';

  if (isMobile) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '12px 14px',
          borderBottom: `1px solid ${c.borderLight}`,
          backgroundColor: rowBg,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: avatarColors[thread.authorAvatar] || '#6B7280',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {thread.authorAvatar}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: c.textPrimary,
              lineHeight: 1.3,
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {thread.isPinned && <span>📌 </span>}
            {thread.isHot && <span>🔥 </span>}
            {thread.isSolved && <span>✅ </span>}
            {thread.title}
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 12 }}>
            <span style={{ color: c.textSecondary, fontWeight: 500 }}>{thread.author}</span>
            {thread.authorBadge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: (badgeColors[thread.authorBadge] || '#6B7280') + '18',
                  color: badgeColors[thread.authorBadge] || '#6B7280',
                }}
              >
                {thread.authorBadge}
              </span>
            )}
            {catInfo && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: catInfo.color + '18',
                  color: catInfo.color,
                }}
              >
                {catInfo.icon} {catInfo.label}
              </span>
            )}
          </div>

          {/* Inline stats */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: c.textMuted }}>
            <span style={{ color: thread.replyCount > 20 ? c.error : c.textMuted, fontWeight: thread.replyCount > 20 ? 600 : 400 }}>
              {thread.replyCount} balas
            </span>
            <span>{thread.viewCount.toLocaleString('id-ID')} lihat</span>
            <span>{timeAgo(thread.lastReplyAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop row
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: `1px solid ${c.borderLight}`,
        backgroundColor: rowBg,
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!thread.isPinned) e.currentTarget.style.backgroundColor = c.cardBgHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = rowBg;
      }}
    >
      {/* Column 1: Thread info */}
      <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: avatarColors[thread.authorAvatar] || '#6B7280',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {thread.authorAvatar}
        </div>
        <div style={{ minWidth: 0 }}>
          {/* Title */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: c.textPrimary,
              lineHeight: 1.35,
              marginBottom: 4,
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {thread.isPinned && <span>📌 </span>}
            {thread.isHot && <span>🔥 </span>}
            {thread.isSolved && <span>✅ </span>}
            {thread.title}
          </div>

          {/* Meta line */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 12 }}>
            <span style={{ color: c.textSecondary, fontWeight: 500 }}>{thread.author}</span>
            {thread.authorBadge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: (badgeColors[thread.authorBadge] || '#6B7280') + '18',
                  color: badgeColors[thread.authorBadge] || '#6B7280',
                }}
              >
                {thread.authorBadge}
              </span>
            )}
            {catInfo && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: catInfo.color + '18',
                  color: catInfo.color,
                }}
              >
                {catInfo.icon} {catInfo.label}
              </span>
            )}
            {thread.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 11, color: c.textMuted }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Column 2: Reply count */}
      <div
        style={{
          width: 80,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: thread.replyCount > 20 ? c.error : c.textPrimary,
          }}
        >
          {thread.replyCount}
        </div>
      </div>

      {/* Column 3: View count */}
      <div
        style={{
          width: 80,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 14, color: c.textMuted }}>
          {thread.viewCount.toLocaleString('id-ID')}
        </div>
      </div>

      {/* Column 4: Last reply */}
      <div
        style={{
          width: 100,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 500, color: c.textSecondary }}>{thread.lastReplyBy}</div>
        <div style={{ fontSize: 11, color: c.textMuted }}>{timeAgo(thread.lastReplyAt)}</div>
      </div>
    </div>
  );
}
