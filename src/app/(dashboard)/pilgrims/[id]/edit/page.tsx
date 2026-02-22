'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, User, Phone, Shield, Bed, FileText } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

export default function EditPilgrimPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    nik: '',
    gender: 'male' as 'male' | 'female',
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
    roomNumber: '',
    roomType: '' as '' | 'single' | 'double' | 'triple' | 'quad',
    notes: '',
  });

  useEffect(() => {
    async function fetchPilgrim() {
      try {
        const res = await fetch(`/api/pilgrims/${id}`);
        if (!res.ok) throw new Error('Not found');
        const pilgrim = await res.json();
        const ec = pilgrim.emergencyContact || {};
        setForm({
          name: pilgrim.name,
          nik: pilgrim.nik,
          gender: pilgrim.gender,
          email: pilgrim.email,
          phone: pilgrim.phone,
          whatsapp: pilgrim.whatsapp || '',
          birthPlace: pilgrim.birthPlace,
          birthDate: pilgrim.birthDate,
          address: pilgrim.address,
          city: pilgrim.city,
          province: pilgrim.province,
          postalCode: pilgrim.postalCode || '',
          emergencyName: ec.name || '',
          emergencyPhone: ec.phone || '',
          emergencyRelation: ec.relation || '',
          roomNumber: pilgrim.roomNumber || '',
          roomType: (pilgrim.roomType || '') as '' | 'single' | 'double' | 'triple' | 'quad',
          notes: pilgrim.notes || '',
        });
      } catch {
        setError('Jemaah tidak ditemukan');
      } finally {
        setLoading(false);
      }
    }
    fetchPilgrim();
  }, [id]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
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
        notes: form.notes || undefined,
        roomNumber: form.roomNumber || undefined,
        roomType: form.roomType || undefined,
      };

      const res = await fetch(`/api/pilgrims/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan');
      }

      router.push(`/pilgrims/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data jemaah.');
      setSaving(false);
    }
  };

  // Shared styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    color: c.textPrimary,
    backgroundColor: c.cardBgHover,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    paddingRight: '40px',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical' as const,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: c.textMuted,
    marginBottom: '8px',
  };

  const sectionCard = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '16px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: isMobile ? '16px 20px' : '20px 28px',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {icon}
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: isMobile ? '20px' : '28px' }}>
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted, fontSize: '14px' }}>
        Memuat data...
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
            {error}
          </p>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>ID: {id}</p>
          <Link href="/pilgrims" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: c.textSecondary,
                backgroundColor: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s',
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Kembali ke Daftar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href={`/pilgrims/${id}`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px', color: c.textMuted }} />
          </div>
        </Link>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            Edit: {form.name}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            Update informasi jemaah
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            backgroundColor: c.errorLight,
            border: `1px solid ${c.error}30`,
          }}
        >
          <p style={{ fontSize: '14px', color: c.error, margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Data Pribadi */}
        {sectionCard('Data Pribadi', <User style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nama Lengkap *</label>
              <input
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ahmad Fauzi"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>NIK *</label>
              <input
                required
                value={form.nik}
                onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                placeholder="3201234567890001"
                maxLength={16}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Jenis Kelamin *</label>
              <select
                required
                value={form.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                style={selectStyle}
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tempat Lahir *</label>
              <input
                required
                value={form.birthPlace}
                onChange={(e) => updateField('birthPlace', e.target.value)}
                placeholder="Jakarta"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Tanggal Lahir *</label>
              <input
                type="date"
                required
                value={form.birthDate}
                onChange={(e) => updateField('birthDate', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Kode Pos</label>
              <input
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, ''))}
                placeholder="10310"
                maxLength={5}
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
              <label style={labelStyle}>Alamat *</label>
              <textarea
                required
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Jl. Merdeka No. 123, RT 01/RW 02, Kelurahan Menteng"
                style={textareaStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Kota *</label>
              <input
                required
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Jakarta Pusat"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Provinsi *</label>
              <input
                required
                value={form.province}
                onChange={(e) => updateField('province', e.target.value)}
                placeholder="DKI Jakarta"
                style={inputStyle}
              />
            </div>
          </div>
        ))}

        {/* Kontak */}
        {sectionCard('Kontak', <Phone style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>No. Telepon *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="081234567890"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="ahmad@email.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="6281234567890"
                style={inputStyle}
              />
            </div>
          </div>
        ))}

        {/* Kontak Darurat */}
        {sectionCard('Kontak Darurat', <Shield style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nama *</label>
              <input
                required
                value={form.emergencyName}
                onChange={(e) => updateField('emergencyName', e.target.value)}
                placeholder="Fatimah Azzahra"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>No. Telepon *</label>
              <input
                required
                value={form.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                placeholder="081234567891"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hubungan *</label>
              <input
                required
                value={form.emergencyRelation}
                onChange={(e) => updateField('emergencyRelation', e.target.value)}
                placeholder="Istri"
                style={inputStyle}
              />
            </div>
          </div>
        ))}

        {/* Penempatan Kamar */}
        {sectionCard('Penempatan Kamar', <Bed style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>No. Kamar</label>
              <input
                value={form.roomNumber}
                onChange={(e) => updateField('roomNumber', e.target.value)}
                placeholder="101"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Tipe Kamar</label>
              <select
                value={form.roomType}
                onChange={(e) => updateField('roomType', e.target.value)}
                style={selectStyle}
              >
                <option value="">-- Pilih Tipe --</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="quad">Quad</option>
              </select>
            </div>
          </div>
        ))}

        {/* Catatan */}
        {sectionCard('Catatan', <FileText style={{ width: '18px', height: '18px', color: c.textMuted }} />, (
          <div>
            <label style={labelStyle}>Catatan Tambahan</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Catatan khusus untuk jemaah ini..."
              style={textareaStyle}
            />
          </div>
        ))}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
          <Link href={`/pilgrims/${id}`} style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: c.textSecondary,
                backgroundColor: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Batal
            </button>
          </Link>
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
              transition: 'all 0.15s',
            }}
          >
            {saving ? (
              <>
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                Menyimpan...
              </>
            ) : (
              <>
                <Save style={{ width: '16px', height: '16px' }} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
