'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';
import { useLanguage } from '@/lib/i18n';

const PILGRIM_GREEN = '#059669';
const PILGRIM_GREEN_HOVER = '#047857';
const PILGRIM_GREEN_LIGHT = '#ECFDF5';

export default function PilgrimLoginPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { login } = usePilgrim();
  const router = useRouter();
  const { t } = useLanguage();

  const [bookingCode, setBookingCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');
    setBookingCode('UMR-2026-DEMO');

    const result = await login('UMR-2026-DEMO');
    if (result.success) {
      router.replace('/pilgrim');
    } else {
      setError(result.error || t.pilgrimPortal.loginErrorDemo);
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bookingCode.trim()) {
      setError(t.pilgrimPortal.loginErrorEmpty);
      return;
    }

    setIsSubmitting(true);

    const result = await login(bookingCode);
    if (result.success) {
      router.replace('/pilgrim');
    } else {
      setError(result.error || t.pilgrimPortal.loginErrorDefault);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '24px 16px' : '40px 24px',
      backgroundColor: c.pageBg,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <Image
          src="/logo-light.png"
          alt="GEZMA"
          width={64}
          height={64}
          style={{ objectFit: 'contain', marginBottom: '16px' }}
        />

        {/* Branding */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: PILGRIM_GREEN,
          margin: '0 0 4px 0',
          letterSpacing: '-0.02em',
        }}>
          {t.pilgrimPortal.brand}
        </h1>
        <p style={{
          fontSize: '14px',
          color: c.textMuted,
          margin: '0 0 32px 0',
        }}>
          {t.pilgrimPortal.subtitle}
        </p>

        {/* Login card */}
        <div style={{
          width: '100%',
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: c.textPrimary,
            margin: '0 0 4px 0',
            textAlign: 'center',
          }}>
            {t.pilgrimPortal.loginTitle}
          </h2>
          <p style={{
            fontSize: '13px',
            color: c.textMuted,
            margin: '0 0 20px 0',
            textAlign: 'center',
          }}>
            {t.pilgrimPortal.loginDesc}
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: c.textSecondary,
              marginBottom: '6px',
            }}>
              {t.pilgrimPortal.bookingCodeLabel}
            </label>
            <input
              type="text"
              value={bookingCode}
              onChange={(e) => {
                setBookingCode(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              placeholder={t.pilgrimPortal.bookingCodePlaceholder}
              autoComplete="off"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '16px',
                fontWeight: 500,
                color: c.textPrimary,
                backgroundColor: c.inputBg,
                border: '1px solid ' + (error ? c.error : c.border),
                borderRadius: '10px',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: '0.05em',
                textAlign: 'center',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = PILGRIM_GREEN;
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = c.border;
                }
              }}
            />

            {/* Error message */}
            {error && (
              <p style={{
                fontSize: '13px',
                color: c.error,
                margin: '8px 0 0 0',
                textAlign: 'center',
              }}>
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '16px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: isSubmitting ? c.textMuted : PILGRIM_GREEN,
                border: 'none',
                borderRadius: '10px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor = PILGRIM_GREEN_HOVER;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor = PILGRIM_GREEN;
                }
              }}
            >
              {isSubmitting ? t.pilgrimPortal.loginVerifying : t.pilgrimPortal.loginSubmit}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: c.border }} />
            <span style={{ fontSize: '12px', color: c.textMuted }}>{t.common.or}</span>
            <div style={{ flex: 1, height: '1px', background: c.border }} />
          </div>

          {/* Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting || isDemoLoading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: isSubmitting || isDemoLoading ? c.textMuted : PILGRIM_GREEN,
              backgroundColor: PILGRIM_GREEN_LIGHT,
              border: '1.5px solid ' + PILGRIM_GREEN,
              borderRadius: '10px',
              cursor: isSubmitting || isDemoLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              opacity: isSubmitting || isDemoLoading ? 0.6 : 1,
            }}
          >
            {isDemoLoading ? t.pilgrimPortal.loginVerifying : t.pilgrimPortal.loginDemo}
          </button>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '12px',
          color: c.textLight,
          marginTop: '24px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {t.pilgrimPortal.loginFooter}
        </p>
      </div>
    </div>
  );
}
