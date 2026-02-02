'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pilgrimFormSchema, type PilgrimFormData } from '@/lib/validations/pilgrim';
import type { Pilgrim } from '@/types/pilgrim';

interface PilgrimFormProps {
  initialData?: Partial<Pilgrim>;
  onSubmit: (data: PilgrimFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PilgrimForm({ initialData, onSubmit, onCancel, isLoading }: PilgrimFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PilgrimFormData>({
    resolver: zodResolver(pilgrimFormSchema),
    defaultValues: {
      nik: initialData?.nik || '',
      name: initialData?.name || '',
      gender: initialData?.gender || undefined,
      birthPlace: initialData?.birthPlace || '',
      birthDate: initialData?.birthDate || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      province: initialData?.province || '',
      postalCode: initialData?.postalCode || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      whatsapp: initialData?.whatsapp || '',
      emergencyContact: initialData?.emergencyContact || {
        name: '',
        phone: '',
        relation: '',
      },
      notes: initialData?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="nik">NIK (National ID)</Label>
            <Input
              id="nik"
              placeholder="16 digit NIK"
              maxLength={16}
              {...register('nik')}
              className={errors.nik ? 'border-[var(--error)]' : ''}
            />
            {errors.nik && <p className="text-xs text-[var(--error)] mt-1">{errors.nik.message}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Full name as in passport"
              {...register('name')}
              className={errors.name ? 'border-[var(--error)]' : ''}
            />
            {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              {...register('gender')}
              className={`w-full h-10 rounded-[12px] border px-3 text-sm ${errors.gender ? 'border-[var(--error)]' : 'border-[var(--gray-border)]'}`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-xs text-[var(--error)] mt-1">{errors.gender.message}</p>}
          </div>

          <div>
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input
              id="birthDate"
              type="date"
              {...register('birthDate')}
              className={errors.birthDate ? 'border-[var(--error)]' : ''}
            />
            {errors.birthDate && <p className="text-xs text-[var(--error)] mt-1">{errors.birthDate.message}</p>}
          </div>

          <div>
            <Label htmlFor="birthPlace">Birth Place</Label>
            <Input
              id="birthPlace"
              placeholder="City of birth"
              {...register('birthPlace')}
              className={errors.birthPlace ? 'border-[var(--error)]' : ''}
            />
            {errors.birthPlace && <p className="text-xs text-[var(--error)] mt-1">{errors.birthPlace.message}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Full address"
              {...register('address')}
              className={errors.address ? 'border-[var(--error)]' : ''}
            />
            {errors.address && <p className="text-xs text-[var(--error)] mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              {...register('city')}
              className={errors.city ? 'border-[var(--error)]' : ''}
            />
            {errors.city && <p className="text-xs text-[var(--error)] mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              placeholder="Province"
              {...register('province')}
              className={errors.province ? 'border-[var(--error)]' : ''}
            />
            {errors.province && <p className="text-xs text-[var(--error)] mt-1">{errors.province.message}</p>}
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code (Optional)</Label>
            <Input id="postalCode" placeholder="Postal code" {...register('postalCode')} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="08xxxxxxxxxx"
              {...register('phone')}
              className={errors.phone ? 'border-[var(--error)]' : ''}
            />
            {errors.phone && <p className="text-xs text-[var(--error)] mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register('email')}
              className={errors.email ? 'border-[var(--error)]' : ''}
            />
            {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
            <Input id="whatsapp" placeholder="WhatsApp number" {...register('whatsapp')} />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="emergencyContact.name">Contact Name</Label>
            <Input
              id="emergencyContact.name"
              placeholder="Emergency contact name"
              {...register('emergencyContact.name')}
              className={errors.emergencyContact?.name ? 'border-[var(--error)]' : ''}
            />
            {errors.emergencyContact?.name && (
              <p className="text-xs text-[var(--error)] mt-1">{errors.emergencyContact.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emergencyContact.phone">Contact Phone</Label>
            <Input
              id="emergencyContact.phone"
              placeholder="Emergency contact phone"
              {...register('emergencyContact.phone')}
              className={errors.emergencyContact?.phone ? 'border-[var(--error)]' : ''}
            />
            {errors.emergencyContact?.phone && (
              <p className="text-xs text-[var(--error)] mt-1">{errors.emergencyContact.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emergencyContact.relation">Relationship</Label>
            <Input
              id="emergencyContact.relation"
              placeholder="e.g., Spouse, Parent, Child"
              {...register('emergencyContact.relation')}
              className={errors.emergencyContact?.relation ? 'border-[var(--error)]' : ''}
            />
            {errors.emergencyContact?.relation && (
              <p className="text-xs text-[var(--error)] mt-1">{errors.emergencyContact.relation.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            placeholder="Any additional information..."
            {...register('notes')}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Pilgrim' : 'Add Pilgrim'}
        </Button>
      </div>
    </form>
  );
}
