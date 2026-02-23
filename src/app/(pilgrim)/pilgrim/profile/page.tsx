'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';
import { useRouter } from 'next/navigation';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDocStatusInfo(status: string): { bg: string; text: string; label: string } {
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

export default function ProfilePage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { data, logout } = usePilgrim();
  const router = useRouter();

  if (!data) return null;

  const { pilgrim, agency, documents } = data;

  const handleLogout = () => {
    logout();
    router.replace('/pilgrim/login');
  };

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

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderBottom: '1px solid ' + c.borderLight,
    gap: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: c.textMuted,
    flexShrink: 0,
    minWidth: '100px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: c.textPrimary,
    textAlign: 'right' as const,
    wordBreak: 'break-word' as const,
  };

  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const requiredDocs = documents.filter(d => d.required);
  const missingRequired = requiredDocs.filter(d => d.status === 'missing').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', paddingBottom: '80px' }}>
      {/* Profile header */}
      <div style={{
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
        border: 'none',
        color: 'white',
        borderRadius: '16px',
        padding: '32px 20px',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '12px',
          border: '3px solid rgba(255,255,255,0.5)',
        }}>
          {pilgrim.gender === 'female' ? '👩' : '👨'}
        </div>
        <h1 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 700,
          margin: '0 0 4px 0',
        }}>
          {pilgrim.name}
        </h1>
        <p style={{
          fontSize: '13px',
          opacity: 0.9,
          margin: '0 0 8px 0',
        }}>
          Kode Booking: <strong>{pilgrim.bookingCode}</strong>
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '20px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          Status: {pilgrim.status.charAt(0).toUpperCase() + pilgrim.status.slice(1)}
        </div>
      </div>

      {/* Personal info */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>👤 Data Pribadi</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Nama Lengkap', value: pilgrim.name },
            { label: 'NIK', value: pilgrim.nik },
            { label: 'Jenis Kelamin', value: pilgrim.gender === 'male' ? 'Laki-laki' : 'Perempuan' },
            { label: 'Tempat Lahir', value: pilgrim.birthPlace || '-' },
            { label: 'Tanggal Lahir', value: pilgrim.birthDate ? formatDate(pilgrim.birthDate) : '-' },
            { label: 'Alamat', value: pilgrim.address || '-' },
            { label: 'Kota', value: pilgrim.city || '-' },
            { label: 'Provinsi', value: pilgrim.province || '-' },
          ].map((row, i) => (
            <div key={i} style={{
              ...infoRowStyle,
              borderBottom: i === 7 ? 'none' : '1px solid ' + c.borderLight,
            }}>
              <span style={labelStyle}>{row.label}</span>
              <span style={valueStyle}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>📱 Kontak</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Telepon', value: pilgrim.phone },
            { label: 'Email', value: pilgrim.email },
          ].map((row, i) => (
            <div key={i} style={{
              ...infoRowStyle,
              borderBottom: i === 1 ? 'none' : '1px solid ' + c.borderLight,
            }}>
              <span style={labelStyle}>{row.label}</span>
              <span style={valueStyle}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Room assignment */}
      {(pilgrim.roomNumber || pilgrim.roomType) && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>🏨 Kamar</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            {pilgrim.roomNumber && (
              <div style={{
                padding: '14px',
                backgroundColor: GREEN_LIGHT,
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                  Nomor Kamar
                </p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: GREEN, margin: 0 }}>
                  {pilgrim.roomNumber}
                </p>
              </div>
            )}
            {pilgrim.roomType && (
              <div style={{
                padding: '14px',
                backgroundColor: GREEN_LIGHT,
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                  Tipe Kamar
                </p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: GREEN, margin: 0, textTransform: 'capitalize' }}>
                  {pilgrim.roomType}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ ...sectionTitleStyle, margin: 0 }}>📄 Dokumen</h2>
          <span style={{
            fontSize: '12px',
            color: missingRequired > 0 ? '#DC2626' : GREEN,
            fontWeight: 600,
          }}>
            {verifiedCount}/{documents.length} terverifikasi
          </span>
        </div>

        {missingRequired > 0 && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#FEF2F2',
            borderRadius: '10px',
            marginBottom: '12px',
            border: '1px solid #FCA5A5',
          }}>
            <p style={{ fontSize: '12px', color: '#DC2626', margin: 0, fontWeight: 500 }}>
              ⚠️ {missingRequired} dokumen wajib belum dilengkapi
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map(doc => {
            const statusInfo = getDocStatusInfo(doc.status);
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
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: c.textPrimary,
                  }}>
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

        <p style={{
          fontSize: '11px',
          color: c.textLight,
          margin: '12px 0 0 0',
          textAlign: 'center',
        }}>
          * Hubungi travel agent untuk mengunggah/memperbarui dokumen
        </p>
      </div>

      {/* Travel Agent */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>🏢 Travel Agent</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <span style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: GREEN_LIGHT,
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
            href={'https://wa.me/' + agency.whatsapp.replace(/[^0-9]/g, '')}
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
            💬 WhatsApp
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
            📞 Telepon
          </a>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#DC2626',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
          cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        Keluar dari Portal
      </button>

      {/* App info */}
      <p style={{
        fontSize: '11px',
        color: c.textLight,
        textAlign: 'center',
        margin: '16px 0 0 0',
      }}>
        GEZMA Pilgrim v1.0 — Portal Jemaah Umrah
      </p>
    </div>
  );
}
