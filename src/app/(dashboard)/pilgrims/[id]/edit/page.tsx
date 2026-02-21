'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function EditPilgrimPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--charcoal)]">{error}</p>
          <p className="text-sm text-[var(--gray-600)] mt-1">ID: {id}</p>
          <Link href="/pilgrims">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/pilgrims/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={`Edit: ${form.name}`}
          description="Update informasi jemaah"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--charcoal)]">Data Pribadi</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ahmad Fauzi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK *</Label>
                <Input
                  id="nik"
                  required
                  value={form.nik}
                  onChange={(e) => updateField('nik', e.target.value)}
                  placeholder="3201234567890001"
                  maxLength={16}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <select
                  id="gender"
                  required
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--charcoal)] transition-all duration-200 hover:border-[var(--gray-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gezma-red)]/20 focus-visible:border-[var(--gezma-red)]"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir *</Label>
                <Input
                  id="birthPlace"
                  required
                  value={form.birthPlace}
                  onChange={(e) => updateField('birthPlace', e.target.value)}
                  placeholder="Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={form.birthDate}
                  onChange={(e) => updateField('birthDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kode Pos</Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="10310"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat *</Label>
                <Textarea
                  id="address"
                  required
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Jl. Merdeka No. 123, RT 01/RW 02..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Kota *</Label>
                <Input
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Jakarta Pusat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi *</Label>
                <Input
                  id="province"
                  required
                  value={form.province}
                  onChange={(e) => updateField('province', e.target.value)}
                  placeholder="DKI Jakarta"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--charcoal)]">Kontak</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon *</Label>
                <Input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="081234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="ahmad@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="6281234567890"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--charcoal)]">Kontak Darurat</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Nama *</Label>
                <Input
                  id="emergencyName"
                  required
                  value={form.emergencyName}
                  onChange={(e) => updateField('emergencyName', e.target.value)}
                  placeholder="Fatimah Azzahra"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">No. Telepon *</Label>
                <Input
                  id="emergencyPhone"
                  required
                  value={form.emergencyPhone}
                  onChange={(e) => updateField('emergencyPhone', e.target.value)}
                  placeholder="081234567891"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Hubungan *</Label>
                <Input
                  id="emergencyRelation"
                  required
                  value={form.emergencyRelation}
                  onChange={(e) => updateField('emergencyRelation', e.target.value)}
                  placeholder="Istri"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Assignment */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--charcoal)]">Penempatan Kamar</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">No. Kamar</Label>
                <Input
                  id="roomNumber"
                  value={form.roomNumber}
                  onChange={(e) => updateField('roomNumber', e.target.value)}
                  placeholder="101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomType">Tipe Kamar</Label>
                <select
                  id="roomType"
                  value={form.roomType}
                  onChange={(e) => updateField('roomType', e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--charcoal)] transition-all duration-200 hover:border-[var(--gray-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gezma-red)]/20 focus-visible:border-[var(--gezma-red)]"
                >
                  <option value="">-- Pilih Tipe --</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--charcoal)]">Catatan</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Catatan khusus untuk jemaah ini..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href={`/pilgrims/${id}`}>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
