'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, User, Phone, Shield } from 'lucide-react';
import { SectionCard, BackButton } from '@/components/shared';
import { useFormStyles } from '@/lib/hooks/use-form-styles';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/lib/i18n';

export default function NewPilgrimPage() {
  const router = useRouter();
  const { inputStyle, selectStyle, textareaStyle, labelStyle, c } = useFormStyles();
  const { isMobile } = useResponsive();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    nik: '',
    gender: 'male',
    email: '',
    phone: '',
    whatsapp: '',
    birthPlace: '',
    birthDate: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (form.nik.length !== 16) {
        setError('NIK harus 16 digit');
        setSaving(false);
        return;
      }

      const payload = {
        nik: form.nik,
        name: form.name,
        gender: form.gender,
        birthPlace: form.birthPlace,
        birthDate: form.birthDate,
        address: form.address,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode || undefined,
        phone: form.phone,
        email: form.email,
        whatsapp: form.whatsapp || undefined,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation,
        },
      };

      const res = await fetch('/api/pilgrims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.common.error);
      }

      addToast({ type: 'success', title: t.common.success });
      router.push('/pilgrims');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data jemaah. Silakan coba lagi.';
      setError(message);
      addToast({ type: 'error', title: t.common.error, description: message });
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <BackButton href="/pilgrims" />
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            Tambah Jemaah Baru
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            Masukkan data jemaah
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: c.errorLight, border: `1px solid ${c.error}30` }}>
          <p style={{ fontSize: '14px', color: c.error, margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Data Pribadi */}
        <SectionCard title="Data Pribadi" icon={<User style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nama Lengkap *</label>
              <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Ahmad Fauzi" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>NIK *</label>
              <input required value={form.nik} onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))} placeholder="3201234567890001" maxLength={16} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Jenis Kelamin *</label>
              <select required value={form.gender} onChange={(e) => updateField('gender', e.target.value)} style={selectStyle}>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tempat Lahir *</label>
              <input required value={form.birthPlace} onChange={(e) => updateField('birthPlace', e.target.value)} placeholder="Jakarta" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tanggal Lahir *</label>
              <input type="date" required value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Kode Pos</label>
              <input value={form.postalCode} onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, ''))} placeholder="10310" maxLength={5} style={inputStyle} />
            </div>
            <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
              <label style={labelStyle}>Alamat *</label>
              <textarea required value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Jl. Merdeka No. 123, RT 01/RW 02, Kelurahan Menteng" style={textareaStyle} />
            </div>
            <div>
              <label style={labelStyle}>Kota *</label>
              <input required value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Jakarta Pusat" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Provinsi *</label>
              <input required value={form.province} onChange={(e) => updateField('province', e.target.value)} placeholder="DKI Jakarta" style={inputStyle} />
            </div>
          </div>
        </SectionCard>

        {/* Kontak */}
        <SectionCard title="Kontak" icon={<Phone style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>No. Telepon *</label>
              <input required value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="081234567890" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" required value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="ahmad@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="6281234567890" style={inputStyle} />
            </div>
          </div>
        </SectionCard>

        {/* Kontak Darurat */}
        <SectionCard title="Kontak Darurat" icon={<Shield style={{ width: '18px', height: '18px', color: c.textMuted }} />}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nama *</label>
              <input required value={form.emergencyName} onChange={(e) => updateField('emergencyName', e.target.value)} placeholder="Fatimah Azzahra" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>No. Telepon *</label>
              <input required value={form.emergencyPhone} onChange={(e) => updateField('emergencyPhone', e.target.value)} placeholder="081234567891" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hubungan *</label>
              <input required value={form.emergencyRelation} onChange={(e) => updateField('emergencyRelation', e.target.value)} placeholder="Istri" style={inputStyle} />
            </div>
          </div>
        </SectionCard>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
          <BackButton href="/pilgrims" />
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: saving ? c.textMuted : c.primary,
              border: 'none',
              borderRadius: '12px',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {saving ? (
              <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> {t.common.saving}</>
            ) : (
              <><Save style={{ width: '16px', height: '16px' }} /> {t.common.save}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
