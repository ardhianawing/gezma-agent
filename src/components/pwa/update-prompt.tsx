'use client';

import { useSWRegistration } from '@/lib/hooks/use-online';
import { RefreshCw } from 'lucide-react';

export function UpdatePrompt() {
  const { swStatus, updateSW } = useSWRegistration();

  if (swStatus !== 'update-available') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9997,
        background: '#1E40AF',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)',
        cursor: 'pointer',
      }}
      onClick={updateSW}
    >
      <RefreshCw style={{ width: 16, height: 16 }} />
      Update tersedia — klik untuk refresh
    </div>
  );
}
