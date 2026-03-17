'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, Trash2, CreditCard, Users, Plane, AlertCircle, ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/lib/i18n';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} jam lalu`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID');
}

const typeIcons: Record<string, typeof Bell> = {
  task: ListTodo,
  payment: CreditCard,
  pilgrim: Users,
  trip: Plane,
  system: AlertCircle,
};

const typeColors: Record<string, string> = {
  task: '#3B82F6',
  payment: '#8B5CF6',
  pilgrim: '#10B981',
  trip: '#F59E0B',
  system: '#EF4444',
};

// typeLabels moved inside component for i18n

export default function NotificationsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const typeLabels: Record<string, string> = {
    task: t.notifications.typeTask,
    payment: t.notifications.typePayment,
    pilgrim: t.notifications.typePilgrim,
    trip: t.notifications.typeTrip,
    system: t.notifications.typeSystem,
  };
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const limit = 15;
  const { addToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const isReadParam = tab === 'unread' ? '&isRead=false' : '';
      const res = await fetch(`/api/notifications?page=${page}&limit=${limit}${isReadParam}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setTotalPages(data.totalPages || 1);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  async function handleMarkAllRead() {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { addToast({ type: 'error', title: t.common.errorGeneric }); }
  }

  async function handleMarkRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { addToast({ type: 'error', title: t.common.errorGeneric }); }
  }

  async function handleDelete(id: string) {
    const wasUnread = notifications.find(n => n.id === id && !n.isRead);
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { addToast({ type: 'error', title: t.common.errorGeneric }); }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? c.primary : c.textSecondary,
    backgroundColor: active ? c.primaryLight : 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '12px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px 0' }}>
            {t.notifications.title}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
            {unreadCount > 0 ? t.notifications.unread.replace('{count}', String(unreadCount)) : t.notifications.allRead}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: c.primary,
              backgroundColor: c.primaryLight,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <CheckCircle style={{ width: '14px', height: '14px' }} />
            {t.notifications.markAllRead}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={tabStyle(tab === 'all')} onClick={() => setTab('all')}>
          {t.notifications.tabAll}
        </button>
        <button style={tabStyle(tab === 'unread')} onClick={() => setTab('unread')}>
          {t.notifications.tabUnread} {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notification List */}
      <div style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>
            {t.common.loading}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={tab === 'unread' ? t.notifications.emptyUnread : t.notifications.empty}
          />
        ) : (
          notifications.map((notif, i) => {
            const Icon = typeIcons[notif.type] || Bell;
            const iconColor = typeColors[notif.type] || c.textMuted;
            return (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  gap: isMobile ? '10px' : '14px',
                  padding: isMobile ? '14px' : '16px 20px',
                  borderBottom: i < notifications.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                  backgroundColor: notif.isRead ? 'transparent' : `${c.primaryLight}33`,
                  alignItems: 'flex-start',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: `${iconColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: iconColor }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: notif.isRead ? 400 : 600,
                      color: c.textPrimary,
                      margin: 0,
                    }}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: c.primary,
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: c.textSecondary,
                    margin: '4px 0',
                    lineHeight: 1.5,
                  }}>
                    {notif.body}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{
                      fontSize: '11px',
                      color: iconColor,
                      fontWeight: 500,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: `${iconColor}10`,
                    }}>
                      {typeLabels[notif.type] || notif.type}
                    </span>
                    <span style={{ fontSize: '11px', color: c.textLight }}>
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      title={t.notifications.markRead}
                      aria-label={t.notifications.markRead}
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle style={{ width: '16px', height: '16px', color: c.textLight }} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    title={t.common.delete}
                    aria-label={t.common.delete}
                    style={{
                      padding: '6px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px', color: c.textLight }} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: page <= 1 ? c.textLight : c.textPrimary,
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            {t.common.previous}
          </button>
          <span style={{ fontSize: '13px', color: c.textMuted, padding: '0 8px' }}>
            {t.common.pageOf.replace('{page}', String(page)).replace('{total}', String(totalPages))}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: page >= totalPages ? c.textLight : c.textPrimary,
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            {t.common.next}
            <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}
    </div>
  );
}
