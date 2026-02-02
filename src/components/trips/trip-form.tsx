'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tripFormSchema, type TripFormData } from '@/lib/validations/trip';
import { mockPackages } from '@/data/mock-packages';
import { formatCurrency } from '@/lib/utils';
import type { Trip } from '@/types/trip';

interface TripFormProps {
  initialData?: Partial<Trip>;
  onSubmit: (data: TripFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TripForm({ initialData, onSubmit, onCancel, isLoading }: TripFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      packageId: initialData?.packageId || '',
      departureDate: initialData?.departureDate || '',
      returnDate: initialData?.returnDate || '',
      registrationCloseDate: initialData?.registrationCloseDate || '',
      capacity: initialData?.capacity || 45,
      pricePerPerson: initialData?.pricePerPerson || 0,
      notes: initialData?.notes || '',
      flightInfo: initialData?.flightInfo || {
        departureAirline: '',
        departureFlightNo: '',
        departureDate: '',
        departureTime: '',
        departureAirport: 'CGK - Soekarno Hatta',
        departureTerminal: '',
        returnAirline: '',
        returnFlightNo: '',
        returnDate: '',
        returnTime: '',
        returnAirport: '',
        returnTerminal: '',
      },
    },
  });

  const selectedPackageId = watch('packageId');
  const selectedPackage = mockPackages.find((p) => p.id === selectedPackageId);

  // Auto-fill price when package is selected
  React.useEffect(() => {
    if (selectedPackage) {
      setValue('pricePerPerson', selectedPackage.publishedPrice);
    }
  }, [selectedPackage, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input
              id="name"
              placeholder="e.g., Umrah Reguler - Maret 2026"
              {...register('name')}
              className={errors.name ? 'border-[var(--error)]' : ''}
            />
            {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="packageId">Package</Label>
            <select
              id="packageId"
              {...register('packageId')}
              className={`w-full h-10 rounded-[12px] border px-3 text-sm ${errors.packageId ? 'border-[var(--error)]' : 'border-[var(--gray-border)]'}`}
            >
              <option value="">Select package</option>
              {mockPackages.filter((p) => p.isActive).map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - {formatCurrency(pkg.publishedPrice)}
                </option>
              ))}
            </select>
            {errors.packageId && <p className="text-xs text-[var(--error)] mt-1">{errors.packageId.message}</p>}
          </div>

          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={10}
              max={200}
              {...register('capacity', { valueAsNumber: true })}
              className={errors.capacity ? 'border-[var(--error)]' : ''}
            />
            {errors.capacity && <p className="text-xs text-[var(--error)] mt-1">{errors.capacity.message}</p>}
          </div>

          <div>
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              id="departureDate"
              type="date"
              {...register('departureDate')}
              className={errors.departureDate ? 'border-[var(--error)]' : ''}
            />
            {errors.departureDate && <p className="text-xs text-[var(--error)] mt-1">{errors.departureDate.message}</p>}
          </div>

          <div>
            <Label htmlFor="returnDate">Return Date</Label>
            <Input
              id="returnDate"
              type="date"
              {...register('returnDate')}
              className={errors.returnDate ? 'border-[var(--error)]' : ''}
            />
            {errors.returnDate && <p className="text-xs text-[var(--error)] mt-1">{errors.returnDate.message}</p>}
          </div>

          <div>
            <Label htmlFor="registrationCloseDate">Registration Close Date (Optional)</Label>
            <Input id="registrationCloseDate" type="date" {...register('registrationCloseDate')} />
          </div>

          <div>
            <Label htmlFor="pricePerPerson">Price Per Person</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--gray-600)]">Rp</span>
              <Input
                id="pricePerPerson"
                type="number"
                {...register('pricePerPerson', { valueAsNumber: true })}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Info */}
      <Card>
        <CardHeader>
          <CardTitle>Departure Flight</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Airline</Label>
            <Input placeholder="e.g., Saudi Arabian Airlines" {...register('flightInfo.departureAirline')} />
          </div>
          <div>
            <Label>Flight Number</Label>
            <Input placeholder="e.g., SV 817" {...register('flightInfo.departureFlightNo')} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register('flightInfo.departureDate')} />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" {...register('flightInfo.departureTime')} />
          </div>
          <div>
            <Label>Airport</Label>
            <Input placeholder="CGK - Soekarno Hatta" {...register('flightInfo.departureAirport')} />
          </div>
          <div>
            <Label>Terminal (Optional)</Label>
            <Input placeholder="Terminal 3" {...register('flightInfo.departureTerminal')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return Flight</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Airline</Label>
            <Input placeholder="e.g., Saudi Arabian Airlines" {...register('flightInfo.returnAirline')} />
          </div>
          <div>
            <Label>Flight Number</Label>
            <Input placeholder="e.g., SV 816" {...register('flightInfo.returnFlightNo')} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register('flightInfo.returnDate')} />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" {...register('flightInfo.returnTime')} />
          </div>
          <div>
            <Label>Airport</Label>
            <Input placeholder="JED - King Abdulaziz" {...register('flightInfo.returnAirport')} />
          </div>
          <div>
            <Label>Terminal (Optional)</Label>
            <Input {...register('flightInfo.returnTerminal')} />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea id="notes" placeholder="Any additional information..." {...register('notes')} rows={4} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
}
