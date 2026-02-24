import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  getInitials,
  slugify,
  computePricing,
  generateId,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats positive amount in IDR', () => {
    const result = formatCurrency(15000000)
    expect(result).toContain('15.000.000')
    expect(result).toContain('Rp')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('formats negative amount', () => {
    const result = formatCurrency(-500000)
    expect(result).toContain('500.000')
  })

  it('rounds to no decimals', () => {
    const result = formatCurrency(1234.56)
    expect(result).not.toContain('.56')
  })
})

describe('formatDate', () => {
  it('formats Date object in id-ID locale', () => {
    const result = formatDate(new Date('2025-03-15'))
    expect(result).toContain('2025')
    expect(result).toContain('Maret')
  })

  it('formats date string', () => {
    const result = formatDate('2025-01-01')
    expect(result).toContain('Januari')
    expect(result).toContain('2025')
  })

  it('returns original string for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  it('returns empty string for invalid Date object', () => {
    expect(formatDate(new Date('invalid'))).toBe('')
  })
})

describe('formatShortDate', () => {
  it('formats date with short month', () => {
    const result = formatShortDate('2025-03-15')
    expect(result).toContain('2025')
    // Short month format in id-ID
    expect(result).toMatch(/Mar|Maret|Mrt/)
  })

  it('returns original string for invalid date string', () => {
    expect(formatShortDate('bad-date')).toBe('bad-date')
  })

  it('returns empty string for invalid Date object', () => {
    expect(formatShortDate(new Date('invalid'))).toBe('')
  })
})

describe('getInitials', () => {
  it('returns first two initials', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('handles single name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('limits to 2 characters for long names', () => {
    expect(getInitials('John Michael Doe Smith')).toBe('JM')
  })

  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})

describe('slugify', () => {
  it('converts to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world')
  })

  it('collapses multiple separators', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('-hello world-')).toBe('hello-world')
  })

  it('handles underscores', () => {
    expect(slugify('hello_world')).toBe('hello-world')
  })
})

describe('computePricing', () => {
  it('computes total HPP, margin, and published price', () => {
    const hpp = { airline: 10000000, hotel: 5000000, visa: 1000000 }
    const result = computePricing(hpp, 20)
    expect(result.totalHpp).toBe(16000000)
    expect(result.marginAmount).toBe(3200000)
    expect(result.publishedPrice).toBe(19200000)
  })

  it('handles zero margin', () => {
    const hpp = { airline: 10000000, hotel: 5000000 }
    const result = computePricing(hpp, 0)
    expect(result.marginAmount).toBe(0)
    expect(result.publishedPrice).toBe(result.totalHpp)
  })

  it('handles empty HPP', () => {
    const result = computePricing({}, 10)
    expect(result.totalHpp).toBe(0)
    expect(result.marginAmount).toBe(0)
    expect(result.publishedPrice).toBe(0)
  })

  it('handles falsy values in HPP', () => {
    const hpp = { airline: 0, hotel: 5000000 }
    const result = computePricing(hpp, 10)
    expect(result.totalHpp).toBe(5000000)
  })
})

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('returns a 7 character string', () => {
    expect(generateId()).toHaveLength(7)
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})
