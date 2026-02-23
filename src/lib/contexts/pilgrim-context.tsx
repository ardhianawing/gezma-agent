'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PilgrimPortalData, findByBookingCode } from '@/data/mock-pilgrim-portal';

interface PilgrimContextType {
  data: PilgrimPortalData | null;
  login: (bookingCode: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const PilgrimContext = createContext<PilgrimContextType | undefined>(undefined);

const STORAGE_KEY = 'pilgrim_booking_code';

export function PilgrimProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PilgrimPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCode = localStorage.getItem(STORAGE_KEY);
    if (savedCode) {
      const result = findByBookingCode(savedCode);
      if (result) {
        setData(result);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((bookingCode: string): boolean => {
    const result = findByBookingCode(bookingCode);
    if (result) {
      setData(result);
      localStorage.setItem(STORAGE_KEY, bookingCode.trim().toUpperCase());
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setData(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PilgrimContext.Provider value={{ data, login, logout, isLoading }}>
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
