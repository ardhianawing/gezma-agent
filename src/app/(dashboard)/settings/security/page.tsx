'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

interface LoginHistoryItem {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  loginAt: string;
  logoutAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Tidak diketahui';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Browser lain';
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SecuritySettingsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Login history
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async (page: number) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/settings/security/login-history?page=${page}&limit=10`);
      const data = await res.json();
      setHistory(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handlePasswordChange = async () => {
    setPwMessage(null);
    if (!currentPassword || !newPassword) {
      setPwMessage({ type: 'error', text: 'Semua field harus diisi' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/settings/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMessage({ type: 'error', text: data.error || 'Gagal mengubah password' });
      } else {
        setPwMessage({ type: 'success', text: 'Password berhasil diubah' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 40px 0 12px',
    fontSize: '14px',
    border: `1px solid ${c.border}`,
    borderRadius: '8px',
    backgroundColor: c.inputBg,
    color: c.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/settings" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft style={{ width: '20px', height: '20px', color: c.textMuted }} />
        </Link>
        <PageHeader
          title={t.settings.security}
          description={t.settings.securityDesc}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '16px' : '24px',
      }}>
        {/* Change Password */}
        <div style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: isMobile ? '16px' : '20px',
            borderBottom: `1px solid ${c.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Lock style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
              Ubah Password
            </h3>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: c.textSecondary, marginBottom: '4px', display: 'block' }}>
                Password Saat Ini
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {showCurrentPw
                    ? <EyeOff style={{ width: '16px', height: '16px', color: c.textMuted }} />
                    : <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: c.textSecondary, marginBottom: '4px', display: 'block' }}>
                Password Baru
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {showNewPw
                    ? <EyeOff style={{ width: '16px', height: '16px', color: c.textMuted }} />
                    : <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: c.textSecondary, marginBottom: '4px', display: 'block' }}>
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, padding: '0 12px' }}
              />
            </div>

            {pwMessage && (
              <p style={{
                fontSize: '13px',
                color: pwMessage.type === 'success' ? c.success : c.error,
                margin: 0,
              }}>
                {pwMessage.text}
              </p>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={pwLoading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: c.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: pwLoading ? 'not-allowed' : 'pointer',
                opacity: pwLoading ? 0.7 : 1,
              }}
            >
              {pwLoading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Menyimpan...
                </span>
              ) : t.common.save}
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: isMobile ? '16px' : '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield style={{ width: '18px', height: '18px', color: c.success }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
              Tips Keamanan
            </h3>
          </div>
          {[
            'Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol',
            'Jangan bagikan password Anda kepada siapapun',
            'Ganti password secara berkala (setiap 3 bulan)',
            'Periksa riwayat login secara rutin untuk aktivitas mencurigakan',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: c.successLight,
                color: c.success,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: isMobile ? '16px' : '20px',
          borderBottom: `1px solid ${c.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Monitor style={{ width: '18px', height: '18px', color: c.textMuted }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
            Riwayat Login
          </h3>
          <span style={{
            fontSize: '12px',
            color: c.textMuted,
            backgroundColor: c.cardBgHover,
            padding: '2px 8px',
            borderRadius: '6px',
            marginLeft: 'auto',
          }}>
            {pagination.total} sesi
          </span>
        </div>

        <div style={{ padding: isMobile ? '12px' : '16px' }}>
          {historyLoading ? (
            <TableSkeleton rows={4} columns={2} />
          ) : history.length === 0 ? (
            <p style={{ textAlign: 'center', color: c.textMuted, fontSize: '14px', padding: '20px 0' }}>
              Belum ada riwayat login.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: c.pageBg,
                  border: `1px solid ${c.borderLight}`,
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: c.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Monitor style={{ width: '18px', height: '18px', color: c.primary }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary, margin: 0 }}>
                      {parseUserAgent(item.userAgent)}
                    </p>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                      IP: {item.ipAddress || '-'} &middot; {formatDateTime(item.loginAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${c.borderLight}`,
            }}>
              <button
                onClick={() => fetchHistory(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.cardBg,
                  color: c.textSecondary,
                  fontSize: '13px',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ChevronLeft style={{ width: '14px', height: '14px' }} />
                Prev
              </button>
              <span style={{ fontSize: '13px', color: c.textMuted }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchHistory(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.cardBg,
                  color: c.textSecondary,
                  fontSize: '13px',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Next
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
