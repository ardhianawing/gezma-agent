import { describe, it, expect } from 'vitest'
import { packageFormSchema, itineraryDaySchema, pricingBreakdownSchema } from '@/lib/validations/package'

const validActivity = { id: '1', time: '08:00', title: 'Check in hotel', description: '', location: '' }

const validItineraryDay = {
  day: 1,
  title: 'Hari Pertama',
  description: 'Tiba di Madinah',
  activities: [validActivity],
  meals: ['breakfast' as const, 'lunch' as const],
  hotel: 'Hotel Grand',
  city: 'Madinah',
}

const validHpp = {
  airline: 10000000, hotel: 5000000, visa: 1000000, transport: 500000,
  meals: 300000, guide: 200000, insurance: 100000, handling: 50000, others: 0,
}

const validPackage = {
  name: 'Paket Umrah Reguler',
  category: 'regular' as const,
  description: 'Paket umrah reguler dengan penerbangan langsung dan hotel bintang 4',
  duration: 9,
  itinerary: [validItineraryDay],
  hpp: validHpp,
  margin: 15,
  makkahHotel: 'Grand Zamzam',
  makkahHotelRating: 5,
  makkahHotelDistance: '100m',
  madinahHotel: 'Oberoi Madinah',
  madinahHotelRating: 4,
  madinahHotelDistance: '200m',
  airline: 'Garuda Indonesia',
  inclusions: ['Tiket pesawat', 'Hotel'],
  exclusions: ['Koper'],
  isActive: true,
}

describe('pricingBreakdownSchema', () => {
  it('accepts valid pricing', () => {
    expect(pricingBreakdownSchema.safeParse(validHpp).success).toBe(true)
  })

  it('rejects negative values', () => {
    expect(pricingBreakdownSchema.safeParse({ ...validHpp, airline: -1 }).success).toBe(false)
  })
})

describe('itineraryDaySchema', () => {
  it('accepts valid day', () => {
    expect(itineraryDaySchema.safeParse(validItineraryDay).success).toBe(true)
  })

  it('requires at least 1 activity', () => {
    expect(itineraryDaySchema.safeParse({ ...validItineraryDay, activities: [] }).success).toBe(false)
  })

  it('requires day >= 1', () => {
    expect(itineraryDaySchema.safeParse({ ...validItineraryDay, day: 0 }).success).toBe(false)
  })

  it('requires title min 3 chars', () => {
    expect(itineraryDaySchema.safeParse({ ...validItineraryDay, title: 'Hi' }).success).toBe(false)
  })

  it('requires city min 2 chars', () => {
    expect(itineraryDaySchema.safeParse({ ...validItineraryDay, city: 'X' }).success).toBe(false)
  })
})

describe('packageFormSchema', () => {
  it('accepts valid package', () => {
    expect(packageFormSchema.safeParse(validPackage).success).toBe(true)
  })

  it('rejects name shorter than 5 chars', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, name: 'Abc' }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, category: 'luxury' }).success).toBe(false)
  })

  it('rejects description shorter than 20 chars', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, description: 'Short desc' }).success).toBe(false)
  })

  it('rejects duration less than 7', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, duration: 5 }).success).toBe(false)
  })

  it('rejects duration more than 30', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, duration: 31 }).success).toBe(false)
  })

  it('rejects empty inclusions', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, inclusions: [] }).success).toBe(false)
  })

  it('rejects margin over 100', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, margin: 150 }).success).toBe(false)
  })

  it('accepts empty exclusions', () => {
    expect(packageFormSchema.safeParse({ ...validPackage, exclusions: [] }).success).toBe(true)
  })
})
