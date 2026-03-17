'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const code = searchParams.get('code');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!code) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          padding: '40px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>
            {t.auth.resetInvalidLink}
          </p>
          <Link
            href="/forgot-password"
            style={{ color: '#D32F2F', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}
          >
            {t.auth.resetRequestNew}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t.auth.resetMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.resetMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.common.error);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch {
      setError(t.common.errorGeneric);
      setIsLoading(false);
    }
  };

  const eyeStyle: React.CSSProperties = {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: '#94A3B8',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        padding: '40px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
          <Image src="/logo-light.png" alt="GEZMA" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', letterSpacing: '-0.5px' }}>
            {t.auth.brandName}
          </span>
        </div>

        {success ? (
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
              {t.auth.resetSuccessTitle}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              {t.auth.resetSuccessMessage}
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
              {t.auth.resetGoToLogin}
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 6px 0' }}>
              {t.auth.resetTitle}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0' }}>
              {t.auth.resetSubtitle}
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
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="password"
                  style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
                >
                  {t.auth.resetNewPasswordLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
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
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.auth.resetNewPasswordPlaceholder}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      paddingLeft: '44px',
                      paddingRight: '44px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      color: '#1E293B',
                      outline: 'none',
                    }}
                  />
                  {showPassword ? (
                    <EyeOff style={eyeStyle} onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye style={eyeStyle} onClick={() => setShowPassword(true)} />
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="confirmPassword"
                  style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
                >
                  {t.auth.resetConfirmLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
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
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder={t.auth.resetConfirmPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      paddingLeft: '44px',
                      paddingRight: '44px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      color: '#1E293B',
                      outline: 'none',
                    }}
                  />
                  {showConfirm ? (
                    <EyeOff style={eyeStyle} onClick={() => setShowConfirm(false)} />
                  ) : (
                    <Eye style={eyeStyle} onClick={() => setShowConfirm(true)} />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!password || !confirmPassword || isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: 'none',
                  background: !password || !confirmPassword || isLoading
                    ? '#E2E8F0'
                    : 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                  color: !password || !confirmPassword || isLoading ? '#94A3B8' : 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: !password || !confirmPassword || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                    {t.auth.resetSubmitLoading}
                  </>
                ) : (
                  t.auth.resetSubmit
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '24px' }}>
              <Link
                href="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#D32F2F', fontWeight: '600', textDecoration: 'none' }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} />
                {t.auth.forgotBackToLogin}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
