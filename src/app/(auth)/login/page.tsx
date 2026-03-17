'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');
    setEmail('demo@demotravel.com');
    setPassword('demo1234');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@demotravel.com', password: 'demo1234' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.auth.loginErrorDemo);
        setIsDemoLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError(t.common.errorGeneric);
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.auth.loginErrorDefault);
        setIsLoading(false);
        return;
      }

      // Redirect — don't reset loading so UI stays in loading state during navigation
      window.location.href = '/dashboard';
    } catch {
      setError(t.common.errorGeneric);
      setIsLoading(false);
    }
  };

  const canSubmit = email.trim() !== '' && password.trim() !== '';

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', width: '100%' }}>
      {/* Left Side - Branding */}
      {!isMobile && (
      <div
        style={{
          width: isTablet ? '40%' : '45%',
          background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isTablet ? '28px' : '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(211, 47, 47, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/logo-dark.png"
            alt="GEZMA"
            width={42}
            height={42}
            style={{ objectFit: 'contain' }}
          />
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            {t.auth.brandName}
          </span>
        </div>

        {/* Center Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(211, 47, 47, 0.15)',
              border: '1px solid rgba(211, 47, 47, 0.25)',
              marginBottom: '24px',
            }}
          >
            <span style={{ color: '#FCA5A5', fontSize: '13px', fontWeight: '600' }}>
              {t.auth.platformBadge}
            </span>
          </div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '800',
              lineHeight: '1.2',
              color: 'white',
              margin: '0 0 16px 0',
              letterSpacing: '-0.5px',
            }}
          >
            {t.auth.loginHeadline}{' '}
            <span style={{ color: '#FCA5A5' }}>{t.auth.loginHeadlineAccent}</span>
          </h1>
          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: 'rgba(255, 255, 255, 0.65)',
              margin: 0,
            }}
          >
            {t.auth.loginDescription}
          </p>

          {/* Feature list */}
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              t.auth.loginFeature1,
              t.auth.loginFeature2,
              t.auth.loginFeature3,
            ].map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check style={{ width: '12px', height: '12px', color: '#34D399' }} />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.35)', margin: 0 }}>
            &copy; {t.auth.copyright}
          </p>
        </div>
      </div>
      )}

      {/* Right Side - Login Form */}
      <div
        style={{
          width: isMobile ? '100%' : isTablet ? '60%' : '55%',
          flex: isMobile ? '1' : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          padding: isMobile ? '24px 20px' : '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Mobile branding header */}
          {isMobile && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <Image
                src="/logo-light.png"
                alt="GEZMA"
                width={48}
                height={48}
                style={{ objectFit: 'contain', marginBottom: '12px' }}
              />
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', letterSpacing: '-0.5px' }}>
                {t.auth.brandName}
              </span>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0 0' }}>
                {t.auth.platformBadge}
              </p>
            </div>
          )}
          {/* Logo for form side - desktop/tablet only */}
          {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <Image
              src="/logo-light.png"
              alt="GEZMA"
              width={36}
              height={36}
              style={{ objectFit: 'contain' }}
            />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', letterSpacing: '-0.5px' }}>
              {t.auth.brandName}
            </span>
          </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: isMobile ? '24px' : '32px', textAlign: isMobile ? 'center' : undefined }}>
            <h2
              style={{
                fontSize: isMobile ? '22px' : '26px',
                fontWeight: '700',
                color: '#1E293B',
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px',
              }}
            >
              {t.auth.welcomeTitle}
            </h2>
            <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#64748B', margin: 0 }}>
              {t.auth.loginSubtitle}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: '700' }}>!</span>
              </div>
              <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
                >
                  {t.auth.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    color: '#1E293B',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#D32F2F';
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(211, 47, 47, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.background = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    htmlFor="password"
                    style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}
                  >
                    {t.auth.passwordLabel}
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{ fontSize: '12px', fontWeight: '600', color: '#D32F2F', textDecoration: 'none' }}
                  >
                    {t.auth.forgotPassword}
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 44px 0 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#D32F2F';
                      e.target.style.background = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(211, 47, 47, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.background = '#F8FAFC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#94A3B8',
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              style={{
                width: '100%',
                height: '48px',
                marginTop: '28px',
                borderRadius: '12px',
                border: 'none',
                background:
                  !canSubmit || isLoading
                    ? '#E2E8F0'
                    : 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                color: !canSubmit || isLoading ? '#94A3B8' : 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: !canSubmit || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow:
                  !canSubmit || isLoading ? 'none' : '0 4px 12px rgba(211, 47, 47, 0.25)',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  {t.auth.loginLoading}
                </>
              ) : (
                t.auth.loginButton
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>{t.common.or}</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading || isDemoLoading}
              style={{
                width: '100%',
                height: '48px',
                marginTop: '16px',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                background: isLoading || isDemoLoading ? '#F1F5F9' : '#FFFFFF',
                color: isLoading || isDemoLoading ? '#94A3B8' : '#475569',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || isDemoLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              {isDemoLoading ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  {t.auth.demoLoading}
                </>
              ) : (
                <>
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  {t.auth.demoButton}
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p
            style={{
              textAlign: 'center',
              fontSize: isMobile ? '13px' : '14px',
              color: '#64748B',
              marginTop: isMobile ? '24px' : '28px',
            }}
          >
            {t.auth.registerPrompt}{' '}
            <Link
              href="/register"
              style={{ color: '#D32F2F', fontWeight: '600', textDecoration: 'none' }}
            >
              {t.auth.registerLink}
            </Link>
          </p>

          {/* Mobile footer */}
          {isMobile && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#CBD5E1', marginTop: '32px' }}>
              &copy; 2026 GEZMA Technology
            </p>
          )}
        </div>
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
