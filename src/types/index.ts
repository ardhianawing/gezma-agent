// ============================================
// ENUMS & CONSTANTS
// ============================================

export const PILGRIM_STATUS = {
  LEAD: 'lead',
  DP: 'dp',
  LUNAS: 'lunas',
  DOKUMEN: 'dokumen',
  VISA: 'visa',
  READY: 'ready',
  DEPARTED: 'departed',
  COMPLETED: 'completed',
} as const;

export type PilgrimStatus = typeof PILGRIM_STATUS[keyof typeof PILGRIM_STATUS];

export const PILGRIM_STATUS_CONFIG: Record<PilgrimStatus, { label: string; color: string; bgColor: string }> = {
  lead: { label: 'Lead', color: '#6B7280', bgColor: '#F3F4F6' },
  dp: { label: 'DP', color: '#1D4ED8', bgColor: '#DBEAFE' },
  lunas: { label: 'Lunas', color: '#047857', bgColor: '#D1FAE5' },
  dokumen: { label: 'Dokumen', color: '#0F766E', bgColor: '#CCFBF1' },
  visa: { label: 'Visa Process', color: '#B45309', bgColor: '#FEF3C7' },
  ready: { label: 'Ready', color: '#6D28D9', bgColor: '#EDE9FE' },
  departed: { label: 'Departed', color: '#C2410C', bgColor: '#FFEDD5' },
  completed: { label: 'Completed', color: '#15803D', bgColor: '#DCFCE7' },
};

export const DOCUMENT_TYPE = {
  KTP: 'ktp',
  PASSPORT: 'passport',
  PHOTO: 'photo',
  VISA: 'visa',
  HEALTH_CERT: 'health_cert',
  BOOK_NIKAH: 'book_nikah',
} as const;

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];

export const DOCUMENT_STATUS = {
  MISSING: 'missing',
  UPLOADED: 'uploaded',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  REJECTED: 'rejected',
} as const;

export type DocumentStatus = typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS];

export const PACKAGE_CATEGORY = {
  REGULAR: 'regular',
  PLUS: 'plus',
  VIP: 'vip',
  RAMADHAN: 'ramadhan',
  BUDGET: 'budget',
} as const;

export type PackageCategory = typeof PACKAGE_CATEGORY[keyof typeof PACKAGE_CATEGORY];

export const TRIP_STATUS = {
  OPEN: 'open',
  PREPARING: 'preparing',
  READY: 'ready',
  DEPARTED: 'departed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export type Gender = typeof GENDER[keyof typeof GENDER];
