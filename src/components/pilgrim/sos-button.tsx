'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme';

// SOS emergency button component
const RED = '#DC2626';
const RED_DARK = '#B91C1C';
const RED_LIGHT = '#FEF2F2';

interface SOSContact {
  name: string;
  phone: string;
  emoji: string;
  description: string;
}

const SOS_CONTACTS: SOSContact[] = [
  { name: 'Ambulans Saudi', phone: '997', emoji: '\u{1F691}', description: 'Layanan ambulans darurat' },
  { name: 'Polisi Saudi', phone: '999', emoji: '\u{1F46E}', description: 'Kepolisian Saudi Arabia' },
  { name: 'Pemadam Kebakaran', phone: '998', emoji: '\u{1F692}', description: 'Layanan pemadam kebakaran' },
  { name: 'KJRI Jeddah', phone: '+96612667602', emoji: '\u{1F1EE}\u{1F1E9}', description: 'Konsulat RI Jeddah' },
  { name: 'KBRI Riyadh', phone: '+966114882800', emoji: '\u{1F1EE}\u{1F1E9}', description: 'Kedutaan RI Riyadh' },
  { name: 'Kemenag RI', phone: '1500225', emoji: '\u{1F4DE}', description: 'Kementerian Agama' },
];

type SOSState = 'idle' | 'picker' | 'countdown';

export default function SOSButton() {
  const { c } = useTheme();
  const [state, setState] = useState<SOSState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [selectedContact, setSelectedContact] = useState<SOSContact>(SOS_CONTACTS[0]);

  const resetState = useCallback(() => {
    setState('idle');
    setCountdown(3);
  }, []);

  const startCountdown = useCallback((contact: SOSContact) => {
    setSelectedContact(contact);
    setCountdown(3);
    setState('countdown');
  }, []);

  useEffect(() => {
    if (state !== 'countdown') return;

    if (countdown <= 0) {
      // Log SOS alert
      fetch('/api/pilgrim-portal/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactName: selectedContact.name, contactPhone: selectedContact.phone }),
      }).catch(() => {});

      // Open phone dialer — defer resetState to avoid setState-in-effect lint error
      window.location.href = 'tel:' + selectedContact.phone;
      setTimeout(resetState, 0);
      return;
    }

    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown, selectedContact, resetState]);

  if (state === 'idle') {
    return (
      <>
        {/* SOS button - no pulse animation to avoid distraction */}
        <button
          onClick={() => setState('picker')}
          aria-label="Tombol SOS darurat"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: RED,
            color: '#FFFFFF',
            border: 'none',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = '0.7'; }}
        >
          SOS
        </button>
      </>
    );
  }

  if (state === 'picker') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pilih kontak darurat"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div style={{
          backgroundColor: c.cardBg,
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          maxWidth: '360px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: RED_LIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 12px',
            }}>
              {'\u{1F6A8}'}
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: c.textPrimary,
              margin: '0 0 4px 0',
            }}>
              Kontak Darurat
            </h2>
            <p style={{
              fontSize: '13px',
              color: c.textMuted,
              margin: 0,
            }}>
              Pilih kontak yang ingin dihubungi
            </p>
          </div>

          {/* Contact list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SOS_CONTACTS.map((contact) => (
              <button
                key={contact.phone}
                onClick={() => startCountdown(contact)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  backgroundColor: c.pageBg,
                  borderRadius: '12px',
                  border: '1px solid ' + c.borderLight,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: RED_LIGHT,
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
                  <p style={{
                    fontSize: '12px',
                    color: c.textMuted,
                    margin: 0,
                  }}>
                    {contact.phone}
                  </p>
                </div>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: RED,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                  color: '#FFFFFF',
                }}>
                  {'\u{1F4DE}'}
                </span>
              </button>
            ))}
          </div>

          {/* Cancel button */}
          <button
            onClick={resetState}
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '16px',
              borderRadius: '12px',
              border: '1px solid ' + c.border,
              backgroundColor: 'transparent',
              color: c.textSecondary,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  // Countdown state
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Menghubungi kontak darurat"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <style>{`
        @keyframes countdownPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Countdown circle */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: RED,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        animation: 'countdownPulse 1s infinite',
        border: '4px solid ' + RED_DARK,
      }}>
        <span style={{
          fontSize: '48px',
          fontWeight: 800,
          color: '#FFFFFF',
        }}>
          {countdown}
        </span>
      </div>

      {/* Info */}
      <p style={{
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: 700,
        margin: '0 0 8px 0',
        textAlign: 'center',
      }}>
        Menghubungi {selectedContact.name}
      </p>
      <p style={{
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        margin: '0 0 32px 0',
        textAlign: 'center',
      }}>
        {selectedContact.phone}
      </p>

      {/* Cancel */}
      <button
        onClick={resetState}
        autoFocus
        style={{
          padding: '14px 48px',
          borderRadius: '12px',
          border: '2px solid rgba(255,255,255,0.3)',
          backgroundColor: 'transparent',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Batalkan
      </button>
    </div>
  );
}
