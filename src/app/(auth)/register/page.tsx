'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const STEPS = [
  { number: 1, label: 'Data Agency' },
  { number: 2, label: 'Data PIC' },
  { number: 3, label: 'Buat Password' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

      router.push('/register/verify');
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden w-1/2 bg-[var(--charcoal)] lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="font-bold text-white text-lg">G</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">GEZMA Agent</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#ffffff' }}>
            Daftarkan agency Anda dan mulai kelola perjalanan Umrah.
          </h1>
          <p className="text-lg max-w-md" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Platform lengkap untuk PPIU modern. Kelola jemaah, dokumen, dan operasional dalam satu sistem.
          </p>
        </div>

        <div className="relative z-10 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          &copy; 2026 GEZMA Technology. All rights reserved.
        </div>

        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gezma-red)] rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--charcoal)]">
              Daftar Agency Baru
            </h2>
            <p className="mt-2 text-sm text-[var(--gray-600)]">
              Lengkapi data berikut untuk mendaftarkan agency Anda
            </p>
          </div>

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200"
                    style={{
                      backgroundColor:
                        currentStep > step.number
                          ? '#166534'
                          : currentStep === step.number
                            ? 'var(--gezma-red)'
                            : 'var(--gray-200)',
                      color:
                        currentStep >= step.number
                          ? '#ffffff'
                          : 'var(--gray-500)',
                    }}
                  >
                    {currentStep > step.number ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3 4.3L6 11.6L2.7 8.3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className="mt-1.5 text-xs font-medium whitespace-nowrap"
                    style={{
                      color:
                        currentStep >= step.number
                          ? 'var(--charcoal)'
                          : 'var(--gray-400)',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-3 mb-6 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor:
                        currentStep > step.number
                          ? '#166534'
                          : 'var(--gray-200)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-[var(--error-light)] bg-[var(--error-50)] px-4 py-3 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1 - Data Agency */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="agencyName">Nama Travel</Label>
                  <Input
                    id="agencyName"
                    type="text"
                    placeholder="Barokah Travel"
                    value={formData.agencyName}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Nama PT</Label>
                  <Input
                    id="legalName"
                    type="text"
                    placeholder="PT. Barokah Perjalanan Wisata"
                    value={formData.legalName}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ppiuNumber">
                    Nomor Izin PPIU{' '}
                    <span className="text-[var(--gray-400)] font-normal">(opsional)</span>
                  </Label>
                  <Input
                    id="ppiuNumber"
                    type="text"
                    placeholder="Contoh: 123/2024"
                    value={formData.ppiuNumber}
                    onChange={handleChange}
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agencyPhone">Nomor Telepon Kantor</Label>
                  <Input
                    id="agencyPhone"
                    type="tel"
                    placeholder="021-12345678"
                    value={formData.agencyPhone}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 2 - Data PIC */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="picName">Nama Lengkap PIC</Label>
                  <Input
                    id="picName"
                    type="text"
                    placeholder="Ahmad Fauzi"
                    value={formData.picName}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="picEmail">Email (akan digunakan untuk login)</Label>
                  <Input
                    id="picEmail"
                    type="email"
                    placeholder="ahmad@barokahtravel.com"
                    value={formData.picEmail}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="picPhone">Nomor HP / WhatsApp</Label>
                  <Input
                    id="picPhone"
                    type="tel"
                    placeholder="08123456789"
                    value={formData.picPhone}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="picPosition">Jabatan</Label>
                  <Input
                    id="picPosition"
                    type="text"
                    placeholder="Direktur"
                    value={formData.picPosition}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 3 - Buat Password */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                  {formData.password.length > 0 && formData.password.length < 8 && (
                    <p className="text-xs text-[var(--error)]">
                      Password minimal 8 karakter
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ketik ulang password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
                  />
                  {formData.confirmPassword.length > 0 &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-[var(--error)]">
                        Password tidak cocok
                      </p>
                    )}
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--gray-300)] accent-[var(--gezma-red)] cursor-pointer"
                  />
                  <label
                    htmlFor="agreeTerms"
                    className="text-sm text-[var(--gray-600)] cursor-pointer leading-snug"
                  >
                    Saya menyetujui{' '}
                    <Link
                      href="#"
                      className="font-medium text-[var(--gezma-red)] hover:underline"
                    >
                      Syarat &amp; Ketentuan
                    </Link>{' '}
                    yang berlaku
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1 h-11 text-sm font-medium"
                >
                  Sebelumnya
                </Button>
              )}
              {currentStep < 3 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2)
                  }
                  className="flex-1 h-11 text-sm font-medium shadow-[var(--shadow-lg)] hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Selanjutnya
                </Button>
              )}
              {currentStep === 3 && (
                <Button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  className="flex-1 h-11 text-sm font-medium shadow-[var(--shadow-lg)] hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Mendaftarkan...
                    </span>
                  ) : (
                    'Daftarkan Agency'
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[var(--gray-600)]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-[var(--gezma-red)] hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
