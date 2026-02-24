'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const RED = '#DC2626';
const RED_LIGHT = '#FEF2F2';

interface EmergencyContact {
  category: string;
  contacts: {
    name: string;
    phone: string;
    emoji: string;
    description?: string;
  }[];
}

const EMERGENCY_DATA: EmergencyContact[] = [
  {
    category: 'Kedutaan & Konsulat',
    contacts: [
      {
        name: 'KBRI Riyadh',
        phone: '+966-11-488-2800',
        emoji: '\u{1F1EE}\u{1F1E9}',
        description: 'Kedutaan Besar RI di Riyadh',
      },
      {
        name: 'KJRI Jeddah',
        phone: '+966-12-667-6020',
        emoji: '\u{1F1EE}\u{1F1E9}',
        description: 'Konsulat Jenderal RI di Jeddah',
      },
      {
        name: 'Hotline Kemenag RI',
        phone: '1500-225',
        emoji: '\u{1F4DE}',
        description: 'Kementerian Agama Republik Indonesia',
      },
    ],
  },
  {
    category: 'Darurat Saudi Arabia',
    contacts: [
      {
        name: 'Ambulans Saudi',
        phone: '997',
        emoji: '\u{1F691}',
        description: 'Layanan ambulans darurat',
      },
      {
        name: 'Polisi Saudi',
        phone: '999',
        emoji: '\u{1F46E}',
        description: 'Kepolisian Saudi Arabia',
      },
      {
        name: 'Pemadam Kebakaran',
        phone: '998',
        emoji: '\u{1F692}',
        description: 'Layanan pemadam kebakaran',
      },
    ],
  },
  {
    category: 'Rumah Sakit',
    contacts: [
      {
        name: 'RS Al Noor (Makkah)',
        phone: '+966-12-566-5555',
        emoji: '\u{1F3E5}',
        description: 'Rumah Sakit Al Noor, Makkah',
      },
      {
        name: 'RS King Fahd (Madinah)',
        phone: '+966-14-840-1111',
        emoji: '\u{1F3E5}',
        description: 'Rumah Sakit King Fahd, Madinah',
      },
    ],
  },
];

export default function EmergencyContactsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}>
          {'\u{1F6A8}'} Kontak Darurat
        </h1>
        <p style={{
          fontSize: '14px',
          color: c.textMuted,
          margin: 0,
        }}>
          Nomor penting yang perlu Anda simpan selama perjalanan umrah
        </p>
      </div>

      {/* Warning banner */}
      <div style={{
        backgroundColor: RED_LIGHT,
        border: '1px solid #FCA5A5',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{'\u{26A0}\u{FE0F}'}</span>
        <p style={{
          fontSize: '13px',
          color: RED,
          margin: 0,
          lineHeight: 1.5,
          fontWeight: 500,
        }}>
          Simpan nomor-nomor ini di ponsel Anda. Dalam keadaan darurat, segera hubungi nomor yang sesuai.
        </p>
      </div>

      {/* Contact categories */}
      {EMERGENCY_DATA.map((group) => (
        <div key={group.category} style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '12px',
        }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: c.textPrimary,
            margin: '0 0 12px 0',
          }}>
            {group.category}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.contacts.map((contact) => (
              <a
                key={contact.phone}
                href={'tel:' + contact.phone.replace(/[^0-9+]/g, '')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: c.pageBg,
                  borderRadius: '10px',
                  border: '1px solid ' + c.borderLight,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: GREEN_LIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}>
                  {contact.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: c.textPrimary,
                    margin: '0 0 2px 0',
                  }}>
                    {contact.name}
                  </p>
                  {contact.description && (
                    <p style={{
                      fontSize: '11px',
                      color: c.textLight,
                      margin: '0 0 4px 0',
                    }}>
                      {contact.description}
                    </p>
                  )}
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: GREEN,
                    margin: 0,
                  }}>
                    {contact.phone}
                  </p>
                </div>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: GREEN,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                  color: '#FFFFFF',
                }}>
                  {'\u{1F4DE}'}
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
