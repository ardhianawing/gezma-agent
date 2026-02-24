'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';

const PILGRIM_GREEN = '#059669';
const PILGRIM_GREEN_LIGHT = '#ECFDF5';

const STATUS_STEPS = [
  { key: 'lead', label: 'Pendaftaran' },
  { key: 'dp', label: 'DP' },
  { key: 'lunas', label: 'Lunas' },
  { key: 'dokumen', label: 'Dokumen' },
  { key: 'visa', label: 'Visa' },
  { key: 'ready', label: 'Siap' },
  { key: 'departed', label: 'Berangkat' },
  { key: 'completed', label: 'Selesai' },
];

function formatCurrency(amount: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDocStatusColor(status: string, c: ReturnType<typeof useTheme>['c']): { bg: string; text: string; label: string } {
  switch (status) {
    case 'verified':
      return { bg: '#F0FDF4', text: '#16A34A', label: 'Terverifikasi' };
    case 'uploaded':
      return { bg: '#FFFBEB', text: '#D97706', label: 'Diunggah' };
    case 'missing':
    default:
      return { bg: '#FEF2F2', text: '#DC2626', label: 'Belum Ada' };
  }
}

export default function PilgrimDashboardPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { data } = usePilgrim();

  if (!data) return null;

  const { pilgrim, trip, agency, payments, documents, totalPackagePrice, totalPaid, remainingBalance } = data;
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === pilgrim.status);
  const paymentPercentage = Math.round((totalPaid / totalPackagePrice) * 100);

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: c.textPrimary,
    margin: '0 0 14px 0',
  };

  return (
    <div>
      {/* Welcome greeting */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{
          fontSize: '14px',
          color: c.textMuted,
          margin: '0 0 2px 0',
        }}>
          Assalamu&apos;alaikum,
        </p>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: PILGRIM_GREEN_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}>
            {'\u{1F464}'}
          </span>
          {pilgrim.name}
        </h1>
      </div>

      {/* Status progress card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Status Umrah</h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}>
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.key} style={{
                display: 'flex',
                alignItems: 'center',
                flex: i < STATUS_STEPS.length - 1 ? 1 : 'none',
                minWidth: 0,
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: isMobile ? '36px' : '48px',
                }}>
                  <div style={{
                    width: isMobile ? '24px' : '28px',
                    height: isMobile ? '24px' : '28px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? PILGRIM_GREEN : c.borderLight,
                    border: isCurrent ? '3px solid ' + PILGRIM_GREEN : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: 700,
                    color: isCompleted ? '#FFFFFF' : c.textLight,
                    flexShrink: 0,
                    boxSizing: 'border-box',
                  }}>
                    {isCompleted ? '\u{2713}' : i + 1}
                  </div>
                  <span style={{
                    fontSize: isMobile ? '8px' : '10px',
                    color: isCompleted ? PILGRIM_GREEN : c.textLight,
                    fontWeight: isCurrent ? 700 : 400,
                    marginTop: '4px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}>
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: i < currentStepIndex ? PILGRIM_GREEN : c.borderLight,
                    marginTop: '-16px',
                    minWidth: '8px',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick info cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {[
          { emoji: '\u{1F4C5}', label: 'Keberangkatan', value: formatDate(trip.departureDate) },
          { emoji: '\u{2708}\u{FE0F}', label: 'Maskapai', value: trip.airline },
          { emoji: '\u{1F3E8}', label: 'Hotel Makkah', value: trip.makkahHotel + ' ' + '\u{2B50}'.repeat(trip.makkahHotelRating > 3 ? 3 : trip.makkahHotelRating) + (trip.makkahHotelRating > 3 ? '+' : '') },
          { emoji: '\u{1F3E8}', label: 'Hotel Madinah', value: trip.madinahHotel + ' ' + '\u{2B50}'.repeat(trip.madinahHotelRating > 3 ? 3 : trip.madinahHotelRating) + (trip.madinahHotelRating > 3 ? '+' : '') },
        ].map((item, i) => (
          <div key={i} style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '12px',
            padding: isMobile ? '14px' : '16px',
          }}>
            <span style={{ fontSize: '20px' }}>{item.emoji}</span>
            <p style={{
              fontSize: '11px',
              color: c.textMuted,
              margin: '6px 0 2px 0',
              fontWeight: 500,
            }}>
              {item.label}
            </p>
            <p style={{
              fontSize: '13px',
              color: c.textPrimary,
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.3,
            }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Payment summary card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ ...sectionTitleStyle, margin: 0 }}>Ringkasan Pembayaran</h2>
          <a href="/pilgrim/payments" style={{
            fontSize: '13px', fontWeight: 600, color: PILGRIM_GREEN,
            textDecoration: 'none',
          }}>
            Lihat Detail &rarr;
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: c.textMuted }}>Total Paket</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>
              {formatCurrency(totalPackagePrice)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: c.textMuted }}>Sudah Dibayar</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#16A34A' }}>
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: c.textMuted }}>Sisa Pembayaran</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: remainingBalance > 0 ? '#DC2626' : '#16A34A' }}>
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          backgroundColor: c.borderLight,
          borderRadius: '6px',
          height: '10px',
          overflow: 'hidden',
          marginBottom: '6px',
        }}>
          <div style={{
            width: paymentPercentage + '%',
            height: '100%',
            backgroundColor: PILGRIM_GREEN,
            borderRadius: '6px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{
          fontSize: '12px',
          color: c.textMuted,
          margin: 0,
          textAlign: 'right',
        }}>
          {paymentPercentage}% terbayar
        </p>

        {/* Payment history */}
        {payments.length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid ' + c.borderLight, paddingTop: '14px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: c.textMuted, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Riwayat Pembayaran
            </p>
            {payments.map((pay) => (
              <div key={pay.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid ' + c.borderLight,
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary, margin: 0 }}>
                    {pay.type}
                  </p>
                  <p style={{ fontSize: '11px', color: c.textLight, margin: '2px 0 0 0' }}>
                    {formatDate(pay.date)} - {pay.method}
                  </p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>
                  {formatCurrency(pay.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document checklist card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Kelengkapan Dokumen</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map((doc) => {
            const statusInfo = getDocStatusColor(doc.status, c);
            return (
              <div key={doc.type} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: c.pageBg,
                borderRadius: '10px',
                border: '1px solid ' + c.borderLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary }}>
                    {doc.label}
                  </span>
                  {doc.required && (
                    <span style={{ fontSize: '10px', color: '#DC2626', fontWeight: 600 }}>*</span>
                  )}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: statusInfo.text,
                  backgroundColor: statusInfo.bg,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}>
                  {statusInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agency contact card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Travel Agent</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <span style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: PILGRIM_GREEN_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}>
            {agency.logoEmoji}
          </span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
              {agency.name}
            </p>
            <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
              {agency.address}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={'https://wa.me/' + agency.whatsapp.replace(/\+/g, '')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            WhatsApp
          </a>
          <a
            href={'tel:' + agency.phone}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              backgroundColor: c.pageBg,
              color: c.textPrimary,
              border: '1px solid ' + c.border,
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Telepon
          </a>
        </div>
      </div>

      {/* Muthawwif card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Pembimbing (Muthawwif)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: PILGRIM_GREEN_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}>
            {'\u{1F9D4}'}
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
              {trip.muthawwifName}
            </p>
            <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
              {trip.muthawwifPhone}
            </p>
          </div>
          <a
            href={'https://wa.me/' + trip.muthawwifPhone.replace(/\+/g, '')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Chat
          </a>
        </div>
      </div>
    </div>
  );
}
