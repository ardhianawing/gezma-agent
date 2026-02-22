'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plane, User, FileText, StickyNote } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { tripFormSchema, type TripFormData } from '@/lib/validations/trip';
import { formatCurrency } from '@/lib/utils';
import type { Trip } from '@/types/trip';

interface TripFormProps {
  initialData?: Partial<Trip>;
  packages: { id: string; name: string; publishedPrice: number }[];
  onSubmit: (data: TripFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TripForm({ initialData, packages, onSubmit, onCancel, isLoading }: TripFormProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const {
    register,
    handleSubmit,
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
      muthawwifName: initialData?.muthawwifName || '',
      muthawwifPhone: initialData?.muthawwifPhone || '',
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
    boxSizing: 'border-box',
  };

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    border: `1px solid ${c.error}`,
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
    minHeight: '100px',
    resize: 'vertical' as const,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: c.textMuted,
    marginBottom: '8px',
  };

  const errorTextStyle: React.CSSProperties = {
    color: c.error,
    fontSize: '12px',
    marginTop: '4px',
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

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '20px',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Basic Info */}
      {sectionCard(
        'Trip Information',
        <Plane style={{ width: '18px', height: '18px', color: c.primary }} />,
        <>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="name" style={labelStyle}>Trip Name</label>
            <input
              id="name"
              placeholder="e.g., Umrah Reguler - Maret 2026"
              style={errors.name ? inputErrorStyle : inputStyle}
              {...register('name')}
            />
            {errors.name && <p style={errorTextStyle}>{errors.name.message}</p>}
          </div>

          <div style={gridStyle}>
            <div>
              <label htmlFor="packageId" style={labelStyle}>Package</label>
              <select
                id="packageId"
                style={errors.packageId ? { ...selectStyle, border: `1px solid ${c.error}` } : selectStyle}
                {...register('packageId')}
              >
                <option value="">Select package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - {formatCurrency(pkg.publishedPrice)}
                  </option>
                ))}
              </select>
              {errors.packageId && <p style={errorTextStyle}>{errors.packageId.message}</p>}
            </div>

            <div>
              <label htmlFor="capacity" style={labelStyle}>Capacity</label>
              <input
                id="capacity"
                type="number"
                min={10}
                max={200}
                style={errors.capacity ? inputErrorStyle : inputStyle}
                {...register('capacity', { valueAsNumber: true })}
              />
              {errors.capacity && <p style={errorTextStyle}>{errors.capacity.message}</p>}
            </div>

            <div>
              <label htmlFor="departureDate" style={labelStyle}>Departure Date</label>
              <input
                id="departureDate"
                type="date"
                style={errors.departureDate ? inputErrorStyle : inputStyle}
                {...register('departureDate')}
              />
              {errors.departureDate && <p style={errorTextStyle}>{errors.departureDate.message}</p>}
            </div>

            <div>
              <label htmlFor="returnDate" style={labelStyle}>Return Date</label>
              <input
                id="returnDate"
                type="date"
                style={errors.returnDate ? inputErrorStyle : inputStyle}
                {...register('returnDate')}
              />
              {errors.returnDate && <p style={errorTextStyle}>{errors.returnDate.message}</p>}
            </div>

            <div>
              <label htmlFor="registrationCloseDate" style={labelStyle}>Registration Close Date (Optional)</label>
              <input
                id="registrationCloseDate"
                type="date"
                style={inputStyle}
                {...register('registrationCloseDate')}
              />
            </div>
          </div>
        </>
      )}

      {/* Guide / Muthawwif */}
      {sectionCard(
        'Guide / Muthawwif (Optional)',
        <User style={{ width: '18px', height: '18px', color: c.primary }} />,
        <div style={gridStyle}>
          <div>
            <label htmlFor="muthawwifName" style={labelStyle}>Name</label>
            <input
              id="muthawwifName"
              placeholder="e.g., Ustadz Ahmad"
              style={inputStyle}
              {...register('muthawwifName')}
            />
          </div>

          <div>
            <label htmlFor="muthawwifPhone" style={labelStyle}>Phone</label>
            <input
              id="muthawwifPhone"
              placeholder="e.g., +62 812 3456 7890"
              style={inputStyle}
              {...register('muthawwifPhone')}
            />
          </div>
        </div>
      )}

      {/* Departure Flight */}
      {sectionCard(
        'Departure Flight',
        <Plane style={{ width: '18px', height: '18px', color: c.primary }} />,
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Airline</label>
            <input placeholder="e.g., Saudi Arabian Airlines" style={inputStyle} {...register('flightInfo.departureAirline')} />
          </div>
          <div>
            <label style={labelStyle}>Flight Number</label>
            <input placeholder="e.g., SV 817" style={inputStyle} {...register('flightInfo.departureFlightNo')} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" style={inputStyle} {...register('flightInfo.departureDate')} />
          </div>
          <div>
            <label style={labelStyle}>Time</label>
            <input type="time" style={inputStyle} {...register('flightInfo.departureTime')} />
          </div>
          <div>
            <label style={labelStyle}>Airport</label>
            <input placeholder="CGK - Soekarno Hatta" style={inputStyle} {...register('flightInfo.departureAirport')} />
          </div>
          <div>
            <label style={labelStyle}>Terminal (Optional)</label>
            <input placeholder="Terminal 3" style={inputStyle} {...register('flightInfo.departureTerminal')} />
          </div>
        </div>
      )}

      {/* Return Flight */}
      {sectionCard(
        'Return Flight',
        <Plane style={{ width: '18px', height: '18px', color: c.primary, transform: 'scaleX(-1)' }} />,
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Airline</label>
            <input placeholder="e.g., Saudi Arabian Airlines" style={inputStyle} {...register('flightInfo.returnAirline')} />
          </div>
          <div>
            <label style={labelStyle}>Flight Number</label>
            <input placeholder="e.g., SV 816" style={inputStyle} {...register('flightInfo.returnFlightNo')} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" style={inputStyle} {...register('flightInfo.returnDate')} />
          </div>
          <div>
            <label style={labelStyle}>Time</label>
            <input type="time" style={inputStyle} {...register('flightInfo.returnTime')} />
          </div>
          <div>
            <label style={labelStyle}>Airport</label>
            <input placeholder="JED - King Abdulaziz" style={inputStyle} {...register('flightInfo.returnAirport')} />
          </div>
          <div>
            <label style={labelStyle}>Terminal (Optional)</label>
            <input style={inputStyle} {...register('flightInfo.returnTerminal')} />
          </div>
        </div>
      )}

      {/* Notes */}
      {sectionCard(
        'Additional Notes (Optional)',
        <StickyNote style={{ width: '18px', height: '18px', color: c.primary }} />,
        <div>
          <textarea
            id="notes"
            placeholder="Any additional information..."
            rows={4}
            style={textareaStyle}
            {...register('notes')}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            backgroundColor: c.cardBg,
            color: c.textSecondary,
            border: `1px solid ${c.border}`,
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: c.primary,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Trip' : 'Create Trip'}
        </button>
      </div>
    </form>
  );
}
