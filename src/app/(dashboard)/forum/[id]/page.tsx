'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Eye, MessageSquare, Tag, CheckCircle2, Pin } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { forumThreads, forumCategories } from '@/data/mock-forum';

interface MockReply {
  id: string;
  author: string;
  avatar: string;
  badge?: string;
  content: string;
  createdAt: string;
  likes: number;
}

function getMockReplies(threadId: string): MockReply[] {
  // Generate static mock replies based on thread
  const baseReplies: MockReply[] = [
    {
      id: `${threadId}-r1`,
      author: 'AgenJakarta',
      avatar: 'AJ',
      badge: 'Verified',
      content: 'Terima kasih infonya, sangat bermanfaat. Saya sudah mengikuti langkah-langkahnya dan berhasil. Semoga teman-teman yang lain juga terbantu.',
      createdAt: '2026-02-23T10:00:00Z',
      likes: 12,
    },
    {
      id: `${threadId}-r2`,
      author: 'ModRina',
      avatar: 'MR',
      badge: 'Moderator',
      content: 'Terima kasih sudah sharing. Thread ini sangat informatif dan berguna untuk komunitas. Saya pin supaya lebih mudah ditemukan.',
      createdAt: '2026-02-23T11:30:00Z',
      likes: 8,
    },
    {
      id: `${threadId}-r3`,
      author: 'NewbiePKB',
      avatar: 'NP',
      content: 'Baru bergabung di forum ini. Banyak sekali ilmu yang bisa didapat. Izin bookmark thread ini ya. Nanti kalau ada pertanyaan saya tanya di sini.',
      createdAt: '2026-02-23T13:15:00Z',
      likes: 5,
    },
    {
      id: `${threadId}-r4`,
      author: 'ProAgent99',
      avatar: 'PA',
      badge: 'Top Contributor',
      content: 'Saya mau tambahin sedikit. Dari pengalaman saya selama 3 tahun di bidang ini, memang pendekatan yang disebutkan di atas sudah cukup tepat. Yang perlu diperhatikan adalah konsistensi dan follow-up rutin.',
      createdAt: '2026-02-23T15:45:00Z',
      likes: 15,
    },
    {
      id: `${threadId}-r5`,
      author: 'AgenBandung',
      avatar: 'AB',
      content: 'Setuju dengan OP dan komentar di atas. Saya juga sudah coba dan hasilnya memang signifikan. Recommended!',
      createdAt: '2026-02-23T17:00:00Z',
      likes: 3,
    },
  ];
  return baseReplies;
}

function getFullContent(thread: typeof forumThreads[0]): string {
  return `${thread.excerpt}\n\nBerikut penjelasan lebih detail mengenai topik ini. Saya sudah mengumpulkan berbagai informasi dari sumber terpercaya dan pengalaman pribadi selama beberapa tahun terakhir.\n\nHal yang perlu diperhatikan:\n- Pastikan semua data dan dokumen sudah lengkap sebelum memulai\n- Ikuti prosedur yang berlaku sesuai regulasi terbaru\n- Jangan ragu untuk bertanya jika ada yang kurang jelas\n- Selalu update informasi dari sumber resmi\n\nSemoga thread ini bermanfaat untuk semua anggota forum. Silakan diskusi di kolom balasan.`;
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
  const [replyText, setReplyText] = useState('');

  const thread = forumThreads.find(t => t.id === id);

  if (!thread) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: c.textMuted }}>Thread tidak ditemukan.</p>
        <Link href="/forum" style={{ color: c.primary, textDecoration: 'none', fontSize: '14px' }}>
          Kembali ke Forum
        </Link>
      </div>
    );
  }

  const categoryInfo = forumCategories.find(cat => cat.key === thread.category);
  const replies = getMockReplies(thread.id);
  const fullContent = getFullContent(thread);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      {/* Back button */}
      <Link href="/forum" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: c.textMuted, fontSize: '14px' }}>
        <ArrowLeft style={{ width: '18px', height: '18px' }} />
        Kembali ke Forum
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
              <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>{thread.author}</span>
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
                {thread.viewCount.toLocaleString()} views
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageSquare style={{ width: '13px', height: '13px' }} />
                {thread.replyCount} replies
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
          Balasan ({replies.length})
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
          Tulis Balasan
        </h3>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Tulis balasan Anda di sini..."
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
            Kirim Balasan
          </button>
        </div>
        <p style={{ fontSize: '12px', color: c.textMuted, margin: '8px 0 0 0' }}>
          Fitur balasan akan tersedia dalam update selanjutnya.
        </p>
      </div>
    </div>
  );
}
