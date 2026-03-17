'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Eye, MessageSquare, Tag, CheckCircle2, Pin } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';
import { forumCategories } from '@/data/mock-forum';

interface ThreadReply {
  id: string;
  author: string;
  avatar: string;
  badge?: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface ThreadData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isHot: boolean;
  isSolved: boolean;
  lastReplyBy?: string;
  lastReplyAt?: string;
  createdAt: string;
  replies?: Array<{
    id: string;
    content: string;
    authorName: string;
    authorAvatar: string;
    authorBadge?: string;
    likes: number;
    createdAt: string;
  }>;
}

const badgeColors: Record<string, { bg: string; text: string }> = {
  Admin: { bg: '#DC262615', text: '#DC2626' },
  Moderator: { bg: '#2563EB15', text: '#2563EB' },
  Verified: { bg: '#15803D15', text: '#15803D' },
  'Top Contributor': { bg: '#D9770615', text: '#D97706' },
};

export default function ForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const [replyText, setReplyText] = useState('');
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThread() {
      setLoading(true);
      try {
        const res = await fetch(`/api/forum/${id}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data as ThreadData;
          setThread(data);
          // Map API reply fields to component format
          setReplies(
            (data.replies || []).map((r) => ({
              id: r.id,
              author: r.authorName,
              avatar: r.authorAvatar,
              badge: r.authorBadge || undefined,
              content: r.content,
              createdAt: r.createdAt,
              likes: r.likes,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch thread:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchThread();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: c.textMuted }}>{t.common.loading}</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: c.textMuted }}>{t.forum.empty}</p>
        <Link href="/forum" style={{ color: c.primary, textDecoration: 'none', fontSize: '14px' }}>
          {t.common.back} {t.forum.title}
        </Link>
      </div>
    );
  }

  const categoryInfo = forumCategories.find(cat => cat.key === thread.category);
  const fullContent = thread.content || thread.excerpt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      {/* Back button */}
      <Link href="/forum" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: c.textMuted, fontSize: '14px' }}>
        <ArrowLeft style={{ width: '18px', height: '18px' }} />
        {t.common.back} {t.forum.title}
      </Link>

      {/* Thread */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Thread header */}
        <div style={{ padding: isMobile ? '20px' : '28px', borderBottom: `1px solid ${c.borderLight}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {thread.isPinned && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#2563EB15', color: '#2563EB' }}>
                <Pin style={{ width: '12px', height: '12px' }} /> Pinned
              </span>
            )}
            {thread.isSolved && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#15803D15', color: '#15803D' }}>
                <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Solved
              </span>
            )}
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: `${categoryInfo?.color || '#6B7280'}15`,
                color: categoryInfo?.color || '#6B7280',
              }}
            >
              {categoryInfo?.icon} {categoryInfo?.label}
            </span>
          </div>

          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: c.textPrimary, margin: '0 0 12px 0', lineHeight: '1.3' }}>
            {thread.title}
          </h1>

          {/* Author + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: c.primary + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: c.primary,
                }}
              >
                {thread.authorAvatar}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>{thread.authorName}</span>
              {thread.authorBadge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: badgeColors[thread.authorBadge]?.bg || '#F1F5F9',
                    color: badgeColors[thread.authorBadge]?.text || '#64748B',
                  }}
                >
                  {thread.authorBadge}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: c.textMuted }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '13px', height: '13px' }} />
                {new Date(thread.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye style={{ width: '13px', height: '13px' }} />
                {thread.viewCount.toLocaleString()} {t.forum.viewUnit}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageSquare style={{ width: '13px', height: '13px' }} />
                {thread.replyCount} {t.forum.replyUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Thread content */}
        <div style={{ padding: isMobile ? '20px' : '28px' }}>
          <div style={{ fontSize: '15px', lineHeight: '1.8', color: c.textSecondary, whiteSpace: 'pre-line' }}>
            {fullContent}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${c.borderLight}` }}>
            <Tag style={{ width: '14px', height: '14px', color: c.textMuted }} />
            {thread.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: c.cardBgHover,
                  color: c.textMuted,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
          {t.forum.tableReplies} ({replies.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {replies.map((reply) => {
            const replyBadgeStyle = reply.badge ? badgeColors[reply.badge] : null;
            return (
              <div
                key={reply.id}
                style={{
                  backgroundColor: c.cardBg,
                  borderRadius: '12px',
                  border: `1px solid ${c.border}`,
                  padding: isMobile ? '16px' : '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: c.primary + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: c.primary,
                      flexShrink: 0,
                    }}
                  >
                    {reply.avatar}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>{reply.author}</span>
                      {replyBadgeStyle && (
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: replyBadgeStyle.bg, color: replyBadgeStyle.text }}>
                          {reply.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: c.textMuted }}>
                      {new Date(reply.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: c.textSecondary, margin: 0 }}>
                  {reply.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply form placeholder */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: isMobile ? '16px' : '20px',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: '0 0 12px 0' }}>
          Write Reply
        </h3>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply here..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            fontSize: '14px',
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            backgroundColor: c.pageBg,
            color: c.textPrimary,
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            disabled
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: c.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'not-allowed',
              opacity: 0.5,
            }}
          >
            {t.forum.createSubmit}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: c.textMuted, margin: '8px 0 0 0' }}>
          Reply feature will be available in the next update.
        </p>
      </div>
    </div>
  );
}
