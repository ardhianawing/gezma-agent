'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        setError(data.error || 'Email atau password salah');
        setIsLoading(false);
        return;
      }

      // Redirect — don't reset loading so UI stays in loading state during navigation
      window.location.href = '/dashboard';
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const canSubmit = email.trim() !== '' && password.trim() !== '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Side - Branding */}
      <div
        style={{
          width: '45%',
          background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px',
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
            GEZMA Agent
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
              Platform PPIU Modern
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
            Kelola perjalanan Umrah dengan lebih{' '}
            <span style={{ color: '#FCA5A5' }}>profesional</span>
          </h1>
          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: 'rgba(255, 255, 255, 0.65)',
              margin: 0,
            }}
          >
            Satu platform untuk mengelola jemaah, dokumen, paket, dan keberangkatan.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Manajemen jemaah & dokumen terpusat',
              'Tracking pembayaran real-time',
              'Laporan operasional otomatis',
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
            &copy; 2026 GEZMA Technology. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          width: '55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Logo for form side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <Image
              src="/logo-light.png"
              alt="GEZMA"
              width={36}
              height={36}
              style={{ objectFit: 'contain' }}
            />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', letterSpacing: '-0.5px' }}>
              GEZMA Agent
            </span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#1E293B',
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Selamat Datang
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Masukkan email dan password untuk mengakses dashboard
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
                  Alamat Email
                </label>
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
                    Password
                  </label>
                  <Link
                    href="#"
                    style={{ fontSize: '12px', fontWeight: '600', color: '#D32F2F', textDecoration: 'none' }}
                  >
                    Lupa password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
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
                  Masuk...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Register link */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#64748B',
              marginTop: '28px',
            }}
          >
            Belum punya akun?{' '}
            <Link
              href="/register"
              style={{ color: '#D32F2F', fontWeight: '600', textDecoration: 'none' }}
            >
              Daftar Agency
            </Link>
          </p>
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
