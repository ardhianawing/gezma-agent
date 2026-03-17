'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

const GREEN = '#059669';
const GREEN_DARK = '#047857';
const GREEN_LIGHT = '#ECFDF5';

interface ARFeature {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const AR_FEATURES: ARFeature[] = [
  {
    id: 'tawaf',
    emoji: '\u{1F54B}',
    title: 'Simulasi Tawaf 3D',
    description: "Berjalan mengelilingi Ka'bah secara virtual dengan panduan langkah demi langkah dalam lingkungan 3D yang imersif.",
  },
  {
    id: 'sai',
    emoji: '\u{1F6B6}',
    title: "Panduan Sa'i Interaktif",
    description: "Pelajari Sa'i antara Safa dan Marwah dengan overlay AR yang menunjukkan arah, jarak, dan doa di setiap putaran.",
  },
  {
    id: 'doa',
    emoji: '\u{1F932}',
    title: 'Praktik Doa di Lokasi',
    description: 'Panduan doa dengan AR di setiap lokasi ibadah, termasuk transliterasi dan terjemahan real-time.',
  },
];

export default function ManasikARPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
  };

  const handleSubmit = () => {
    if (!email.trim()) {
      alert('Silakan masukkan alamat email Anda.');
      return;
    }
    if (!email.includes('@')) {
      alert('Silakan masukkan alamat email yang valid.');
      return;
    }
    alert('Terima kasih! Kami akan mengirimkan notifikasi ke ' + email + ' saat fitur Manasik AR tersedia.');
    setEmail('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}>
          {'\u{1F97D}'} {t.manasik.arTitle}
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
          {t.manasik.arDesc}
        </p>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
        borderRadius: '16px',
        padding: isMobile ? '32px 20px' : '48px 32px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.08)',
        }} />

        <span style={{
          fontSize: isMobile ? '64px' : '80px',
          display: 'block',
          marginBottom: '16px',
        }}>
          {'\u{1F97D}'}
        </span>
        <h2 style={{
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: 800,
          margin: '0 0 12px 0',
          lineHeight: 1.2,
        }}>
          Segera Hadir!
        </h2>
        <p style={{
          fontSize: isMobile ? '15px' : '17px',
          margin: 0,
          opacity: 0.9,
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}>
          Pengalaman belajar manasik dengan Augmented Reality
        </p>
      </div>

      {/* Feature Preview Cards */}
      <div>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: c.textPrimary,
          margin: '0 0 16px 0',
        }}>
          Fitur yang Akan Tersedia
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr 1fr',
          gap: '16px',
        }}>
          {AR_FEATURES.map((feature) => (
            <div
              key={feature.id}
              style={{
                ...cardStyle,
                transition: 'all 0.2s ease',
                transform: hoveredFeature === feature.id ? 'translateY(-4px)' : 'none',
                boxShadow: hoveredFeature === feature.id ? '0 8px 25px rgba(0,0,0,0.08)' : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Coming Soon badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '10px',
                fontWeight: 700,
                color: GREEN,
                backgroundColor: GREEN_LIGHT,
                padding: '4px 10px',
                borderRadius: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Coming Soon
              </div>

              <span style={{
                fontSize: '40px',
                display: 'block',
                marginBottom: '14px',
              }}>
                {feature.emoji}
              </span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: c.textPrimary,
                margin: '0 0 8px 0',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '13px',
                color: c.textMuted,
                margin: 0,
                lineHeight: 1.6,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Notification Section */}
      <div style={{
        ...cardStyle,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '28px', display: 'block', marginBottom: '12px' }}>
          {'\u{1F514}'}
        </span>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: c.textPrimary,
          margin: '0 0 8px 0',
        }}>
          Dapatkan Notifikasi
        </h3>
        <p style={{
          fontSize: '13px',
          color: c.textMuted,
          margin: '0 0 20px 0',
          lineHeight: 1.6,
        }}>
          Daftarkan email untuk notifikasi saat fitur ini tersedia
        </p>

        <div style={{
          display: 'flex',
          gap: '10px',
          maxWidth: '420px',
          margin: '0 auto',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh@email.com"
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid ' + c.border,
              backgroundColor: c.inputBg,
              color: c.textPrimary,
              outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              backgroundColor: GREEN,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = GREEN_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = GREEN;
            }}
          >
            Daftar Notifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
