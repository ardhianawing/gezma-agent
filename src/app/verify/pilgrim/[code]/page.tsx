'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, User, Building2, Calendar, Shield, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface PilgrimVerification {
  name: string;
  nik: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  status: string;
  bookingCode: string | null;
  roomType: string | null;
  agency: {
    name: string;
    legalName: string;
    ppiuNumber: string | null;
    isVerified: boolean;
    ppiuStatus: string | null;
  };
}

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  dp: 'DP Dibayar',
  lunas: 'Lunas',
  dokumen: 'Dokumen',
  visa: 'Proses Visa',
  ready: 'Siap Berangkat',
  departed: 'Berangkat',
  completed: 'Selesai',
};

export default function PilgrimVerifyPage() {
  const { c } = useTheme();
  const params = useParams<{ code: string }>();
  const [pilgrim, setPilgrim] = useState<PilgrimVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPilgrim() {
      try {
        const res = await fetch(`/api/verify/pilgrim/${params.code}`);
        if (res.ok) {
          const json = await res.json();
          setPilgrim(json.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPilgrim();
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

  if (notFound || !pilgrim) {
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
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.textPrimary, margin: '0 0 8px 0' }}>Verifikasi Gagal</h1>
          <p style={{ color: c.textMuted, margin: 0, fontSize: '14px' }}>
            Kode verifikasi tidak valid. Silakan periksa kode dan coba lagi.
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
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>Verifikasi Jemaah</h1>
          <p style={{ color: c.textMuted, marginTop: '4px', fontSize: '14px' }}>GEZMA Verified Pilgrim</p>
        </div>

        {/* Verification Status */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: c.successLight,
            }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: c.success }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
                Data Terverifikasi
              </h2>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
                Jemaah ini terdaftar secara resmi
              </p>
            </div>
          </div>
        </div>

        {/* Pilgrim Info */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: c.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User style={{ width: '24px', height: '24px', color: c.primary }} />
            </div>
            <div>
              <h3 style={{ fontWeight: '700', color: c.textPrimary, margin: 0 }}>{pilgrim.name}</h3>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '2px 0 0 0' }}>
                {pilgrim.gender === 'male' ? 'Laki-laki' : 'Perempuan'} &bull; {pilgrim.birthPlace}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InfoRow icon={Shield} label="NIK" value={pilgrim.nik} c={c} />
            <InfoRow icon={Calendar} label="Tanggal Lahir" value={formatDate(pilgrim.birthDate)} c={c} />
            <InfoRow icon={User} label="Status" value={STATUS_LABELS[pilgrim.status] || pilgrim.status} c={c} />
            {pilgrim.bookingCode && <InfoRow icon={Shield} label="Kode Booking" value={pilgrim.bookingCode} c={c} />}
            {pilgrim.roomType && <InfoRow icon={User} label="Tipe Kamar" value={pilgrim.roomType} c={c} />}
          </div>
        </div>

        {/* Agency Info */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 style={{ width: '20px', height: '20px', color: c.textMuted }} />
            <div>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Travel Agency</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: '2px 0 0 0' }}>{pilgrim.agency.name}</p>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>{pilgrim.agency.legalName}</p>
            </div>
          </div>
          {pilgrim.agency.ppiuNumber && (
            <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, paddingLeft: '32px' }}>
              PPIU: {pilgrim.agency.ppiuNumber}
            </p>
          )}
          {pilgrim.agency.isVerified && pilgrim.agency.ppiuStatus === 'active' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '32px' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: c.success }} />
              <span style={{ fontSize: '12px', color: c.success, fontWeight: '500' }}>Agency Terverifikasi</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted }}>
          <p style={{ margin: 0 }}>Verified by GEZMA</p>
          <p style={{ marginTop: '4px' }}>Kode: <span style={{ fontFamily: 'monospace' }}>{params.code}</span></p>
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
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
