import { describe, it, expect } from 'vitest'
import { pilgrimFormSchema, pilgrimStatusSchema } from '@/lib/validations/pilgrim'

const validPilgrim = {
  nik: '3201234567890123',
  name: 'Ahmad Fauzi',
  gender: 'male' as const,
  birthPlace: 'Jakarta',
  birthDate: '1990-05-15',
  address: 'Jl. Merdeka No. 123, Jakarta Pusat',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  postalCode: '10110',
  phone: '081234567890',
  email: 'ahmad@example.com',
  whatsapp: '081234567890',
  emergencyContact: {
    name: 'Siti Fatimah',
    phone: '081298765432',
    relation: 'Istri',
  },
  notes: '',
}

describe('pilgrimFormSchema', () => {
  it('accepts valid pilgrim data', () => {
    expect(pilgrimFormSchema.safeParse(validPilgrim).success).toBe(true)
  })

  it('rejects NIK not 16 digits', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, nik: '123456' }).success).toBe(false)
  })

  it('rejects NIK with letters', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, nik: '320123456789ABCD' }).success).toBe(false)
  })

  it('rejects invalid phone format', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, phone: '12345' }).success).toBe(false)
  })

  it('accepts phone with +62 prefix', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, phone: '+6281234567890' }).success).toBe(true)
  })

  it('accepts phone with 62 prefix', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, phone: '6281234567890' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, email: 'not-email' }).success).toBe(false)
  })

  it('rejects short name', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, name: 'AB' }).success).toBe(false)
  })

  it('rejects short address', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, address: 'Short' }).success).toBe(false)
  })

  it('requires emergency contact name min 3 chars', () => {
    const data = { ...validPilgrim, emergencyContact: { ...validPilgrim.emergencyContact, name: 'AB' } }
    expect(pilgrimFormSchema.safeParse(data).success).toBe(false)
  })

  it('allows optional fields to be omitted', () => {
    const { postalCode, whatsapp, notes, ...required } = validPilgrim
    expect(pilgrimFormSchema.safeParse(required).success).toBe(true)
  })

  it('rejects very old birth date', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, birthDate: '1800-01-01' }).success).toBe(false)
  })

  it('rejects future birth date', () => {
    expect(pilgrimFormSchema.safeParse({ ...validPilgrim, birthDate: '2099-01-01' }).success).toBe(false)
  })
})

describe('pilgrimStatusSchema', () => {
  it('accepts valid status', () => {
    expect(pilgrimStatusSchema.safeParse({ status: 'lead' }).success).toBe(true)
    expect(pilgrimStatusSchema.safeParse({ status: 'completed' }).success).toBe(true)
  })

  it('rejects invalid status', () => {
    expect(pilgrimStatusSchema.safeParse({ status: 'unknown' }).success).toBe(false)
  })

  it('allows optional notes', () => {
    expect(pilgrimStatusSchema.safeParse({ status: 'dp', notes: 'DP 50%' }).success).toBe(true)
  })
})
