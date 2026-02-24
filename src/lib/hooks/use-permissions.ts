'use client';

import { useState, useEffect } from 'react';
import { hasPermission, ROLE_PERMISSIONS, type Permission } from '@/lib/permissions';

interface UserInfo {
  role: string;
  permissions?: Record<string, boolean> | null;
}

let cachedUser: UserInfo | null = null;
let fetchPromise: Promise<void> | null = null;

function fetchUser(): Promise<void> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch('/api/auth/me')
    .then((res) => res.json())
    .then((data) => {
      if (data.user?.role) {
        cachedUser = { role: data.user.role, permissions: data.user.permissions || null };
      }
    })
    .catch(() => {});
  return fetchPromise;
}

export function usePermission() {
  const [user, setUser] = useState<UserInfo | null>(cachedUser);

  useEffect(() => {
    if (cachedUser) {
      setUser(cachedUser);
      return;
    }
    fetchUser().then(() => {
      if (cachedUser) setUser(cachedUser);
    });
  }, []);

  function can(permission: Permission): boolean {
    if (!user) return true; // loading state — show everything, gated server-side
    return hasPermission(user.role, permission, user.permissions);
  }

  function canAny(...permissions: Permission[]): boolean {
    return permissions.some((p) => can(p));
  }

  return { can, canAny, role: user?.role || null };
}

export { ROLE_PERMISSIONS, type Permission };
