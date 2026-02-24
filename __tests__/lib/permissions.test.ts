import { describe, it, expect } from 'vitest'
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  hasPermission,
  type Permission,
} from '@/lib/permissions'

describe('PERMISSIONS', () => {
  it('has all expected permission keys', () => {
    expect(PERMISSIONS.PACKAGES_VIEW).toBe('packages:view')
    expect(PERMISSIONS.PILGRIMS_CREATE).toBe('pilgrims:create')
    expect(PERMISSIONS.TRIPS_EDIT).toBe('trips:edit')
    expect(PERMISSIONS.USERS_DELETE).toBe('users:delete')
    expect(PERMISSIONS.PAYMENTS_CREATE).toBe('payments:create')
    expect(PERMISSIONS.SETTINGS_VIEW).toBe('settings:view')
    expect(PERMISSIONS.REPORTS_VIEW).toBe('reports:view')
  })

  it('has 21 total permissions', () => {
    expect(Object.keys(PERMISSIONS)).toHaveLength(21)
  })
})

describe('ROLE_PERMISSIONS', () => {
  it('owner has all permissions', () => {
    const allPerms = Object.values(PERMISSIONS)
    expect(ROLE_PERMISSIONS.owner).toHaveLength(allPerms.length)
    for (const p of allPerms) {
      expect(ROLE_PERMISSIONS.owner).toContain(p)
    }
  })

  it('admin has all permissions except none missing', () => {
    // admin should have same as owner in current config
    expect(ROLE_PERMISSIONS.admin).toHaveLength(Object.values(PERMISSIONS).length)
  })

  it('staff has limited permissions', () => {
    expect(ROLE_PERMISSIONS.staff).toContain(PERMISSIONS.PACKAGES_VIEW)
    expect(ROLE_PERMISSIONS.staff).toContain(PERMISSIONS.PILGRIMS_VIEW)
    expect(ROLE_PERMISSIONS.staff).toContain(PERMISSIONS.PILGRIMS_CREATE)
    expect(ROLE_PERMISSIONS.staff).toContain(PERMISSIONS.PILGRIMS_EDIT)
    expect(ROLE_PERMISSIONS.staff).toContain(PERMISSIONS.TRIPS_VIEW)
    expect(ROLE_PERMISSIONS.staff).toContain(PERMISSIONS.PAYMENTS_CREATE)
    expect(ROLE_PERMISSIONS.staff).not.toContain(PERMISSIONS.PACKAGES_DELETE)
    expect(ROLE_PERMISSIONS.staff).not.toContain(PERMISSIONS.USERS_VIEW)
    expect(ROLE_PERMISSIONS.staff).not.toContain(PERMISSIONS.SETTINGS_EDIT)
  })

  it('marketing has read + create focused permissions', () => {
    expect(ROLE_PERMISSIONS.marketing).toContain(PERMISSIONS.PACKAGES_VIEW)
    expect(ROLE_PERMISSIONS.marketing).toContain(PERMISSIONS.PACKAGES_CREATE)
    expect(ROLE_PERMISSIONS.marketing).toContain(PERMISSIONS.PACKAGES_EDIT)
    expect(ROLE_PERMISSIONS.marketing).toContain(PERMISSIONS.REPORTS_VIEW)
    expect(ROLE_PERMISSIONS.marketing).not.toContain(PERMISSIONS.PACKAGES_DELETE)
    expect(ROLE_PERMISSIONS.marketing).not.toContain(PERMISSIONS.USERS_VIEW)
    expect(ROLE_PERMISSIONS.marketing).not.toContain(PERMISSIONS.PAYMENTS_CREATE)
  })
})

describe('hasPermission', () => {
  it('returns true for owner on any permission', () => {
    expect(hasPermission('owner', PERMISSIONS.PACKAGES_DELETE)).toBe(true)
    expect(hasPermission('owner', PERMISSIONS.SETTINGS_EDIT)).toBe(true)
    expect(hasPermission('owner', PERMISSIONS.USERS_DELETE)).toBe(true)
  })

  it('returns true for staff on allowed permission', () => {
    expect(hasPermission('staff', PERMISSIONS.PILGRIMS_VIEW)).toBe(true)
  })

  it('returns false for staff on disallowed permission', () => {
    expect(hasPermission('staff', PERMISSIONS.PACKAGES_DELETE)).toBe(false)
  })

  it('returns false for unknown role', () => {
    expect(hasPermission('unknown', PERMISSIONS.PACKAGES_VIEW)).toBe(false)
  })

  it('user override grants permission not in role', () => {
    const overrides = { [PERMISSIONS.USERS_DELETE]: true }
    expect(hasPermission('staff', PERMISSIONS.USERS_DELETE, overrides)).toBe(true)
  })

  it('user override denies permission in role', () => {
    const overrides = { [PERMISSIONS.PACKAGES_VIEW]: false }
    expect(hasPermission('staff', PERMISSIONS.PACKAGES_VIEW, overrides)).toBe(false)
  })

  it('falls back to role when override does not contain key', () => {
    const overrides = { [PERMISSIONS.USERS_DELETE]: true }
    // PACKAGES_VIEW is not in overrides, should fall back to role
    expect(hasPermission('staff', PERMISSIONS.PACKAGES_VIEW, overrides)).toBe(true)
  })

  it('handles null userPermissions', () => {
    expect(hasPermission('owner', PERMISSIONS.PACKAGES_VIEW, null)).toBe(true)
  })

  it('handles undefined userPermissions', () => {
    expect(hasPermission('owner', PERMISSIONS.PACKAGES_VIEW, undefined)).toBe(true)
  })
})

describe('PERMISSION_GROUPS', () => {
  it('has 7 groups', () => {
    expect(PERMISSION_GROUPS).toHaveLength(7)
  })

  it('first group is Paket', () => {
    expect(PERMISSION_GROUPS[0].label).toBe('Paket')
    expect(PERMISSION_GROUPS[0].permissions).toHaveLength(4)
  })

  it('contains all permissions across groups', () => {
    const allGroupPerms = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key))
    const allPerms = Object.values(PERMISSIONS)
    expect(allGroupPerms).toHaveLength(allPerms.length)
    for (const p of allPerms) {
      expect(allGroupPerms).toContain(p)
    }
  })

  it('each permission has key and label', () => {
    for (const group of PERMISSION_GROUPS) {
      for (const perm of group.permissions) {
        expect(typeof perm.key).toBe('string')
        expect(typeof perm.label).toBe('string')
        expect(perm.key.length).toBeGreaterThan(0)
        expect(perm.label.length).toBeGreaterThan(0)
      }
    }
  })
})
