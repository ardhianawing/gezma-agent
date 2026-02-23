'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';

const PILGRIM_GREEN = '#059669';
const PILGRIM_GREEN_HOVER = '#047857';
const PILGRIM_GREEN_LIGHT = '#ECFDF5';

export default function PilgrimLoginPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { login } = usePilgrim();
  const router = useRouter();

  const [bookingCode, setBookingCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bookingCode.trim()) {
      setError('Masukkan kode booking Anda');
      return;
    }

    setIsSubmitting(true);

    // Simulate a brief loading delay
    setTimeout(() => {
      const success = login(bookingCode);
      if (success) {
        router.replace('/pilgrim');
      } else {
        setError('Kode booking tidak ditemukan. Periksa kembali kode Anda.');
        setIsSubmitting(false);
      }
    }, 500);
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
        {/* Kaaba emoji */}
        <div style={{
          fontSize: '64px',
          marginBottom: '16px',
          lineHeight: 1,
        }}>
          {'\u{1F54B}'}
        </div>

        {/* Branding */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: PILGRIM_GREEN,
          margin: '0 0 4px 0',
          letterSpacing: '-0.02em',
        }}>
          GEZMA Pilgrim
        </h1>
        <p style={{
          fontSize: '14px',
          color: c.textMuted,
          margin: '0 0 32px 0',
        }}>
          Portal Jemaah Umrah
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
            Masuk ke Portal
          </h2>
          <p style={{
            fontSize: '13px',
            color: c.textMuted,
            margin: '0 0 20px 0',
            textAlign: 'center',
          }}>
            Gunakan kode booking dari travel agent Anda
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: c.textSecondary,
              marginBottom: '6px',
            }}>
              Kode Booking
            </label>
            <input
              type="text"
              value={bookingCode}
              onChange={(e) => {
                setBookingCode(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              placeholder="Contoh: UMR-2026-0001"
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
              {isSubmitting ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: PILGRIM_GREEN_LIGHT,
          borderRadius: '10px',
          width: '100%',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '12px',
            color: PILGRIM_GREEN_HOVER,
            margin: 0,
            fontWeight: 500,
          }}>
            Demo: gunakan kode <strong>UMR-2026-0001</strong>
          </p>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '12px',
          color: c.textLight,
          marginTop: '24px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Hubungi travel agent Anda untuk mendapatkan kode booking
        </p>
      </div>
    </div>
  );
}
