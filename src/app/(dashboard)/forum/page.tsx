'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  Eye,
  Heart,
  Pin,
  Flame,
  CheckCircle,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  forumThreads,
  forumCategories,
  forumStats,
  type ForumCategory,
} from '@/data/mock-forum';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m lalu`;
  if (hours < 24) return `${hours}j lalu`;
  if (days < 7) return `${days}h lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState<ForumCategory>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'most_liked'>('latest');

  const filteredThreads = useMemo(() => {
    let threads = [...forumThreads];

    if (activeCategory !== 'semua') {
      threads = threads.filter(t => t.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      threads = threads.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        t.author.name.toLowerCase().includes(q)
      );
    }

    const pinned = threads.filter(t => t.isPinned);
    let regular = threads.filter(t => !t.isPinned);

    switch (sortBy) {
      case 'hot':
        regular.sort((a, b) => (b.viewCount + b.replyCount * 5) - (a.viewCount + a.replyCount * 5));
        break;
      case 'most_liked':
        regular.sort((a, b) => b.likeCount - a.likeCount);
        break;
      default:
        regular.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return [...pinned, ...regular];
  }, [activeCategory, searchQuery, sortBy]);

  const getCategoryInfo = (catId: string) => forumCategories.find(c => c.id === catId);

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'Admin': return { bg: '#DC2626', color: 'white' };
      case 'Moderator': return { bg: '#2563EB', color: 'white' };
      case 'Top Contributor': return { bg: '#D97706', color: 'white' };
      case 'Senior Member': return { bg: '#059669', color: 'white' };
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* ===== HEADER ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>Forum</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Komunitas travel umrah Indonesia —{' '}
            <span style={{ color: '#059669', fontWeight: '600' }}>{forumStats.onlineNow} online</span>
            {' · '}{formatNumber(forumStats.totalMembers)} anggota · {formatNumber(forumStats.totalThreads)} thread
          </p>
        </div>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          backgroundColor: '#DC2626', color: 'white', fontSize: '14px', fontWeight: '600',
          padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          Buat Thread
        </button>
      </div>

      {/* ===== CATEGORY PILLS ===== */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '100%' }}>
        {forumCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'semua'
            ? forumThreads.length
            : forumThreads.filter(t => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as ForumCategory)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '20px',
                border: isActive ? `2px solid ${cat.color}` : '1px solid #E5E7EB',
                backgroundColor: isActive ? cat.color + '12' : 'white',
                color: isActive ? cat.color : '#4B5563',
                fontSize: '13px', fontWeight: isActive ? '600' : '500',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '14px' }}>{cat.icon}</span>
              {cat.label}
              <span style={{
                fontSize: '11px', fontWeight: '600',
                padding: '1px 6px', borderRadius: '8px',
                backgroundColor: isActive ? cat.color : '#E5E7EB',
                color: isActive ? 'white' : '#6B7280',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== SEARCH + SORT ===== */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <div style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', pointerEvents: 'none', display: 'flex', alignItems: 'center',
          }}>
            <Search style={{ width: '16px', height: '16px' }} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari thread..."
            style={{
              width: '100%', height: '38px', paddingLeft: '40px',
              paddingRight: searchQuery ? '32px' : '12px',
              fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px',
              outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
              display: 'flex', alignItems: 'center',
            }}>
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px', flexShrink: 0 }}>
          {[
            { id: 'latest', label: 'Terbaru' },
            { id: 'hot', label: 'Terpanas' },
            { id: 'most_liked', label: 'Top' },
          ].map((sort) => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id as 'latest' | 'hot' | 'most_liked')}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none',
                backgroundColor: sortBy === sort.id ? 'white' : 'transparent',
                boxShadow: sortBy === sort.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                color: sortBy === sort.id ? '#111827' : '#6B7280',
                fontSize: '12px', fontWeight: sortBy === sort.id ? '600' : '500',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== THREAD TABLE ===== */}
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
        overflow: 'hidden', width: '100%', maxWidth: '100%',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 16px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
          fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <span style={{ flex: 1 }}>THREAD</span>
          <span style={{ width: '60px', textAlign: 'center', flexShrink: 0 }}>BALAS</span>
          <span style={{ width: '60px', textAlign: 'center', flexShrink: 0 }}>LIHAT</span>
          <span style={{ width: '130px', textAlign: 'right', flexShrink: 0 }}>TERAKHIR</span>
        </div>

        {/* Thread Rows */}
        {filteredThreads.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Tidak ada thread ditemukan</p>
          </div>
        ) : (
          filteredThreads.map((thread, index) => {
            const catInfo = getCategoryInfo(thread.category);
            const badgeStyle = getBadgeStyle(thread.author.badge);
            const isPinned = thread.isPinned;
            const isHot = thread.isHot;

            return (
              <div
                key={thread.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: index < filteredThreads.length - 1 ? '1px solid #F3F4F6' : 'none',
                  backgroundColor: isPinned ? '#FFFBEB' : 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isPinned) e.currentTarget.style.backgroundColor = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isPinned) e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {/* Thread Info - FLEX 1 */}
                <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: thread.author.badge === 'Admin' ? '#DC2626'
                      : thread.author.badge === 'Moderator' ? '#2563EB' : '#6B7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '12px', fontWeight: '700',
                  }}>
                    {thread.author.avatar}
                  </div>

                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    {/* Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', overflow: 'hidden' }}>
                      {isPinned && <Pin style={{ width: '12px', height: '12px', color: '#D97706', flexShrink: 0 }} />}
                      {isHot && <Flame style={{ width: '12px', height: '12px', color: '#DC2626', flexShrink: 0 }} />}
                      {thread.isSolved && <CheckCircle style={{ width: '12px', height: '12px', color: '#059669', flexShrink: 0 }} />}

                      <span style={{
                        fontSize: '13px', fontWeight: '600', color: '#111827',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {thread.title}
                      </span>
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '11px', color: '#374151', fontWeight: '500', flexShrink: 0 }}>
                        {thread.author.name}
                      </span>

                      {badgeStyle && (
                        <span style={{
                          fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '3px',
                          backgroundColor: badgeStyle.bg, color: badgeStyle.color, textTransform: 'uppercase',
                          flexShrink: 0,
                        }}>
                          {thread.author.badge}
                        </span>
                      )}

                      {catInfo && (
                        <span style={{
                          fontSize: '10px', fontWeight: '600', padding: '1px 7px', borderRadius: '4px',
                          backgroundColor: (catInfo.color || '#6B7280') + '15',
                          color: catInfo.color || '#6B7280', flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                          {catInfo.label}
                        </span>
                      )}

                      {thread.tags.slice(0, 2).map((tag) => (
                        <span key={tag} style={{
                          fontSize: '10px', color: '#9CA3AF', fontWeight: '500', flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reply Count */}
                <div style={{ width: '60px', textAlign: 'center', flexShrink: 0 }}>
                  <p style={{
                    fontSize: '15px', fontWeight: '700', margin: 0,
                    color: thread.replyCount > 50 ? '#DC2626' : thread.replyCount > 20 ? '#D97706' : '#374151',
                  }}>
                    {thread.replyCount}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    <Heart style={{ width: '9px', height: '9px', color: '#D1D5DB' }} />
                    <span style={{ fontSize: '9px', color: '#9CA3AF' }}>{thread.likeCount}</span>
                  </div>
                </div>

                {/* View Count */}
                <div style={{ width: '60px', textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', margin: 0 }}>
                    {formatNumber(thread.viewCount)}
                  </p>
                </div>

                {/* Last Activity */}
                <div style={{ width: '130px', textAlign: 'right', flexShrink: 0 }}>
                  {thread.lastReply ? (
                    <>
                      <p style={{
                        fontSize: '11px', fontWeight: '500', color: '#374151', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {thread.lastReply.user}
                      </p>
                      <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '1px 0 0 0' }}>
                        {thread.lastReply.time}
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0 }}>
                      {timeAgo(thread.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          Menampilkan <span style={{ fontWeight: '600', color: '#111827' }}>{filteredThreads.length}</span> thread
        </p>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button style={{
            width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #D1D5DB',
            backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'not-allowed', color: '#D1D5DB',
          }} disabled>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
          </button>
          {[1, 2, 3].map((page) => (
            <button key={page} style={{
              width: '32px', height: '32px', borderRadius: '6px',
              border: page === 1 ? '2px solid #DC2626' : '1px solid #D1D5DB',
              backgroundColor: page === 1 ? '#FEF2F2' : 'white',
              color: page === 1 ? '#DC2626' : '#374151',
              fontSize: '13px', fontWeight: page === 1 ? '700' : '400',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {page}
            </button>
          ))}
          <button style={{
            width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #D1D5DB',
            backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#374151',
          }}>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
