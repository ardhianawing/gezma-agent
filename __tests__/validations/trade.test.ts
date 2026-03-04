import { describe, it, expect } from 'vitest'
import {
  createTradeProductSchema,
  updateTradeProductSchema,
  curateTradeProductSchema,
  createTradeInquirySchema,
} from '@/lib/validations/trade'

const validProduct = {
  name: 'Kurma Ajwa Premium',
  producer: 'Saudi Dates Co',
  origin: 'Madinah, Saudi Arabia',
  category: 'makanan' as const,
  description: 'Kurma Ajwa premium grade A langsung dari kebun Madinah dengan kualitas terbaik.',
  emoji: '🌴',
  moq: '100 kg',
  targetMarkets: ['Indonesia'],
  price: 'Rp 250.000/kg',
}

describe('createTradeProductSchema', () => {
  it('accepts valid product', () => {
    expect(createTradeProductSchema.safeParse(validProduct).success).toBe(true)
  })

  it('rejects name shorter than 3 chars', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, name: 'Ku' }).success).toBe(false)
  })

  it('rejects producer shorter than 2 chars', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, producer: 'S' }).success).toBe(false)
  })

  it('rejects origin shorter than 3 chars', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, origin: 'SA' }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, category: 'invalid' }).success).toBe(false)
  })

  it('accepts all valid categories', () => {
    for (const cat of ['makanan', 'buah', 'fashion', 'kosmetik', 'kerajinan', 'ibadah']) {
      expect(createTradeProductSchema.safeParse({ ...validProduct, category: cat }).success).toBe(true)
    }
  })

  it('rejects description shorter than 20 chars', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, description: 'Terlalu pendek' }).success).toBe(false)
  })

  it('rejects empty moq', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, moq: '' }).success).toBe(false)
  })

  it('rejects empty targetMarkets', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, targetMarkets: [] }).success).toBe(false)
  })

  it('rejects empty price', () => {
    expect(createTradeProductSchema.safeParse({ ...validProduct, price: '' }).success).toBe(false)
  })

  it('defaults certifications to empty array', () => {
    const result = createTradeProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.certifications).toEqual([])
  })
})

describe('updateTradeProductSchema', () => {
  it('accepts partial update', () => {
    expect(updateTradeProductSchema.safeParse({ name: 'Updated Name' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(updateTradeProductSchema.safeParse({}).success).toBe(true)
  })

  it('still validates field constraints', () => {
    expect(updateTradeProductSchema.safeParse({ name: 'Ku' }).success).toBe(false)
  })
})

describe('curateTradeProductSchema', () => {
  it('accepts active status', () => {
    expect(curateTradeProductSchema.safeParse({ status: 'active' }).success).toBe(true)
  })

  it('accepts rejected with reason', () => {
    expect(curateTradeProductSchema.safeParse({ status: 'rejected', rejectionReason: 'Tidak memenuhi syarat' }).success).toBe(true)
  })

  it('rejects invalid status', () => {
    expect(curateTradeProductSchema.safeParse({ status: 'pending' }).success).toBe(false)
  })

  it('rejects missing status', () => {
    expect(curateTradeProductSchema.safeParse({}).success).toBe(false)
  })
})

describe('createTradeInquirySchema', () => {
  it('accepts valid inquiry', () => {
    expect(createTradeInquirySchema.safeParse({ message: 'Saya tertarik dengan produk ini, bisa minta info lebih lanjut?' }).success).toBe(true)
  })

  it('rejects message shorter than 10 chars', () => {
    expect(createTradeInquirySchema.safeParse({ message: 'Hi' }).success).toBe(false)
  })

  it('rejects message longer than 1000 chars', () => {
    expect(createTradeInquirySchema.safeParse({ message: 'x'.repeat(1001) }).success).toBe(false)
  })
})
