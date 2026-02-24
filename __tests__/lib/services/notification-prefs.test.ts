import { describe, it, expect } from 'vitest'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  getDefaultPreferences,
  mergeWithDefaults,
} from '@/lib/services/notification-prefs.service'

describe('NOTIFICATION_CATEGORIES', () => {
  it('has 5 categories', () => {
    expect(NOTIFICATION_CATEGORIES).toHaveLength(5)
  })

  it('each category has key, label, description', () => {
    for (const cat of NOTIFICATION_CATEGORIES) {
      expect(cat.key).toBeTruthy()
      expect(cat.label).toBeTruthy()
      expect(cat.description).toBeTruthy()
    }
  })
})

describe('NOTIFICATION_CHANNELS', () => {
  it('has 3 channels', () => {
    expect(NOTIFICATION_CHANNELS).toHaveLength(3)
  })

  it('includes email, push, whatsapp', () => {
    const keys = NOTIFICATION_CHANNELS.map(c => c.key)
    expect(keys).toContain('email')
    expect(keys).toContain('push')
    expect(keys).toContain('whatsapp')
  })
})

describe('getDefaultPreferences', () => {
  it('returns object with all category keys', () => {
    const prefs = getDefaultPreferences()
    for (const cat of NOTIFICATION_CATEGORIES) {
      expect(prefs).toHaveProperty(cat.key)
    }
  })

  it('defaults email and push to true, whatsapp to false', () => {
    const prefs = getDefaultPreferences()
    for (const cat of NOTIFICATION_CATEGORIES) {
      expect(prefs[cat.key].email).toBe(true)
      expect(prefs[cat.key].push).toBe(true)
      expect(prefs[cat.key].whatsapp).toBe(false)
    }
  })

  it('returns a fresh object each call', () => {
    const a = getDefaultPreferences()
    const b = getDefaultPreferences()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('mergeWithDefaults', () => {
  it('returns defaults when saved is null', () => {
    expect(mergeWithDefaults(null)).toEqual(getDefaultPreferences())
  })

  it('returns defaults when saved is not an object', () => {
    expect(mergeWithDefaults('invalid' as unknown as null)).toEqual(getDefaultPreferences())
  })

  it('returns defaults when saved is an array', () => {
    expect(mergeWithDefaults([] as unknown as null)).toEqual(getDefaultPreferences())
  })

  it('preserves valid saved values', () => {
    const saved = getDefaultPreferences()
    saved.payment.whatsapp = true
    saved.trip.email = false
    const result = mergeWithDefaults(saved)
    expect(result.payment.whatsapp).toBe(true)
    expect(result.trip.email).toBe(false)
  })

  it('fills missing categories with defaults', () => {
    const saved = { payment: { email: false, push: false, whatsapp: true } }
    const result = mergeWithDefaults(saved as Record<string, Record<string, boolean>>)
    expect(result.payment.email).toBe(false)
    expect(result.document).toEqual(getDefaultPreferences().document)
    expect(result.system).toEqual(getDefaultPreferences().system)
  })

  it('fills missing channels with defaults', () => {
    const saved = { payment: { email: false } } as Record<string, Record<string, boolean>>
    const result = mergeWithDefaults(saved)
    expect(result.payment.email).toBe(false)
    expect(result.payment.push).toBe(true) // default
    expect(result.payment.whatsapp).toBe(false) // default
  })

  it('ignores non-boolean channel values', () => {
    const saved = {
      payment: { email: 'yes', push: true, whatsapp: false },
    } as unknown as Record<string, Record<string, boolean>>
    const result = mergeWithDefaults(saved)
    expect(result.payment.email).toBe(true) // falls back to default
    expect(result.payment.push).toBe(true)
  })

  it('handles invalid category value (not object)', () => {
    const saved = { payment: 'broken' } as unknown as Record<string, Record<string, boolean>>
    const result = mergeWithDefaults(saved)
    expect(result.payment).toEqual(getDefaultPreferences().payment)
  })

  it('returns immutable result (not same ref as defaults)', () => {
    const result = mergeWithDefaults(null)
    result.payment.email = false
    const fresh = getDefaultPreferences()
    expect(fresh.payment.email).toBe(true)
  })
})
