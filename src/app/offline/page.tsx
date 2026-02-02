'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-[var(--gray-200)] flex items-center justify-center mb-6">
            <WifiOff className="h-10 w-10 text-[var(--gray-600)]" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--charcoal)] mb-2">You're Offline</h1>
          <p className="text-[var(--gray-600)] mb-6">
            It looks like you've lost your internet connection. Please check your connection and try again.
          </p>

          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <div className="mt-8 pt-6 border-t border-[var(--gray-border)]">
            <p className="text-sm text-[var(--gray-600)]">
              Some features may still work offline. Your data will sync when you're back online.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
