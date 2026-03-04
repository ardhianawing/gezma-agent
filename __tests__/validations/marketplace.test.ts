import { describe, it, expect } from 'vitest'
import {
  createMarketplaceItemSchema,
  updateMarketplaceItemSchema,
  createMarketplaceReviewSchema,
} from '@/lib/validations/marketplace'

const validItem = {
  name: 'Hotel Grand Makkah',
  vendor: 'Grand Hotels',
  category: 'hotel' as const,
  description: 'Hotel bintang 5 dekat Masjidil Haram dengan fasilitas lengkap',
  emoji: '🏨',
  price: 'Rp 5.000.000/malam',
  priceAmount: 5000000,
  priceUnit: 'malam',
}

const validReview = {
  rating: 4,
  comment: 'Pelayanan sangat baik dan lokasi strategis',
}

describe('createMarketplaceItemSchema', () => {
  it('accepts valid item', () => {
    expect(createMarketplaceItemSchema.safeParse(validItem).success).toBe(true)
  })

  it('rejects name shorter than 3 chars', () => {
    expect(createMarketplaceItemSchema.safeParse({ ...validItem, name: 'Ho' }).success).toBe(false)
  })

  it('rejects vendor shorter than 2 chars', () => {
    expect(createMarketplaceItemSchema.safeParse({ ...validItem, vendor: 'G' }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(createMarketplaceItemSchema.safeParse({ ...validItem, category: 'invalid' }).success).toBe(false)
  })

  it('rejects description shorter than 10 chars', () => {
    expect(createMarketplaceItemSchema.safeParse({ ...validItem, description: 'Short' }).success).toBe(false)
  })

  it('rejects empty price', () => {
    expect(createMarketplaceItemSchema.safeParse({ ...validItem, price: '' }).success).toBe(false)
  })

  it('rejects empty priceUnit', () => {
    expect(createMarketplaceItemSchema.safeParse({ ...validItem, priceUnit: '' }).success).toBe(false)
  })

  it('accepts all valid categories', () => {
    for (const cat of ['hotel', 'visa', 'transport', 'asuransi', 'mutawwif', 'tiket']) {
      expect(createMarketplaceItemSchema.safeParse({ ...validItem, category: cat }).success).toBe(true)
    }
  })

  it('defaults emoji to 📦', () => {
    const { emoji, ...noEmoji } = validItem
    const result = createMarketplaceItemSchema.safeParse(noEmoji)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.emoji).toBe('📦')
  })

  it('defaults tags to empty array', () => {
    const result = createMarketplaceItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.tags).toEqual([])
  })
})

describe('updateMarketplaceItemSchema', () => {
  it('accepts partial update', () => {
    expect(updateMarketplaceItemSchema.safeParse({ name: 'Updated Name' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(updateMarketplaceItemSchema.safeParse({}).success).toBe(true)
  })

  it('still validates field constraints', () => {
    expect(updateMarketplaceItemSchema.safeParse({ name: 'Ho' }).success).toBe(false)
  })
})

describe('createMarketplaceReviewSchema', () => {
  it('accepts valid review', () => {
    expect(createMarketplaceReviewSchema.safeParse(validReview).success).toBe(true)
  })

  it('rejects rating below 1', () => {
    expect(createMarketplaceReviewSchema.safeParse({ ...validReview, rating: 0 }).success).toBe(false)
  })

  it('rejects rating above 5', () => {
    expect(createMarketplaceReviewSchema.safeParse({ ...validReview, rating: 6 }).success).toBe(false)
  })

  it('rejects non-integer rating', () => {
    expect(createMarketplaceReviewSchema.safeParse({ ...validReview, rating: 3.5 }).success).toBe(false)
  })

  it('rejects comment shorter than 5 chars', () => {
    expect(createMarketplaceReviewSchema.safeParse({ ...validReview, comment: 'Ok' }).success).toBe(false)
  })

  it('rejects comment longer than 500 chars', () => {
    expect(createMarketplaceReviewSchema.safeParse({ ...validReview, comment: 'x'.repeat(501) }).success).toBe(false)
  })
})
