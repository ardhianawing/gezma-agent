'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Menu, ChevronDown, LogOut, Building2, Settings, User, MessageCircle } from 'lucide-react';
import ChatWidget from '@/components/ai-assistant/ChatWidget';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { CommandPalette } from '@/components/shared/command-palette';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useAuth } from '@/lib/auth';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
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

const activityDotColors: Record<string, string> = {
  pilgrim: '#3B82F6',
  package: '#10B981',
  trip: '#F59E0B',
  payment: '#8B5CF6',
  document: '#EF4444',
};

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { t } = useLanguage();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Notification dropdown
  const [showNotifs, setShowNotifs] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Chat widget
  const [isChatOpen, setIsChatOpen] = useState(false);

  // User menu dropdown
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch activities when notification dropdown opens
  useEffect(() => {
    if (!showNotifs || notifLoaded) return;
    fetch('/api/activities')
      .then((res) => res.json())
      .then((json) => {
        setActivities(json.data || []);
        setHasNew(false);
        setNotifLoaded(true);
      })
      .catch(() => {});
  }, [showNotifs, notifLoaded]);

  // Check for new activities on mount
  useEffect(() => {
    fetch('/api/activities')
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data.length > 0) setHasNew(true);
      })
      .catch(() => {});
  }, []);

  // Global Ctrl+K shortcut for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/pilgrims?search=${encodeURIComponent(q)}`);
      setSearchQuery('');
    }
  }

  function handleBellClick() {
    setShowNotifs(!showNotifs);
    setShowUserMenu(false);
    if (!showNotifs) {
      setHasNew(false);
    }
  }

  function handleUserMenuClick() {
    setShowUserMenu(!showUserMenu);
    setShowNotifs(false);
  }

  return (
    <>
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        width: '100%',
        backgroundColor: c.headerBg,
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${c.borderLight}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: isMobile ? '64px' : '72px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 32px',
          gap: '12px',
        }}
      >
        {/* Left side - Menu button + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          {/* Mobile menu button */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: c.cardBgHover,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <Menu style={{ width: '20px', height: '20px', color: c.textMuted }} />
            </button>
          )}

          {/* Search - opens command palette */}
          {!isMobile && (
            <button
              data-tour="search"
              onClick={() => setShowCommandPalette(true)}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRadius: '12px',
                border: `1px solid ${c.border}`,
                backgroundColor: c.inputBg,
                fontSize: '14px',
                color: c.textLight,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <Search style={{ width: '20px', height: '20px', color: c.textLight, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.header.searchPlaceholder}</span>
              <kbd style={{
                padding: '2px 8px',
                fontSize: '11px',
                color: c.textMuted,
                backgroundColor: c.pageBg,
                borderRadius: '6px',
                border: `1px solid ${c.border}`,
                fontFamily: 'inherit',
              }}>
                Ctrl+K
              </kbd>
            </button>
          )}

          {/* Mobile search icon */}
          {isMobile && (
            <button
              onClick={() => setShowCommandPalette(true)}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <Search style={{ width: '20px', height: '20px', color: c.textMuted }} />
            </button>
          )}
        </div>

        {/* Right side - Theme Toggle + Language Toggle + Notifications + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Toggle - compact on mobile */}
          {!isMobile && <LanguageToggle />}

          {/* AI Chat */}
          <button
            data-tour="chat-widget"
            onClick={() => setIsChatOpen((prev) => !prev)}
            title="GEZMA Assistant"
            style={{
              position: 'relative',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isChatOpen ? '#FEF2F2' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageCircle
              style={{
                width: '20px',
                height: '20px',
                color: isChatOpen ? '#DC2626' : c.textMuted,
                transition: 'color 0.2s',
              }}
            />
          </button>

          {/* Notifications */}
          <div ref={notifRef} data-tour="notifications" style={{ position: 'relative' }}>
            <button
              onClick={handleBellClick}
              style={{
                position: 'relative',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: showNotifs ? c.cardBgHover : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell style={{ width: '20px', height: '20px', color: c.textMuted }} />
              {hasNew && (
                <span
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: c.primary,
                  }}
                />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div
                style={isMobile ? {
                  position: 'fixed',
                  left: '16px',
                  right: '16px',
                  top: '72px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  backgroundColor: c.cardBg,
                  borderRadius: '12px',
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  zIndex: 50,
                } : {
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '360px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  backgroundColor: c.cardBg,
                  borderRadius: '12px',
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  zIndex: 50,
                }}
              >
                <div style={{ padding: '16px', borderBottom: `1px solid ${c.borderLight}` }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                    Notifikasi
                  </h3>
                </div>
                <div>
                  {activities.length === 0 ? (
                    <p style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: c.textMuted }}>
                      Belum ada aktivitas
                    </p>
                  ) : (
                    activities.slice(0, 8).map((a) => (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '12px 16px',
                          borderBottom: `1px solid ${c.borderLight}`,
                          alignItems: 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: activityDotColors[a.type] || c.textMuted,
                            marginTop: '6px',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>
                            {a.title}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: c.textMuted,
                            margin: '2px 0 0 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {a.description}
                          </p>
                          <span style={{ fontSize: '11px', color: c.textLight }}>{timeAgo(a.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider - hide on mobile */}
          {!isMobile && (
            <div
              style={{
                height: '32px',
                width: '1px',
                backgroundColor: c.border,
                margin: '0 8px',
              }}
            />
          )}

          {/* User Menu */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={handleUserMenuClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0' : '12px',
                padding: isMobile ? '4px' : '8px 12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: showUserMenu ? c.cardBgHover : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                minWidth: '44px',
                minHeight: '44px',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: isMobile ? '36px' : '40px',
                  height: isMobile ? '36px' : '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: 'white' }}>
                  {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??'}
                </span>
              </div>
              {!isMobile && (
                <>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                      {user?.name || 'Memuat...'}
                    </p>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                      {user?.agency?.name || '-'}
                    </p>
                  </div>
                  <ChevronDown
                    style={{
                      width: '16px',
                      height: '16px',
                      color: c.textLight,
                      transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '220px',
                  backgroundColor: c.cardBg,
                  borderRadius: '12px',
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                {/* User info */}
                <div style={{ padding: '16px', borderBottom: `1px solid ${c.borderLight}` }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0 0 0' }}>
                    {user?.email}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    fontSize: '11px',
                    fontWeight: '500',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: c.primaryLight,
                    color: c.primary,
                    textTransform: 'capitalize',
                  }}>
                    {user?.role}
                  </span>
                </div>

                {/* Menu items */}
                <div style={{ padding: '4px 0' }}>
                  <Link
                    href="/agency"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: c.textPrimary,
                      textDecoration: 'none',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Building2 style={{ width: '16px', height: '16px', color: c.textMuted }} />
                    Profil Agensi
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: c.textPrimary,
                      textDecoration: 'none',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Settings style={{ width: '16px', height: '16px', color: c.textMuted }} />
                    Pengaturan
                  </Link>
                </div>

                {/* Logout */}
                <div style={{ borderTop: `1px solid ${c.borderLight}`, padding: '4px 0' }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: '#DC2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut style={{ width: '16px', height: '16px' }} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Command Palette */}
    <CommandPalette open={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

    {/* AI Chat Widget */}
    <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
