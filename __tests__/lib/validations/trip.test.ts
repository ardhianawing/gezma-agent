import { describe, it, expect } from 'vitest'
import { tripFormSchema, addToManifestSchema } from '@/lib/validations/trip'

const futureDate = new Date()
futureDate.setFullYear(futureDate.getFullYear() + 1)
const departureDateStr = futureDate.toISOString().split('T')[0]

const returnDate = new Date(futureDate)
returnDate.setDate(returnDate.getDate() + 9)
const returnDateStr = returnDate.toISOString().split('T')[0]

const validFlightInfo = {
  departureAirline: 'Garuda',
  departureFlightNo: 'GA401',
  departureDate: departureDateStr,
  departureTime: '10:00',
  departureAirport: 'CGK',
  returnAirline: 'Garuda',
  returnFlightNo: 'GA402',
  returnDate: returnDateStr,
  returnTime: '22:00',
  returnAirport: 'CGK',
}

const validTrip = {
  name: 'Trip Umrah Maret 2026',
  packageId: 'pkg-123',
  departureDate: departureDateStr,
  returnDate: returnDateStr,
  capacity: 45,
  flightInfo: validFlightInfo,
}

describe('tripFormSchema', () => {
  it('accepts valid trip', () => {
    expect(tripFormSchema.safeParse(validTrip).success).toBe(true)
  })

  it('rejects name shorter than 5 chars', () => {
    expect(tripFormSchema.safeParse({ ...validTrip, name: 'Trip' }).success).toBe(false)
  })

  it('rejects empty packageId', () => {
    expect(tripFormSchema.safeParse({ ...validTrip, packageId: '' }).success).toBe(false)
  })

  it('rejects capacity below 10', () => {
    expect(tripFormSchema.safeParse({ ...validTrip, capacity: 5 }).success).toBe(false)
  })

  it('rejects capacity above 200', () => {
    expect(tripFormSchema.safeParse({ ...validTrip, capacity: 250 }).success).toBe(false)
  })

  it('rejects past departure date', () => {
    expect(tripFormSchema.safeParse({ ...validTrip, departureDate: '2020-01-01' }).success).toBe(false)
  })

  it('rejects return date before departure', () => {
    const pastReturn = new Date(futureDate)
    pastReturn.setDate(pastReturn.getDate() - 1)
    const result = tripFormSchema.safeParse({
      ...validTrip,
      returnDate: pastReturn.toISOString().split('T')[0],
    })
    expect(result.success).toBe(false)
  })

  it('allows optional fields', () => {
    const result = tripFormSchema.safeParse({
      ...validTrip,
      muthawwifName: 'Ustadz Ali',
      notes: 'VIP trip',
    })
    expect(result.success).toBe(true)
  })
})

describe('addToManifestSchema', () => {
  it('accepts valid manifest entry', () => {
    expect(addToManifestSchema.safeParse({ pilgrimId: 'plg-1' }).success).toBe(true)
  })

  it('rejects empty pilgrimId', () => {
    expect(addToManifestSchema.safeParse({ pilgrimId: '' }).success).toBe(false)
  })

  it('allows optional fields', () => {
    const result = addToManifestSchema.safeParse({
      pilgrimId: 'plg-1',
      roomNumber: '301',
      seatPreference: 'window',
      mealPreference: 'halal',
      specialNeeds: 'wheelchair',
    })
    expect(result.success).toBe(true)
  })
})
