'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PageHeader } from '@/components/layout/page-header';
import { Plane, Building2, FileCheck, ChevronLeft, ChevronRight, Check, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface BuilderOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

const steps = [
  {
    key: 'flight',
    title: 'Penerbangan',
    subtitle: 'Pilih maskapai penerbangan',
    icon: Plane,
    options: [
      { id: 'garuda', name: 'Garuda Indonesia', description: 'Direct flight CGK-JED, full service, bagasi 30kg', price: 15000000, icon: '🛫' },
      { id: 'saudi', name: 'Saudi Airlines', description: 'Direct flight CGK-JED, full service, bagasi 25kg', price: 12000000, icon: '✈️' },
      { id: 'lion', name: 'Lion Air', description: 'Direct flight CGK-JED, low cost carrier, bagasi 20kg', price: 9000000, icon: '🦁' },
    ] as BuilderOption[],
  },
  {
    key: 'hotel_makkah',
    title: 'Hotel Makkah',
    subtitle: 'Pilih hotel di Makkah',
    icon: Building2,
    options: [
      { id: 'hilton', name: 'Hilton Makkah (5*)', description: 'Bintang 5, jarak 800m dari Masjidil Haram, breakfast included', price: 8000000, icon: '🏨' },
      { id: 'pullman', name: 'Pullman Makkah (4*)', description: 'Bintang 4, jarak 500m dari Masjidil Haram, breakfast included', price: 5000000, icon: '🏢' },
      { id: 'grandzamzam', name: 'Grand Zam Zam (3*)', description: 'Bintang 3, jarak 200m dari Masjidil Haram, dekat dan ekonomis', price: 3000000, icon: '🕌' },
    ] as BuilderOption[],
  },
  {
    key: 'hotel_madinah',
    title: 'Hotel Madinah',
    subtitle: 'Pilih hotel di Madinah',
    icon: Building2,
    options: [
      { id: 'oberoi', name: 'Oberoi Madinah (5*)', description: 'Bintang 5, jarak 300m dari Masjid Nabawi, luxury service', price: 7000000, icon: '🏨' },
      { id: 'millennium', name: 'Millennium Madinah (4*)', description: 'Bintang 4, jarak 400m dari Masjid Nabawi, fasilitas lengkap', price: 4000000, icon: '🏢' },
      { id: 'daraltaqwa', name: 'Dar Al Taqwa (3*)', description: 'Bintang 3, jarak 100m dari Masjid Nabawi, lokasi strategis', price: 2000000, icon: '🕌' },
    ] as BuilderOption[],
  },
  {
    key: 'visa',
    title: 'Visa & Handling',
    subtitle: 'Pilih paket visa dan handling',
    icon: FileCheck,
    options: [
      { id: 'premium', name: 'Premium', description: 'Visa express 1-2 hari, handling VIP, lounge bandara, porter', price: 3000000, icon: '👑' },
      { id: 'standard', name: 'Standard', description: 'Visa reguler 3-5 hari, handling standar, meet & greet', price: 2000000, icon: '📋' },
      { id: 'basic', name: 'Basic', description: 'Visa reguler 5-7 hari, handling dasar', price: 1500000, icon: '📝' },
    ] as BuilderOption[],
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function PackageBuilderPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, BuilderOption | null>>({
    flight: null,
    hotel_makkah: null,
    hotel_madinah: null,
    visa: null,
  });

  const step = steps[currentStep];
  const selectedOption = selections[step.key];

  const totalPrice = Object.values(selections).reduce(
    (sum, opt) => sum + (opt?.price || 0),
    0
  );

  const allSelected = Object.values(selections).every(v => v !== null);

  const handleSelect = (option: BuilderOption) => {
    setSelections(prev => ({ ...prev, [step.key]: option }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = () => {
    // Store selections in sessionStorage
    sessionStorage.setItem('package-builder-selections', JSON.stringify({
      flight: selections.flight,
      hotel_makkah: selections.hotel_makkah,
      hotel_madinah: selections.hotel_madinah,
      visa: selections.visa,
      totalPrice,
    }));
    router.push('/packages/new');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.packages.newPackage}
        description={t.packages.buildNew}
      />

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
        {steps.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = i === currentStep;
          const isDone = selections[s.key] !== null;
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setCurrentStep(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: isMobile ? '6px 10px' : '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${isActive ? c.primary : isDone ? '#22C55E' : c.border}`,
                  backgroundColor: isActive ? c.primaryLight : isDone ? '#F0FDF4' : c.cardBg,
                  color: isActive ? c.primary : isDone ? '#15803D' : c.textMuted,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                {isDone ? (
                  <Check style={{ width: '14px', height: '14px' }} />
                ) : (
                  <StepIcon style={{ width: '14px', height: '14px' }} />
                )}
                {!isMobile && <span>{s.title}</span>}
                {isMobile && <span>{i + 1}</span>}
              </button>
              {i < steps.length - 1 && (
                <div style={{ width: isMobile ? '12px' : '24px', height: '1px', backgroundColor: c.border }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: c.textPrimary, margin: '0 0 4px 0' }}>
          {step.title}
        </h2>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{step.subtitle}</p>
      </div>

      {/* Options */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {step.options.map(option => {
          const isSelected = selectedOption?.id === option.id;
          return (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              style={{
                backgroundColor: c.cardBg,
                borderRadius: '12px',
                border: `2px solid ${isSelected ? c.primary : c.border}`,
                padding: isMobile ? '16px' : '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: isSelected ? `0 0 0 1px ${c.primary}` : 'none',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: c.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check style={{ width: '14px', height: '14px', color: 'white' }} />
                </div>
              )}

              <div style={{ fontSize: '36px' }}>{option.icon}</div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 4px 0' }}>
                  {option.name}
                </h3>
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.5' }}>
                  {option.description}
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: `1px solid ${c.borderLight}` }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: c.primary, margin: 0 }}>
                  {formatCurrency(option.price)}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>per jamaah</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Running total + navigation */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: isMobile ? '16px' : '20px',
          display: 'flex',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
        }}
      >
        {/* Running total */}
        <div>
          <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Total Estimasi Harga</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: c.primary, margin: '4px 0 0 0' }}>
            {formatCurrency(totalPrice)}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {Object.entries(selections).map(([key, opt]) => {
              const stepInfo = steps.find(s => s.key === key);
              return (
                <span
                  key={key}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: opt ? '#F0FDF4' : c.cardBgHover,
                    color: opt ? '#15803D' : c.textLight,
                    border: `1px solid ${opt ? '#BBF7D0' : c.borderLight}`,
                  }}
                >
                  {stepInfo?.title}: {opt ? opt.name : 'Belum dipilih'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, width: isMobile ? '100%' : undefined }}>
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: c.cardBg,
                color: c.textSecondary,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft style={{ width: '18px', height: '18px' }} />
              Sebelumnya
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: selectedOption ? c.primary : c.border,
                color: selectedOption ? 'white' : c.textLight,
                border: 'none',
                borderRadius: '8px',
                cursor: selectedOption ? 'pointer' : 'not-allowed',
                flex: isMobile ? 1 : undefined,
                minHeight: '48px',
              }}
            >
              Selanjutnya
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!allSelected}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: allSelected ? '#22C55E' : c.border,
                color: allSelected ? 'white' : c.textLight,
                border: 'none',
                borderRadius: '8px',
                cursor: allSelected ? 'pointer' : 'not-allowed',
              }}
            >
              <ShoppingCart style={{ width: '18px', height: '18px' }} />
              Buat Paket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
