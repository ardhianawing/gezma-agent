'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';
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

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
  return `${Math.floor(diffDay / 30)} months ago`;
}

function getCategoryInfo(key: string) {
  return forumCategories.find((c) => c.key === key);
}

export default function ForumPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<ForumCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('terbaru');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalThreads, setTotalThreads] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Create thread form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<string>('sharing');
  const [newTags, setNewTags] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

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
    { key: 'terbaru', label: t.forum.sortLatest },
    { key: 'terpanas', label: t.forum.sortHot },
    { key: 'top', label: t.forum.sortTop },
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
            {t.forum.title}
          </h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: c.textMuted }}>
            <span>
              <span style={{ fontWeight: 600, color: c.textSecondary }}>{totalThreads.toLocaleString()}</span> {t.forum.threadCount}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '10px 20px',
            minHeight: '44px',
            backgroundColor: c.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          {showCreateForm ? `✕ ${t.common.cancel}` : t.forum.createThread}
        </button>
      </div>

      {/* Create Thread Form */}
      {showCreateForm && (
        <div
          style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '16px',
            padding: isMobile ? '16px' : '24px',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>{t.forum.createTitle}</h3>
          <div>
            <input
              type="text"
              placeholder={t.forum.createTitlePlaceholder}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                minHeight: '46px',
                borderRadius: 8,
                border: '1px solid ' + c.border,
                backgroundColor: c.inputBg,
                color: c.textPrimary,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box' as const,
              }}
            />
            <div style={{ fontSize: 11, color: newTitle.trim().length < 5 ? '#DC2626' : c.textMuted, marginTop: 4 }}>
              {newTitle.trim().length}/5 karakter minimal
            </div>
          </div>
          <div>
            <textarea
              placeholder={t.forum.createContentPlaceholder}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid ' + c.border,
                backgroundColor: c.inputBg,
                color: c.textPrimary,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            <div style={{ fontSize: 11, color: newContent.trim().length < 20 ? '#DC2626' : c.textMuted, marginTop: 4 }}>
              {newContent.trim().length}/20 karakter minimal
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{
                padding: '10px 14px',
                minHeight: '46px',
                borderRadius: 8,
                border: '1px solid ' + c.border,
                backgroundColor: c.inputBg,
                color: c.textPrimary,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box' as const,
                width: isMobile ? '100%' : undefined,
              }}
            >
              {forumCategories.filter(cat => cat.key !== 'all').map(cat => (
                <option key={cat.key} value={cat.key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t.forum.createTagsPlaceholder}
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              style={{
                flex: 1,
                minWidth: isMobile ? undefined : 150,
                padding: '10px 14px',
                minHeight: '46px',
                borderRadius: 8,
                border: '1px solid ' + c.border,
                backgroundColor: c.inputBg,
                color: c.textPrimary,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box' as const,
                width: isMobile ? '100%' : undefined,
              }}
            />
          </div>
          {createError && (
            <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{createError}</p>
          )}
          <button
            disabled={creating || newTitle.trim().length < 5 || newContent.trim().length < 20}
            onClick={async () => {
              const title = newTitle.trim();
              const content = newContent.trim();
              if (title.length < 5) {
                const msg = `Judul terlalu pendek (${title.length}/5 karakter minimal)`;
                setCreateError(msg);
                addToast({ type: 'warning', title: 'Judul kurang panjang', description: msg });
                return;
              }
              if (content.length < 20) {
                const msg = `Konten terlalu pendek (${content.length}/20 karakter minimal)`;
                setCreateError(msg);
                addToast({ type: 'warning', title: 'Konten kurang panjang', description: msg });
                return;
              }
              setCreating(true);
              setCreateError('');
              try {
                const res = await fetch('/api/forum', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title,
                    content,
                    category: newCategory,
                    tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
                  }),
                });
                if (!res.ok) {
                  const json = await res.json();
                  const details = json.details as Record<string, string[]> | undefined;
                  if (details) {
                    const msgs = Object.values(details).flat().filter(Boolean);
                    if (msgs.length > 0) throw new Error(msgs.join(' · '));
                  }
                  throw new Error(json.error || t.forum.createError);
                }
                setNewTitle('');
                setNewContent('');
                setNewTags('');
                setShowCreateForm(false);
                fetchThreads();
                addToast({ type: 'success', title: 'Thread berhasil dibuat', description: 'Thread kamu sudah tampil di forum.' });
              } catch (err) {
                const msg = err instanceof Error ? err.message : t.forum.createError;
                setCreateError(msg);
                addToast({ type: 'error', title: 'Gagal membuat thread', description: msg });
              } finally {
                setCreating(false);
              }
            }}
            style={{
              padding: '10px 24px',
              minHeight: '44px',
              backgroundColor: creating || newTitle.trim().length < 5 || newContent.trim().length < 20 ? c.textLight : c.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: creating || newTitle.trim().length < 5 || newContent.trim().length < 20 ? 'not-allowed' : 'pointer',
              alignSelf: isMobile ? 'stretch' : 'flex-end',
              width: isMobile ? '100%' : undefined,
            }}
          >
            {creating ? t.forum.createLoading : t.forum.createSubmit}
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          gap: 8,
          marginBottom: 16,
          overflowX: isMobile ? 'auto' : undefined,
          WebkitOverflowScrolling: 'touch' as const,
          paddingBottom: isMobile ? '4px' : undefined,
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
                padding: '8px 14px',
                minHeight: '44px',
                borderRadius: 20,
                border: `1px solid ${isActive ? cat.color : c.borderLight}`,
                whiteSpace: 'nowrap' as const,
                flexShrink: 0,
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
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: isMobile ? undefined : 200 }}>
          <input
            type="text"
            placeholder={t.forum.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px',
              minHeight: '46px',
              borderRadius: 8,
              border: `1px solid ${c.borderLight}`,
              backgroundColor: c.cardBg,
              color: c.textPrimary,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: `1px solid ${c.borderLight}`, flexShrink: 0 }}>
          {sortTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSortBy(tab.key)}
              style={{
                padding: '10px 16px',
                minHeight: '44px',
                flex: isMobile ? 1 : undefined,
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
            <div style={{ flex: 1 }}>{t.forum.tableThread}</div>
            <div style={{ width: 80, textAlign: 'center' }}>{t.forum.tableReplies}</div>
            <div style={{ width: 80, textAlign: 'center' }}>{t.forum.tableViews}</div>
            <div style={{ width: 100, textAlign: 'right' }}>{t.forum.tableLast}</div>
          </div>
        )}

        {/* Thread Rows */}
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: c.textMuted, fontSize: 14 }}>
            {t.common.loading}
          </div>
        )}
        {!loading && threads.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: c.cardBgHover, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>💬</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 4px 0' }}>Belum ada diskusi</h3>
            <p style={{ fontSize: '14px', color: c.textMuted, margin: 0, maxWidth: '320px' }}>{t.forum.empty}</p>
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
          {t.common.showing} <strong style={{ color: c.textSecondary }}>1-{threads.length}</strong> {t.common.of}{' '}
          <strong style={{ color: c.textSecondary }}>{totalThreads}</strong> {t.forum.threadCount}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from(
            { length: Math.max(1, Math.min(Math.ceil(totalThreads / 20), 5)) },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                border: page === 1 ? 'none' : `1px solid ${c.borderLight}`,
                backgroundColor: page === 1 ? c.primary : 'transparent',
                color: page === 1 ? '#fff' : c.textSecondary,
                fontWeight: page === 1 ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
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
  const { t } = useLanguage();
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
      <Link
        href={`/forum/${thread.id}`}
        style={{
          display: 'flex',
          gap: 10,
          padding: '12px 14px',
          borderBottom: `1px solid ${c.borderLight}`,
          backgroundColor: rowBg,
          textDecoration: 'none',
          color: 'inherit',
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
              {thread.replyCount} {t.forum.replyUnit}
            </span>
            <span>{thread.viewCount.toLocaleString()} {t.forum.viewUnit}</span>
            <span>{timeAgo(thread.lastReplyAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Desktop row
  return (
    <Link
      href={`/forum/${thread.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: `1px solid ${c.borderLight}`,
        backgroundColor: rowBg,
        transition: 'background-color 0.15s',
        textDecoration: 'none',
        color: 'inherit',
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
    </Link>
  );
}
