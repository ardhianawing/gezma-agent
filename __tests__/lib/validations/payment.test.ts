import { describe, it, expect } from 'vitest'
import { createPaymentSchema } from '@/lib/validations/payment'

const validPayment = {
  amount: 5000000,
  type: 'dp' as const,
  method: 'transfer' as const,
  date: '2025-03-15',
}

describe('createPaymentSchema', () => {
  it('accepts valid payment', () => {
    expect(createPaymentSchema.safeParse(validPayment).success).toBe(true)
  })

  it('rejects zero amount', () => {
    expect(createPaymentSchema.safeParse({ ...validPayment, amount: 0 }).success).toBe(false)
  })

  it('rejects negative amount', () => {
    expect(createPaymentSchema.safeParse({ ...validPayment, amount: -100 }).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(createPaymentSchema.safeParse({ ...validPayment, type: 'loan' }).success).toBe(false)
  })

  it('rejects invalid method', () => {
    expect(createPaymentSchema.safeParse({ ...validPayment, method: 'bitcoin' }).success).toBe(false)
  })

  it('rejects empty date', () => {
    expect(createPaymentSchema.safeParse({ ...validPayment, date: '' }).success).toBe(false)
  })

  it('allows optional notes', () => {
    expect(createPaymentSchema.safeParse({ ...validPayment, notes: 'DP 50%' }).success).toBe(true)
  })

  it('accepts all valid types', () => {
    for (const type of ['dp', 'installment', 'full', 'refund']) {
      expect(createPaymentSchema.safeParse({ ...validPayment, type }).success).toBe(true)
    }
  })

  it('accepts all valid methods', () => {
    for (const method of ['transfer', 'cash', 'card']) {
      expect(createPaymentSchema.safeParse({ ...validPayment, method }).success).toBe(true)
    }
  })
})
