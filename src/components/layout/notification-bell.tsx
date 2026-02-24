'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle, Trash2, CreditCard, Users, Plane, AlertCircle, ListTodo } from 'lucide-react';
import { useTheme } from '@/lib/theme';

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
  if (diffMin < 60) return `${diffMin}m lalu`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}j lalu`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}h lalu`;
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

export function NotificationBell() {
  const { c } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(() => {
    fetch('/api/notifications?isRead=false&limit=1')
      .then(res => res.json())
      .then(data => {
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {});
  }, []);

  // Fetch unread count on mount and poll every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!showDropdown || loaded) return;
    fetch('/api/notifications?limit=5')
      .then(res => res.json())
      .then(data => {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount ?? 0);
        setLoaded(true);
      })
      .catch(() => {});
  }, [showDropdown, loaded]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleBellClick() {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setLoaded(false); // Refresh on reopen
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silently fail */ }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchUnreadCount();
    } catch { /* silently fail */ }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }} data-tour="notifications">
      <button
        onClick={handleBellClick}
        style={{
          position: 'relative',
          padding: '10px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: showDropdown ? c.cardBgHover : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        <Bell style={{ width: '20px', height: '20px', color: c.textMuted }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              right: '6px',
              top: '6px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              backgroundColor: '#EF4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '8px',
            width: '360px',
            maxHeight: '440px',
            overflowY: 'auto',
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            zIndex: 50,
          }}
        >
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${c.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                color: '#EF4444',
              }}>
                {unreadCount} baru
              </span>
            )}
          </div>

          <div>
            {notifications.length === 0 ? (
              <p style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: c.textMuted }}>
                Belum ada notifikasi
              </p>
            ) : (
              notifications.map(notif => {
                const Icon = typeIcons[notif.type] || Bell;
                const iconColor = typeColors[notif.type] || c.textMuted;
                return (
                  <div
                    key={notif.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '12px 16px',
                      borderBottom: `1px solid ${c.borderLight}`,
                      backgroundColor: notif.isRead ? 'transparent' : `${c.primaryLight}33`,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: `${iconColor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}>
                      <Icon style={{ width: '16px', height: '16px', color: iconColor }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: notif.isRead ? 400 : 600,
                        color: c.textPrimary,
                        margin: '0 0 2px 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {notif.title}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: c.textMuted,
                        margin: '0 0 4px 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {notif.body}
                      </p>
                      <span style={{ fontSize: '11px', color: c.textLight }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          title="Tandai dibaca"
                          style={{
                            padding: '4px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle style={{ width: '14px', height: '14px', color: c.textLight }} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        title="Hapus"
                        style={{
                          padding: '4px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px', color: c.textLight }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${c.borderLight}`, textAlign: 'center' }}>
            <Link
              href="/notifications"
              onClick={() => setShowDropdown(false)}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: c.primary,
                textDecoration: 'none',
              }}
            >
              Lihat Semua
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
