'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Building2, User, Lock, ChevronRight, ChevronLeft, Check, Loader2, Eye, EyeOff } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Data Agency', icon: Building2 },
  { number: 2, label: 'Data PIC', icon: User },
  { number: 3, label: 'Buat Password', icon: Lock },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: '',
    legalName: '',
    ppiuNumber: '',
    agencyPhone: '',
    picName: '',
    picEmail: '',
    picPhone: '',
    picPosition: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const canProceedStep1 =
    formData.agencyName.trim() !== '' &&
    formData.legalName.trim() !== '' &&
    formData.agencyPhone.trim() !== '';

  const canProceedStep2 =
    formData.picName.trim() !== '' &&
    formData.picEmail.trim() !== '' &&
    formData.picPhone.trim() !== '' &&
    formData.picPosition.trim() !== '';

  const canSubmit =
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    formData.agreeTerms;

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyName: formData.agencyName,
          legalName: formData.legalName,
          ppiuNumber: formData.ppiuNumber,
          agencyPhone: formData.agencyPhone,
          picName: formData.picName,
          picEmail: formData.picEmail,
          picPhone: formData.picPhone,
          picPosition: formData.picPosition,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal');
        setIsLoading(false);
        return;
      }

      // Auto-login: redirect to dashboard
      router.push('/dashboard');
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return { level: 0, label: '', color: '' };
    if (p.length < 8) return { level: 1, label: 'Terlalu pendek', color: '#EF4444' };
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNum = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const score = [hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;
    if (score <= 2) return { level: 2, label: 'Cukup', color: '#F59E0B' };
    if (score === 3) return { level: 3, label: 'Kuat', color: '#10B981' };
    return { level: 4, label: 'Sangat kuat', color: '#059669' };
  };

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
            Satu platform untuk mengelola jemaah, dokumen, paket, dan keberangkatan. Daftarkan agency Anda sekarang.
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

      {/* Right Side - Form */}
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
        <div style={{ width: '100%', maxWidth: '460px' }}>
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
              Daftar Agency Baru
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Lengkapi data berikut untuk mendaftarkan agency Anda
            </p>
          </div>

          {/* Step Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              marginBottom: '32px',
              padding: '16px 20px',
              background: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: isCompleted ? 'pointer' : 'default',
                    }}
                    onClick={() => isCompleted && setCurrentStep(step.number)}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isCompleted
                          ? '#059669'
                          : isActive
                            ? '#D32F2F'
                            : '#E2E8F0',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 2px 8px rgba(211, 47, 47, 0.3)' : 'none',
                      }}
                    >
                      {isCompleted ? (
                        <Check style={{ width: '16px', height: '16px', color: 'white' }} />
                      ) : (
                        <Icon
                          style={{
                            width: '16px',
                            height: '16px',
                            color: isActive ? 'white' : '#94A3B8',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: isActive || isCompleted ? '600' : '500',
                        color: isActive ? '#1E293B' : isCompleted ? '#059669' : '#94A3B8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        margin: '0 12px',
                        borderRadius: '1px',
                        background: isCompleted ? '#059669' : '#E2E8F0',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  )}
                </div>
              );
            })}
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
            {/* Step 1 */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <FormField
                  id="agencyName"
                  label="Nama Travel"
                  placeholder="Barokah Travel"
                  value={formData.agencyName}
                  onChange={handleChange}
                  required
                />
                <FormField
                  id="legalName"
                  label="Nama PT / Badan Hukum"
                  placeholder="PT. Barokah Perjalanan Wisata"
                  value={formData.legalName}
                  onChange={handleChange}
                  required
                />
                <FormField
                  id="ppiuNumber"
                  label="Nomor Izin PPIU"
                  placeholder="Contoh: 123/2024"
                  value={formData.ppiuNumber}
                  onChange={handleChange}
                  optional
                />
                <FormField
                  id="agencyPhone"
                  label="Nomor Telepon Kantor"
                  placeholder="021-12345678"
                  type="tel"
                  value={formData.agencyPhone}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <FormField
                  id="picName"
                  label="Nama Lengkap"
                  placeholder="Ahmad Fauzi"
                  value={formData.picName}
                  onChange={handleChange}
                  required
                />
                <FormField
                  id="picEmail"
                  label="Email"
                  placeholder="ahmad@barokahtravel.com"
                  type="email"
                  value={formData.picEmail}
                  onChange={handleChange}
                  required
                  hint="Akan digunakan untuk login"
                />
                <FormField
                  id="picPhone"
                  label="Nomor HP / WhatsApp"
                  placeholder="081234567890"
                  type="tel"
                  value={formData.picPhone}
                  onChange={handleChange}
                  required
                />
                <FormField
                  id="picPosition"
                  label="Jabatan"
                  placeholder="Direktur"
                  value={formData.picPosition}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 8 karakter"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
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
                  {/* Password strength */}
                  {formData.password.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: '3px',
                              borderRadius: '2px',
                              background: i <= passwordStrength().level ? passwordStrength().color : '#E2E8F0',
                              transition: 'background 0.2s ease',
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '11px', color: passwordStrength().color, fontWeight: '500' }}>
                        {passwordStrength().label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}
                  >
                    Konfirmasi Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Ketik ulang password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 44px 0 16px',
                        borderRadius: '10px',
                        border: `1.5px solid ${
                          formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword
                            ? '#EF4444'
                            : '#E2E8F0'
                        }`,
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
                        const mismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;
                        e.target.style.borderColor = mismatch ? '#EF4444' : '#E2E8F0';
                        e.target.style.background = '#F8FAFC';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
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
                      {showConfirm ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                    </button>
                  </div>
                  {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                      Password tidak cocok
                    </span>
                  )}
                </div>

                {/* Terms */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingTop: '4px' }}>
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, agreeTerms: !prev.agreeTerms }))}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: `2px solid ${formData.agreeTerms ? '#D32F2F' : '#CBD5E1'}`,
                      background: formData.agreeTerms ? '#D32F2F' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}
                  >
                    {formData.agreeTerms && <Check style={{ width: '13px', height: '13px', color: 'white' }} />}
                  </div>
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="agreeTerms"
                    style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', cursor: 'pointer' }}
                  >
                    Saya menyetujui{' '}
                    <Link href="#" style={{ color: '#D32F2F', fontWeight: '600', textDecoration: 'none' }}>
                      Syarat &amp; Ketentuan
                    </Link>{' '}
                    yang berlaku
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    flex: currentStep === 3 ? '0 0 auto' : 1,
                    height: '48px',
                    padding: '0 20px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    background: 'white',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                  Kembali
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2)
                  }
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '12px',
                    border: 'none',
                    background:
                      (currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)
                        ? '#E2E8F0'
                        : 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                    color:
                      (currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)
                        ? '#94A3B8'
                        : 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor:
                      (currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)
                        ? 'not-allowed'
                        : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow:
                      (currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)
                        ? 'none'
                        : '0 4px 12px rgba(211, 47, 47, 0.25)',
                  }}
                >
                  Selanjutnya
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '12px',
                    border: 'none',
                    background:
                      !canSubmit || isLoading
                        ? '#E2E8F0'
                        : 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                    color: !canSubmit || isLoading ? '#94A3B8' : 'white',
                    fontSize: '14px',
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
                      Mendaftarkan...
                    </>
                  ) : (
                    'Daftarkan Agency'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login link */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#64748B',
              marginTop: '28px',
            }}
          >
            Sudah punya akun?{' '}
            <Link
              href="/login"
              style={{
                color: '#D32F2F',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div:first-child > div:first-child {
            display: none !important;
          }
          div:first-child > div:last-child {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

/* Reusable form field component */
function FormField({
  id,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  required,
  optional,
  hint,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#334155',
          marginBottom: '6px',
        }}
      >
        {label}
        {optional && (
          <span style={{ fontSize: '11px', fontWeight: '400', color: '#94A3B8' }}>(opsional)</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
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
      {hint && (
        <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
          {hint}
        </span>
      )}
    </div>
  );
}
