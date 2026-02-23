'use client';

import { useOnline } from '@/lib/hooks/use-online';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const isOnline = useOnline();
  const [show, setShow] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
      setShowReconnect(false);
    } else if (wasOffline) {
      setShow(false);
      setShowReconnect(true);
      const timer = setTimeout(() => setShowReconnect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!show && !showReconnect) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#FFFFFF',
        background: showReconnect
          ? '#16A34A'
          : '#DC2626',
        transition: 'all 300ms ease',
      }}
    >
      {showReconnect ? (
        <>Back online</>
      ) : (
        <>
          <WifiOff style={{ width: 14, height: 14 }} />
          You are offline — some features may be limited
        </>
      )}
    </div>
  );
}
