'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  const { c } = useTheme();

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: c.cardBg,
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        <ArrowLeft style={{ width: '18px', height: '18px', color: c.textMuted }} />
      </div>
    </Link>
  );
}
