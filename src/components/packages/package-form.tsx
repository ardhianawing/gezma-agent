'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItineraryBuilder } from './itinerary-builder';
import { PricingCalculator } from './pricing-calculator';
import { packageFormSchema, type PackageFormData } from '@/lib/validations/package';
import type { Package, ItineraryDay, PricingBreakdown } from '@/types/package';

interface PackageFormProps {
  initialData?: Partial<Package>;
  onSubmit: (data: PackageFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultHpp: PricingBreakdown = {
  airline: 0,
  hotel: 0,
  visa: 0,
  transport: 0,
  meals: 0,
  guide: 0,
  insurance: 0,
  handling: 0,
  others: 0,
};

export function PackageForm({ initialData, onSubmit, onCancel, isLoading }: PackageFormProps) {
  const [itinerary, setItinerary] = React.useState<ItineraryDay[]>(initialData?.itinerary || []);
  const [hpp, setHpp] = React.useState<PricingBreakdown>(initialData?.hpp || defaultHpp);
  const [margin, setMargin] = React.useState(initialData?.margin || 25);
  const [inclusions, setInclusions] = React.useState<string[]>(initialData?.inclusions || []);
  const [exclusions, setExclusions] = React.useState<string[]>(initialData?.exclusions || []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'regular',
      description: initialData?.description || '',
      duration: initialData?.duration || 9,
      makkahHotel: initialData?.makkahHotel || '',
      makkahHotelRating: initialData?.makkahHotelRating || 4,
      makkahHotelDistance: initialData?.makkahHotelDistance || '',
      madinahHotel: initialData?.madinahHotel || '',
      madinahHotelRating: initialData?.madinahHotelRating || 4,
      madinahHotelDistance: initialData?.madinahHotelDistance || '',
      airline: initialData?.airline || '',
      isActive: initialData?.isActive ?? true,
      itinerary: [],
      hpp: defaultHpp,
      margin: 25,
      inclusions: [],
      exclusions: [],
    },
  });

  const duration = watch('duration');

  const handleFormSubmit = (data: PackageFormData) => {
    onSubmit({
      ...data,
      itinerary,
      hpp,
      margin,
      inclusions,
      exclusions,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Umrah Reguler 9 Hari"
                  {...register('name')}
                  className={errors.name ? 'border-[var(--error)]' : ''}
                />
                {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  {...register('category')}
                  className="w-full h-10 rounded-[12px] border border-[var(--gray-border)] px-3 text-sm"
                >
                  <option value="regular">Regular</option>
                  <option value="plus">Plus</option>
                  <option value="vip">VIP</option>
                  <option value="ramadhan">Ramadhan</option>
                  <option value="budget">Budget</option>
                </select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={7}
                  max={30}
                  {...register('duration', { valueAsNumber: true })}
                  className={errors.duration ? 'border-[var(--error)]' : ''}
                />
                {errors.duration && <p className="text-xs text-[var(--error)] mt-1">{errors.duration.message}</p>}
              </div>

              <div>
                <Label htmlFor="airline">Airline</Label>
                <Input
                  id="airline"
                  placeholder="e.g., Saudi Arabian Airlines"
                  {...register('airline')}
                  className={errors.airline ? 'border-[var(--error)]' : ''}
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" {...register('isActive')} className="rounded" />
                <Label htmlFor="isActive">Active Package</Label>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Package description..."
                  rows={4}
                  {...register('description')}
                  className={errors.description ? 'border-[var(--error)]' : ''}
                />
                {errors.description && <p className="text-xs text-[var(--error)] mt-1">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itinerary">
          <ItineraryBuilder value={itinerary} onChange={setItinerary} duration={duration || 9} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingCalculator hpp={hpp} margin={margin} onHppChange={setHpp} onMarginChange={setMargin} />
        </TabsContent>

        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label>Makkah Hotel</Label>
                  <Input placeholder="Hotel name" {...register('makkahHotel')} />
                </div>
                <div>
                  <Label>Rating</Label>
                  <select
                    {...register('makkahHotelRating', { valueAsNumber: true })}
                    className="w-full h-10 rounded-[12px] border border-[var(--gray-border)] px-3 text-sm"
                  >
                    <option value={3}>3 Star</option>
                    <option value={4}>4 Star</option>
                    <option value={5}>5 Star</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <Label>Distance</Label>
                  <Input placeholder="e.g., 300m dari Masjidil Haram" {...register('makkahHotelDistance')} />
                </div>
              </div>

              <div className="border-t pt-6 grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label>Madinah Hotel</Label>
                  <Input placeholder="Hotel name" {...register('madinahHotel')} />
                </div>
                <div>
                  <Label>Rating</Label>
                  <select
                    {...register('madinahHotelRating', { valueAsNumber: true })}
                    className="w-full h-10 rounded-[12px] border border-[var(--gray-border)] px-3 text-sm"
                  >
                    <option value={3}>3 Star</option>
                    <option value={4}>4 Star</option>
                    <option value={5}>5 Star</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <Label>Distance</Label>
                  <Input placeholder="e.g., 200m dari Masjid Nabawi" {...register('madinahHotelDistance')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inclusions">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <InclusionList items={inclusions} onChange={setInclusions} placeholder="Add inclusion..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <InclusionList items={exclusions} onChange={setExclusions} placeholder="Add exclusion..." />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Package' : 'Create Package'}
        </Button>
      </div>
    </form>
  );
}

function InclusionList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = React.useState('');

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
        />
        <Button type="button" variant="outline" onClick={addItem}>
          Add
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="flex-1">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-[var(--error)] hover:underline text-xs"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
