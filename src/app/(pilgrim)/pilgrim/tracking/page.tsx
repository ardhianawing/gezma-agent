'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

const GREEN = '#059669';
const GREEN_DARK = '#047857';
const GREEN_LIGHT = '#ECFDF5';

interface GroupMember {
  id: string;
  name: string;
  initials: string;
  isOnline: boolean;
  lastSeen: string;
}

const MOCK_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Ahmad Fauzi', initials: 'AF', isOnline: true, lastSeen: 'Aktif sekarang' },
  { id: '2', name: 'Siti Aisyah', initials: 'SA', isOnline: true, lastSeen: 'Aktif sekarang' },
  { id: '3', name: 'Muhammad Rizki', initials: 'MR', isOnline: false, lastSeen: '5 menit lalu' },
  { id: '4', name: 'Fatimah Zahra', initials: 'FZ', isOnline: true, lastSeen: 'Aktif sekarang' },
  { id: '5', name: 'Budi Santoso', initials: 'BS', isOnline: false, lastSeen: '15 menit lalu' },
  { id: '6', name: 'Nur Hidayah', initials: 'NH', isOnline: false, lastSeen: '1 jam lalu' },
  { id: '7', name: 'Hasan Abdullah', initials: 'HA', isOnline: true, lastSeen: 'Aktif sekarang' },
  { id: '8', name: 'Dewi Rahmawati', initials: 'DR', isOnline: false, lastSeen: '30 menit lalu' },
];

export default function TrackingPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
  };

  const onlineCount = MOCK_MEMBERS.filter(m => m.isOnline).length;

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
          {'\u{1F4CD}'} Live Tracking
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
          Pantau lokasi anggota grup secara real-time
        </p>
      </div>

      {/* Map Placeholder */}
      <div style={{
        ...cardStyle,
        padding: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%',
          height: isMobile ? '250px' : '350px',
          backgroundColor: '#E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          position: 'relative',
        }}>
          <span style={{ fontSize: '48px' }}>{'\u{1F4CD}'}</span>
          <p style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#6B7280',
            margin: 0,
          }}>
            Peta akan tersedia segera
          </p>
          <p style={{
            fontSize: '13px',
            color: '#9CA3AF',
            margin: 0,
          }}>
            Fitur peta interaktif sedang dalam pengembangan
          </p>
          {/* Decorative map dots */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '30%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: GREEN,
            boxShadow: '0 0 0 4px ' + GREEN_LIGHT,
          }} />
          <div style={{
            position: 'absolute',
            top: '40%',
            right: '25%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: GREEN,
            boxShadow: '0 0 0 4px ' + GREEN_LIGHT,
          }} />
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '50%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#9CA3AF',
            boxShadow: '0 0 0 4px #F3F4F6',
          }} />
        </div>
      </div>

      {/* Group Members Section */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>{'\u{1F465}'}</span>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: c.textPrimary,
              margin: 0,
            }}>
              Anggota Grup
            </h2>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: GREEN,
            backgroundColor: GREEN_LIGHT,
            padding: '4px 10px',
            borderRadius: '12px',
          }}>
            {onlineCount} online
          </span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {MOCK_MEMBERS.map((member) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: hoveredMember === member.id ? c.cardBgHover : 'transparent',
                transition: 'background-color 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Avatar */}
              <div style={{
                position: 'relative',
                flexShrink: 0,
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: GREEN_LIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: GREEN,
                }}>
                  {member.initials}
                </div>
                {/* Online/offline dot */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: member.isOnline ? GREEN : '#9CA3AF',
                  border: '2px solid ' + c.cardBg,
                }} />
              </div>

              {/* Name and status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: c.textPrimary,
                  margin: '0 0 2px 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {member.name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: member.isOnline ? GREEN : c.textMuted,
                  margin: 0,
                  fontWeight: member.isOnline ? 500 : 400,
                }}>
                  {member.lastSeen}
                </p>
              </div>

              {/* Location icon */}
              <span style={{
                fontSize: '16px',
                opacity: member.isOnline ? 1 : 0.4,
              }}>
                {'\u{1F4CD}'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info card */}
      <div style={{
        ...cardStyle,
        backgroundColor: GREEN_LIGHT,
        border: '1px solid ' + GREEN + '30',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{'\u{2139}\u{FE0F}'}</span>
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: GREEN_DARK,
              margin: '0 0 4px 0',
            }}>
              Tentang Live Tracking
            </p>
            <p style={{
              fontSize: '12px',
              color: GREEN_DARK,
              margin: 0,
              lineHeight: 1.6,
              opacity: 0.8,
            }}>
              Fitur ini memungkinkan Anda memantau lokasi anggota grup secara real-time selama perjalanan di Tanah Suci. Pastikan semua anggota mengaktifkan izin lokasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
