'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewPilgrimPage() {
  const router = useRouter();
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
      // Validate NIK length
      if (form.nik.length !== 16) {
        setError('NIK harus 16 digit');
        setSaving(false);
        return;
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // TODO: Replace with real API call when Pilgrim model is in Prisma
      // const res = await fetch('/api/pilgrims', { method: 'POST', body: JSON.stringify(form) });
      // if (!res.ok) throw new Error('Failed to create pilgrim');

      router.push('/pilgrims');
    } catch {
      setError('Gagal menyimpan data jemaah. Silakan coba lagi.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pilgrims">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader title="Tambah Jemaah Baru" description="Masukkan data jemaah" />
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
                  onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
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
                  onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, ''))}
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
                  placeholder="Jl. Merdeka No. 123, RT 01/RW 02, Kelurahan Menteng"
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

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/pilgrims">
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
                Simpan Jemaah
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
