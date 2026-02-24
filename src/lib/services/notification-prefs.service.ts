// Notification categories and channels

export const NOTIFICATION_CATEGORIES = [
  { key: 'payment', label: 'Pembayaran', description: 'Notifikasi saat ada pembayaran masuk atau jatuh tempo' },
  { key: 'document', label: 'Dokumen', description: 'Notifikasi status dokumen jemaah (upload, verifikasi, expired)' },
  { key: 'trip', label: 'Trip', description: 'Notifikasi perubahan status trip dan keberangkatan' },
  { key: 'pilgrim', label: 'Jemaah', description: 'Notifikasi pendaftaran jemaah baru dan perubahan status' },
  { key: 'system', label: 'Sistem', description: 'Notifikasi pembaruan sistem dan maintenance' },
] as const;

export const NOTIFICATION_CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
  { key: 'whatsapp', label: 'WhatsApp' },
] as const;

export type CategoryKey = typeof NOTIFICATION_CATEGORIES[number]['key'];
export type ChannelKey = typeof NOTIFICATION_CHANNELS[number]['key'];

// Preferences shape: { [category]: { [channel]: boolean } }
export type NotificationPreferences = Record<string, Record<string, boolean>>;

// Default preferences (all email on, push on, whatsapp off)
export function getDefaultPreferences(): NotificationPreferences {
  const prefs: NotificationPreferences = {};
  for (const cat of NOTIFICATION_CATEGORIES) {
    prefs[cat.key] = {
      email: true,
      push: true,
      whatsapp: false,
    };
  }
  return prefs;
}

// Merge saved prefs with defaults (fill in any missing keys) — immutable
export function mergeWithDefaults(saved: NotificationPreferences | null): NotificationPreferences {
  const defaults = getDefaultPreferences();
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;

  const result: NotificationPreferences = {};
  for (const cat of NOTIFICATION_CATEGORIES) {
    if (!saved[cat.key] || typeof saved[cat.key] !== 'object') {
      result[cat.key] = { ...defaults[cat.key] };
    } else {
      result[cat.key] = {};
      for (const ch of NOTIFICATION_CHANNELS) {
        result[cat.key][ch.key] = typeof saved[cat.key][ch.key] === 'boolean'
          ? saved[cat.key][ch.key]
          : defaults[cat.key][ch.key];
      }
    }
  }
  return result;
}
