'use client';

import { useState, useEffect, useCallback } from 'react';

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useSWRegistration() {
  const [swStatus, setSWStatus] = useState<'idle' | 'registered' | 'update-available' | 'error'>('idle');

  const registerSW = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setSWStatus('registered');

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setSWStatus('update-available');
          }
        });
      });
    } catch {
      setSWStatus('error');
    }
  }, []);

  const updateSW = useCallback(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage('SKIP_WAITING');
        window.location.reload();
      }
    });
  }, []);

  useEffect(() => {
    registerSW();
  }, [registerSW]);

  return { swStatus, updateSW };
}
