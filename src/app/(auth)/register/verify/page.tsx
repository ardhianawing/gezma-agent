'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!code) return;
    setVerifying(true);
    setError('');

    try {
      const res = await fetch(`/api/auth/verify/${code}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verifikasi gagal');
        setVerifying(false);
        return;
      }

      setVerified(true);
      setVerifying(false);

      // Auto-redirect to dashboard after 1.5s
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setVerifying(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        padding: '40px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
          <Image src="/logo-light.png" alt="GEZMA" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', letterSpacing: '-0.5px' }}>
            GEZMA Agent
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            padding: '40px 32px',
          }}
        >
          {verified ? (
            /* Success State */
            <>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <CheckCircle2 style={{ width: '36px', height: '36px', color: '#16A34A' }} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 8px 0' }}>
                Akun Berhasil Diverifikasi!
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 28px 0' }}>
                Akun Anda sudah aktif. Silakan login untuk mengakses dashboard.
              </p>
              <button
                onClick={() => router.push('/login')}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                Masuk ke Dashboard
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </>
          ) : (
            /* Verify State */
            <>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#FFEBEE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Mail style={{ width: '32px', height: '32px', color: '#D32F2F' }} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 8px 0' }}>
                Verifikasi Email
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                {code
                  ? 'Klik tombol di bawah untuk memverifikasi akun Anda.'
                  : 'Kami telah mengirimkan link verifikasi ke email Anda. Silakan buka email dan klik link tersebut untuk mengaktifkan akun.'}
              </p>

              {/* Error */}
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

              {/* Dev mode: direct verify button */}
              {code ? (
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    border: 'none',
                    background: verifying
                      ? '#E2E8F0'
                      : 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                    color: verifying ? '#94A3B8' : 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: verifying ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: verifying ? 'none' : '0 4px 12px rgba(211, 47, 47, 0.25)',
                    transition: 'all 0.2s ease',
                    marginBottom: '16px',
                  }}
                >
                  {verifying ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                      Verifikasi Akun Sekarang
                    </>
                  )}
                </button>
              ) : (
                /* Info box when no code */
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    fontSize: '13px',
                    color: '#1E40AF',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                  }}
                >
                  Link verifikasi berlaku selama 24 jam. Cek juga folder spam jika tidak menemukan email.
                </div>
              )}

              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#64748B',
                  textDecoration: 'none',
                }}
              >
                Kembali ke Login
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '24px' }}>
          Butuh bantuan? Hubungi support@gezma.id
        </p>
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
