'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PilgrimPortalData } from '@/data/mock-pilgrim-portal';

interface PilgrimContextType {
  data: PilgrimPortalData | null;
  login: (bookingCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshData: () => void;
  isLoading: boolean;
}

const PilgrimContext = createContext<PilgrimContextType | undefined>(undefined);

export function PilgrimProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PilgrimPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from cookie on mount
  useEffect(() => {
    fetch('/api/pilgrim-portal/me', { credentials: 'same-origin' })
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(json => {
        if (json?.data) setData(json.data);
      })
      .catch(() => {
        // Network error — stay logged out
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (bookingCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/pilgrim-portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ bookingCode: bookingCode.trim().toUpperCase() }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        setData(json.data);
        return { success: true };
      }

      return { success: false, error: json.error || 'Kode booking tidak ditemukan.' };
    } catch {
      return { success: false, error: 'Gagal terhubung ke server. Periksa koneksi internet Anda.' };
    }
  }, []);

  const logout = useCallback(() => {
    setData(null);
    fetch('/api/pilgrim-portal/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  }, []);

  const refreshData = useCallback(() => {
    fetch('/api/pilgrim-portal/me', { credentials: 'same-origin' })
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(json => {
        if (json?.data) setData(json.data);
      })
      .catch(() => {});
  }, []);

  return (
    <PilgrimContext.Provider value={{ data, login, logout, refreshData, isLoading }}>
      {children}
    </PilgrimContext.Provider>
  );
}

export function usePilgrim() {
  const context = useContext(PilgrimContext);
  if (context === undefined) {
    throw new Error('usePilgrim must be used within a PilgrimProvider');
  }
  return context;
}
