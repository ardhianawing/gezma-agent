// Permission constants
export const PERMISSIONS = {
  // Packages
  PACKAGES_VIEW: 'packages:view',
  PACKAGES_CREATE: 'packages:create',
  PACKAGES_EDIT: 'packages:edit',
  PACKAGES_DELETE: 'packages:delete',

  // Pilgrims
  PILGRIMS_VIEW: 'pilgrims:view',
  PILGRIMS_CREATE: 'pilgrims:create',
  PILGRIMS_EDIT: 'pilgrims:edit',
  PILGRIMS_DELETE: 'pilgrims:delete',

  // Trips
  TRIPS_VIEW: 'trips:view',
  TRIPS_CREATE: 'trips:create',
  TRIPS_EDIT: 'trips:edit',
  TRIPS_DELETE: 'trips:delete',

  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',

  // Payments
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_DELETE: 'payments:delete',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // Reports
  REPORTS_VIEW: 'reports:view',

  // Forum
  FORUM_CREATE: 'forum:create',
  FORUM_MODERATE: 'forum:moderate',

  // Trade Centre
  TRADE_VIEW: 'trade:view',
  TRADE_SUBMIT: 'trade:submit',

  // Foundation
  FOUNDATION_VIEW: 'foundation:view',
  FOUNDATION_CREATE: 'foundation:create',
  FOUNDATION_EDIT: 'foundation:edit',
  FOUNDATION_DELETE: 'foundation:delete',
  FOUNDATION_FINANCING_APPROVE: 'foundation:financing:approve',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const VALID_ROLES = ['owner', 'admin', 'staff', 'marketing'] as const;

// Default role → permissions matrix
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: Object.values(PERMISSIONS), // all permissions
  admin: [
    PERMISSIONS.PACKAGES_VIEW,
    PERMISSIONS.PACKAGES_CREATE,
    PERMISSIONS.PACKAGES_EDIT,
    PERMISSIONS.PACKAGES_DELETE,
    PERMISSIONS.PILGRIMS_VIEW,
    PERMISSIONS.PILGRIMS_CREATE,
    PERMISSIONS.PILGRIMS_EDIT,
    PERMISSIONS.PILGRIMS_DELETE,
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.TRIPS_CREATE,
    PERMISSIONS.TRIPS_EDIT,
    PERMISSIONS.TRIPS_DELETE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.FORUM_CREATE,
    PERMISSIONS.FORUM_MODERATE,
    PERMISSIONS.TRADE_VIEW,
    PERMISSIONS.TRADE_SUBMIT,
    PERMISSIONS.FOUNDATION_VIEW,
    PERMISSIONS.FOUNDATION_CREATE,
    PERMISSIONS.FOUNDATION_EDIT,
    PERMISSIONS.FOUNDATION_DELETE,
    PERMISSIONS.FOUNDATION_FINANCING_APPROVE,
  ],
  staff: [
    PERMISSIONS.PACKAGES_VIEW,
    PERMISSIONS.PILGRIMS_VIEW,
    PERMISSIONS.PILGRIMS_CREATE,
    PERMISSIONS.PILGRIMS_EDIT,
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.FORUM_CREATE,
    PERMISSIONS.TRADE_VIEW,
    PERMISSIONS.FOUNDATION_VIEW,
  ],
  marketing: [
    PERMISSIONS.PACKAGES_VIEW,
    PERMISSIONS.PACKAGES_CREATE,
    PERMISSIONS.PACKAGES_EDIT,
    PERMISSIONS.PILGRIMS_VIEW,
    PERMISSIONS.PILGRIMS_CREATE,
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.FORUM_CREATE,
    PERMISSIONS.TRADE_VIEW,
    PERMISSIONS.TRADE_SUBMIT,
    PERMISSIONS.FOUNDATION_VIEW,
    PERMISSIONS.FOUNDATION_CREATE,
  ],
};

// Check if a user has a given permission
// `userPermissions` is optional JSON override from the user record
export function hasPermission(
  role: string,
  permission: Permission,
  userPermissions?: Record<string, boolean> | null
): boolean {
  // Per-user override takes priority
  if (userPermissions && permission in userPermissions) {
    return userPermissions[permission];
  }

  // Fall back to role defaults
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;

  return rolePerms.includes(permission);
}

// Get all permissions for display (grouped by module)
export const PERMISSION_GROUPS = [
  {
    label: 'Paket',
    permissions: [
      { key: PERMISSIONS.PACKAGES_VIEW, label: 'Lihat' },
      { key: PERMISSIONS.PACKAGES_CREATE, label: 'Buat' },
      { key: PERMISSIONS.PACKAGES_EDIT, label: 'Edit' },
      { key: PERMISSIONS.PACKAGES_DELETE, label: 'Hapus' },
    ],
  },
  {
    label: 'Jemaah',
    permissions: [
      { key: PERMISSIONS.PILGRIMS_VIEW, label: 'Lihat' },
      { key: PERMISSIONS.PILGRIMS_CREATE, label: 'Buat' },
      { key: PERMISSIONS.PILGRIMS_EDIT, label: 'Edit' },
      { key: PERMISSIONS.PILGRIMS_DELETE, label: 'Hapus' },
    ],
  },
  {
    label: 'Trip',
    permissions: [
      { key: PERMISSIONS.TRIPS_VIEW, label: 'Lihat' },
      { key: PERMISSIONS.TRIPS_CREATE, label: 'Buat' },
      { key: PERMISSIONS.TRIPS_EDIT, label: 'Edit' },
      { key: PERMISSIONS.TRIPS_DELETE, label: 'Hapus' },
    ],
  },
  {
    label: 'User',
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: 'Lihat' },
      { key: PERMISSIONS.USERS_CREATE, label: 'Buat' },
      { key: PERMISSIONS.USERS_EDIT, label: 'Edit' },
      { key: PERMISSIONS.USERS_DELETE, label: 'Hapus' },
    ],
  },
  {
    label: 'Pembayaran',
    permissions: [
      { key: PERMISSIONS.PAYMENTS_CREATE, label: 'Buat' },
      { key: PERMISSIONS.PAYMENTS_DELETE, label: 'Hapus' },
    ],
  },
  {
    label: 'Settings',
    permissions: [
      { key: PERMISSIONS.SETTINGS_VIEW, label: 'Lihat' },
      { key: PERMISSIONS.SETTINGS_EDIT, label: 'Edit' },
    ],
  },
  {
    label: 'Laporan',
    permissions: [
      { key: PERMISSIONS.REPORTS_VIEW, label: 'Lihat' },
    ],
  },
  {
    label: 'Forum',
    permissions: [
      { key: PERMISSIONS.FORUM_CREATE, label: 'Buat Thread & Reply' },
      { key: PERMISSIONS.FORUM_MODERATE, label: 'Moderasi' },
    ],
  },
  {
    label: 'Trade Centre',
    permissions: [
      { key: PERMISSIONS.TRADE_VIEW, label: 'Lihat Katalog' },
      { key: PERMISSIONS.TRADE_SUBMIT, label: 'Ajukan Produk' },
    ],
  },
  {
    label: 'Gezma Foundation',
    permissions: [
      { key: PERMISSIONS.FOUNDATION_VIEW, label: 'Lihat' },
      { key: PERMISSIONS.FOUNDATION_CREATE, label: 'Buat Kampanye' },
      { key: PERMISSIONS.FOUNDATION_EDIT, label: 'Edit' },
      { key: PERMISSIONS.FOUNDATION_DELETE, label: 'Hapus' },
      { key: PERMISSIONS.FOUNDATION_FINANCING_APPROVE, label: 'Approve Pendanaan' },
    ],
  },
];
