'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { Users, Search, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { useLanguage } from '@/lib/i18n';

const PILGRIM_GREEN = '#059669';
const PILGRIM_GREEN_LIGHT = '#ECFDF5';

interface RoommatePreference {
  gender: string;
  ageRange: string;
  smokingPref: string;
  snoringPref: string;
  languagePref: string;
  notes: string;
  tripId: string;
}

interface MatchResult {
  name: string;
  city: string;
  score: number;
  maxScore: number;
  matchDetails: {
    ageRange: boolean;
    smokingPref: boolean;
    snoringPref: boolean;
    languagePref: boolean;
  };
}

export default function RoommatePage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const [form, setForm] = useState<RoommatePreference>({
    gender: '',
    ageRange: '',
    smokingPref: '',
    snoringPref: '',
    languagePref: '',
    notes: '',
    tripId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchMessage, setMatchMessage] = useState('');
  const [error, setError] = useState('');
  const [trips, setTrips] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Load existing preference
    fetch('/api/pilgrim-portal/roommate')
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          setForm({
            gender: data.data.gender || '',
            ageRange: data.data.ageRange || '',
            smokingPref: data.data.smokingPref || '',
            snoringPref: data.data.snoringPref || '',
            languagePref: data.data.languagePref || '',
            notes: data.data.notes || '',
            tripId: data.data.tripId || '',
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load trips for selection
    fetch('/api/pilgrim-portal/me')
      .then(r => r.json())
      .then(data => {
        if (data.trip) {
          setTrips([{ id: data.trip.id, name: data.trip.name || 'Trip Saya' }]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setError('');
    setSaved(false);

    if (!form.gender || !form.ageRange || !form.smokingPref || !form.snoringPref || !form.languagePref) {
      setError('Semua field wajib diisi kecuali catatan dan trip.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/pilgrim-portal/roommate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan preferensi');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleMatch = async () => {
    setMatchResult(null);
    setMatchMessage('');
    setMatching(true);
    try {
      const res = await fetch('/api/pilgrim-portal/roommate/match', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMatchResult(data.data);
        setMatchMessage(data.message);
      } else {
        setMatchMessage(data.error || 'Gagal mencari teman sekamar');
      }
    } catch {
      setMatchMessage('Terjadi kesalahan saat matching');
    } finally {
      setMatching(false);
    }
  };

  const selectStyle = {
    width: '100%',
    height: '44px',
    padding: '0 12px',
    fontSize: '14px',
    border: `1px solid ${c.border}`,
    borderRadius: '8px',
    backgroundColor: c.cardBg,
    color: c.textPrimary,
    cursor: 'pointer' as const,
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: c.textSecondary,
    marginBottom: '6px',
    display: 'block' as const,
  };

  if (loading) {
    return <FormSkeleton fields={6} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', maxWidth: '600px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users style={{ width: '26px', height: '26px', color: PILGRIM_GREEN }} />
          Teman Sekamar
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
          Atur preferensi teman sekamar Anda untuk mendapatkan pasangan yang cocok.
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: isMobile ? '16px' : '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Preferensi Anda</h2>

        <div>
          <label style={labelStyle}>Gender</label>
          <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={selectStyle}>
            <option value="">Pilih gender</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Rentang Usia</label>
          <select value={form.ageRange} onChange={e => setForm({ ...form, ageRange: e.target.value })} style={selectStyle}>
            <option value="">Pilih rentang usia</option>
            <option value="20-30">20 - 30 tahun</option>
            <option value="30-40">30 - 40 tahun</option>
            <option value="40-50">40 - 50 tahun</option>
            <option value="50-60">50 - 60 tahun</option>
            <option value="60+">60+ tahun</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Preferensi Merokok</label>
          <select value={form.smokingPref} onChange={e => setForm({ ...form, smokingPref: e.target.value })} style={selectStyle}>
            <option value="">Pilih preferensi</option>
            <option value="no_smoking">Tidak merokok</option>
            <option value="doesnt_matter">Tidak masalah</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Preferensi Mendengkur</label>
          <select value={form.snoringPref} onChange={e => setForm({ ...form, snoringPref: e.target.value })} style={selectStyle}>
            <option value="">Pilih preferensi</option>
            <option value="no_snoring">Tidak mendengkur</option>
            <option value="doesnt_matter">Tidak masalah</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Preferensi Bahasa</label>
          <select value={form.languagePref} onChange={e => setForm({ ...form, languagePref: e.target.value })} style={selectStyle}>
            <option value="">Pilih bahasa</option>
            <option value="indonesia">Indonesia</option>
            <option value="arabic">Arabic</option>
            <option value="english">English</option>
          </select>
        </div>

        {trips.length > 0 && (
          <div>
            <label style={labelStyle}>Trip (opsional)</label>
            <select value={form.tripId} onChange={e => setForm({ ...form, tripId: e.target.value })} style={selectStyle}>
              <option value="">Semua trip</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={labelStyle}>Catatan (opsional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Catatan tambahan..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              fontSize: '14px',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              backgroundColor: c.cardBg,
              color: c.textPrimary,
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#FEE2E2', borderRadius: '8px' }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#DC2626', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#DC2626' }}>{error}</span>
          </div>
        )}

        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: PILGRIM_GREEN_LIGHT, borderRadius: '8px' }}>
            <CheckCircle style={{ width: '16px', height: '16px', color: PILGRIM_GREEN, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: PILGRIM_GREEN }}>Preferensi berhasil disimpan!</span>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: PILGRIM_GREEN,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Save style={{ width: '18px', height: '18px' }} />
          )}
          {saving ? t.common.saving : t.common.save}
        </button>
      </div>

      {/* Match section */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: isMobile ? '16px' : '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Cari Teman Sekamar</h2>
        <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
          Simpan preferensi terlebih dahulu, lalu klik tombol di bawah untuk mencari pasangan yang cocok.
        </p>

        <button
          onClick={handleMatch}
          disabled={matching}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: matching ? 'not-allowed' : 'pointer',
            opacity: matching ? 0.6 : 1,
          }}
        >
          {matching ? (
            <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Search style={{ width: '18px', height: '18px' }} />
          )}
          {matching ? t.common.processing : t.common.search}
        </button>

        {matchMessage && !matchResult && (
          <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
            <p style={{ fontSize: '13px', color: '#D97706', margin: 0 }}>{matchMessage}</p>
          </div>
        )}

        {matchResult && (
          <div
            style={{
              padding: '16px',
              backgroundColor: PILGRIM_GREEN_LIGHT,
              borderRadius: '10px',
              border: `1px solid ${PILGRIM_GREEN}30`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: PILGRIM_GREEN }} />
              <span style={{ fontSize: '15px', fontWeight: '600', color: PILGRIM_GREEN }}>{matchMessage}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                {matchResult.name}
              </p>
              {matchResult.city && (
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Kota: {matchResult.city}</p>
              )}
              <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0 }}>
                Skor kecocokan: <strong>{matchResult.score}</strong> / {matchResult.maxScore}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {matchResult.matchDetails.ageRange && (
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D' }}>Usia cocok</span>
                )}
                {matchResult.matchDetails.smokingPref && (
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D' }}>Merokok cocok</span>
                )}
                {matchResult.matchDetails.snoringPref && (
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D' }}>Dengkur cocok</span>
                )}
                {matchResult.matchDetails.languagePref && (
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D' }}>Bahasa cocok</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
