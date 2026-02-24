import { describe, it, expect } from 'vitest'
import { notificationPreferencesSchema } from '@/lib/validations/notification'
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS, getDefaultPreferences } from '@/lib/services/notification-prefs.service'

describe('notificationPreferencesSchema', () => {
  it('accepts valid default preferences', () => {
    const defaults = getDefaultPreferences()
    expect(notificationPreferencesSchema.safeParse(defaults).success).toBe(true)
  })

  it('has keys for all categories', () => {
    const shape = notificationPreferencesSchema.shape
    for (const cat of NOTIFICATION_CATEGORIES) {
      expect(shape).toHaveProperty(cat.key)
    }
  })

  it('rejects missing category', () => {
    const prefs = getDefaultPreferences()
    delete (prefs as Record<string, unknown>)['payment']
    expect(notificationPreferencesSchema.safeParse(prefs).success).toBe(false)
  })

  it('rejects non-boolean channel value', () => {
    const prefs = getDefaultPreferences()
    ;(prefs as Record<string, Record<string, unknown>>)['payment']['email'] = 'yes'
    expect(notificationPreferencesSchema.safeParse(prefs).success).toBe(false)
  })

  it('accepts all-false preferences', () => {
    const prefs: Record<string, Record<string, boolean>> = {}
    for (const cat of NOTIFICATION_CATEGORIES) {
      prefs[cat.key] = {}
      for (const ch of NOTIFICATION_CHANNELS) {
        prefs[cat.key][ch.key] = false
      }
    }
    expect(notificationPreferencesSchema.safeParse(prefs).success).toBe(true)
  })
})
