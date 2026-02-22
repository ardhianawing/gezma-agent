'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Building2, Phone, Mail, MapPin, Calendar, Shield, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface AgencyVerification {
  id: string;
  name: string;
  legalName: string;
  ppiuNumber: string | null;
  ppiuExpiryDate: string | null;
  isVerified: boolean;
  phone: string;
  email: string;
  city: string | null;
  province: string | null;
}

export default function VerifyPage() {
  const { c } = useTheme();
  const params = useParams<{ code: string }>();
  const [agency, setAgency] = useState<AgencyVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchAgency() {
      try {
        const res = await fetch(`/api/verify/${params.code}`);
        if (res.ok) {
          const json = await res.json();
          setAgency(json.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAgency();
  }, [params.code]);

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: c.pageBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    borderRadius: '16px',
    border: `1px solid ${c.border}`,
    padding: '24px',
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <Loader2 style={{ width: '32px', height: '32px', color: c.textMuted, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (notFound || !agency) {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, width: '100%', maxWidth: '448px', textAlign: 'center', padding: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: c.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <XCircle style={{ width: '32px', height: '32px', color: c.error }} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.textPrimary, margin: '0 0 8px 0' }}>Verification Failed</h1>
          <p style={{ color: c.textMuted, margin: 0, fontSize: '14px' }}>
            This verification code is not valid. Please check the code and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.pageBg, padding: '32px 16px' }}>
      <div style={{ maxWidth: '512px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>Agency Verification</h1>
          <p style={{ color: c.textMuted, marginTop: '4px', fontSize: '14px' }}>GEZMA Verified Travel Agency</p>
        </div>

        {/* Verification Status */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: agency.isVerified ? c.successLight : c.errorLight,
            }}>
              {agency.isVerified ? (
                <CheckCircle2 style={{ width: '32px', height: '32px', color: c.success }} />
              ) : (
                <XCircle style={{ width: '32px', height: '32px', color: c.error }} />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
                {agency.isVerified ? 'Verified Agency' : 'Not Verified'}
              </h2>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
                {agency.isVerified
                  ? 'This travel agency is officially registered and verified'
                  : 'This agency could not be verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Agency Info */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: c.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 style={{ width: '24px', height: '24px', color: c.primary }} />
            </div>
            <div>
              <h3 style={{ fontWeight: '700', color: c.textPrimary, margin: 0 }}>{agency.name}</h3>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '2px 0 0 0' }}>{agency.legalName}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {agency.ppiuNumber && <InfoRow icon={Shield} label="PPIU Number" value={agency.ppiuNumber} c={c} />}
            {agency.ppiuExpiryDate && <InfoRow icon={Calendar} label="Valid Until" value={formatDate(agency.ppiuExpiryDate)} c={c} />}
            {agency.city && agency.province && <InfoRow icon={MapPin} label="Address" value={`${agency.city}, ${agency.province}`} c={c} />}
            <InfoRow icon={Phone} label="Phone" value={agency.phone} c={c} />
            <InfoRow icon={Mail} label="Email" value={agency.email} c={c} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted }}>
          <p style={{ margin: 0 }}>Verified by GEZMA</p>
          <p style={{ marginTop: '4px' }}>Verification Code: <span style={{ fontFamily: 'monospace' }}>{params.code}</span></p>
        </div>
      </div>
    </div>
  );
}

interface ThemeColors { textMuted: string; textPrimary: string; [key: string]: string }

function InfoRow({ icon: Icon, label, value, c }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: string; c: ThemeColors }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <Icon style={{ width: '20px', height: '20px', color: c.textMuted, flexShrink: 0, marginTop: '2px' }} />
      <div>
        <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '14px', color: c.textPrimary, margin: '2px 0 0 0' }}>{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
