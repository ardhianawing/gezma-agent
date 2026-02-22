'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
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

const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

const tabs = [
  { value: 'basic', label: 'Basic Info' },
  { value: 'itinerary', label: 'Itinerary' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'inclusions', label: 'Inclusions' },
];

export function PackageForm({ initialData, onSubmit, onCancel, isLoading }: PackageFormProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = React.useState('basic');
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

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '14px',
    color: c.textPrimary,
    backgroundColor: c.cardBgHover,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    border: `1px solid ${c.error}`,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '500',
    color: c.textMuted,
    marginBottom: '8px',
    display: 'block',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    paddingRight: '40px',
    backgroundImage: chevronSvg,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    borderRadius: '16px',
    border: `1px solid ${c.border}`,
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: isMobile ? '16px 20px' : '20px 28px',
    borderBottom: `1px solid ${c.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const cardBodyStyle: React.CSSProperties = {
    padding: isMobile ? '20px' : '28px',
  };

  const errorTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: c.error,
    marginTop: '4px',
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        backgroundColor: c.cardBgHover, borderRadius: '12px',
        overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              backgroundColor: activeTab === tab.value ? c.cardBg : 'transparent',
              color: activeTab === tab.value ? c.textPrimary : c.textMuted,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Basic Information</h3>
          </div>
          <div style={cardBodyStyle}>
            <div style={{
              display: 'grid', gap: '16px',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            }}>
              <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
                <label htmlFor="name" style={labelStyle}>Package Name</label>
                <input
                  id="name"
                  placeholder="e.g., Umrah Reguler 9 Hari"
                  {...register('name')}
                  style={errors.name ? inputErrorStyle : inputStyle}
                />
                {errors.name && <p style={errorTextStyle}>{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="category" style={labelStyle}>Category</label>
                <select id="category" {...register('category')} style={selectStyle}>
                  <option value="regular">Regular</option>
                  <option value="plus">Plus</option>
                  <option value="vip">VIP</option>
                  <option value="ramadhan">Ramadhan</option>
                  <option value="budget">Budget</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" style={labelStyle}>Duration (days)</label>
                <input
                  id="duration"
                  type="number"
                  min={7}
                  max={30}
                  {...register('duration', { valueAsNumber: true })}
                  style={errors.duration ? inputErrorStyle : inputStyle}
                />
                {errors.duration && <p style={errorTextStyle}>{errors.duration.message}</p>}
              </div>

              <div>
                <label htmlFor="airline" style={labelStyle}>Airline</label>
                <input
                  id="airline"
                  placeholder="e.g., Saudi Arabian Airlines"
                  {...register('airline')}
                  style={errors.airline ? inputErrorStyle : inputStyle}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="isActive" {...register('isActive')} style={{ borderRadius: '4px' }} />
                <label htmlFor="isActive" style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted }}>Active Package</label>
              </div>

              <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
                <label htmlFor="description" style={labelStyle}>Description</label>
                <textarea
                  id="description"
                  placeholder="Package description..."
                  rows={4}
                  {...register('description')}
                  style={{
                    ...( errors.description ? inputErrorStyle : inputStyle),
                    resize: 'vertical',
                  }}
                />
                {errors.description && <p style={errorTextStyle}>{errors.description.message}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary */}
      {activeTab === 'itinerary' && (
        <ItineraryBuilder value={itinerary} onChange={setItinerary} duration={duration || 9} />
      )}

      {/* Pricing */}
      {activeTab === 'pricing' && (
        <PricingCalculator hpp={hpp} margin={margin} onHppChange={setHpp} onMarginChange={setMargin} />
      )}

      {/* Hotels */}
      {activeTab === 'hotels' && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Hotel Information</h3>
          </div>
          <div style={cardBodyStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Makkah Hotels */}
              <div style={{
                display: 'grid', gap: '16px',
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
              }}>
                <div>
                  <label style={labelStyle}>Makkah Hotel</label>
                  <input placeholder="Hotel name" {...register('makkahHotel')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Rating</label>
                  <select {...register('makkahHotelRating', { valueAsNumber: true })} style={selectStyle}>
                    <option value={3}>3 Star</option>
                    <option value={4}>4 Star</option>
                    <option value={5}>5 Star</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Distance</label>
                  <input placeholder="e.g., 300m dari Masjidil Haram" {...register('makkahHotelDistance')} style={inputStyle} />
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${c.border}` }} />

              {/* Madinah Hotels */}
              <div style={{
                display: 'grid', gap: '16px',
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
              }}>
                <div>
                  <label style={labelStyle}>Madinah Hotel</label>
                  <input placeholder="Hotel name" {...register('madinahHotel')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Rating</label>
                  <select {...register('madinahHotelRating', { valueAsNumber: true })} style={selectStyle}>
                    <option value={3}>3 Star</option>
                    <option value={4}>4 Star</option>
                    <option value={5}>5 Star</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Distance</label>
                  <input placeholder="e.g., 200m dari Masjid Nabawi" {...register('madinahHotelDistance')} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inclusions */}
      {activeTab === 'inclusions' && (
        <div style={{
          display: 'grid', gap: '24px',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        }}>
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Inclusions</h3>
            </div>
            <div style={cardBodyStyle}>
              <InclusionList items={inclusions} onChange={setInclusions} placeholder="Add inclusion..." />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Exclusions</h3>
            </div>
            <div style={cardBodyStyle}>
              <InclusionList items={exclusions} onChange={setExclusions} placeholder="Add exclusion..." />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: c.cardBg, color: c.textSecondary, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: c.primary, color: 'white', border: 'none',
            borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Package' : 'Create Package'}
        </button>
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
  const { c } = useTheme();
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

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '14px',
    color: c.textPrimary,
    backgroundColor: c.cardBgHover,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    flex: 1,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={addItem}
          style={{
            backgroundColor: c.cardBg, color: c.textSecondary, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Add
        </button>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: c.textPrimary }}>
            <span style={{ flex: 1 }}>{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              style={{
                background: 'none', border: 'none', color: c.error,
                fontSize: '12px', cursor: 'pointer', padding: '4px 8px',
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
