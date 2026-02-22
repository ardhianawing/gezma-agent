'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { useResponsive } from '@/lib/hooks/use-responsive';

export default function ForgotPasswordPage() {
  const { isMobile } = useResponsive();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Terjadi kesalahan');
      } else {
        setSent(true);
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        padding: isMobile ? '24px 20px' : '40px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: isMobile ? 'center' : undefined }}>
          <Image src="/logo-light.png" alt="GEZMA" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', letterSpacing: '-0.5px' }}>
            GEZMA Agent
          </span>
        </div>

        {sent ? (
          /* Success state */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 style={{ width: '32px', height: '32px', color: '#16A34A' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 8px 0' }}>
              Email Terkirim
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Jika email <strong>{email}</strong> terdaftar di sistem kami, Anda akan menerima instruksi untuk mereset password.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#D32F2F',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Kembali ke Login
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 6px 0' }}>
              Lupa Password
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0' }}>
              Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password
            </p>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#DC2626',
                  fontWeight: '500',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
                >
                  Alamat Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#94A3B8',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="ahmad@barokahtravel.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      paddingLeft: '44px',
                      paddingRight: '16px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      color: '#1E293B',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!email.trim() || isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: 'none',
                  background: !email.trim() || isLoading ? '#E2E8F0' : 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                  color: !email.trim() || isLoading ? '#94A3B8' : 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: !email.trim() || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Instruksi Reset'
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '24px' }}>
              <Link
                href="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#D32F2F', fontWeight: '600', textDecoration: 'none' }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} />
                Kembali ke Login
              </Link>
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
