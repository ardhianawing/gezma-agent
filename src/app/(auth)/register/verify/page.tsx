'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-8">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Email Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gezma-red-light)]">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
              fill="var(--gezma-red)"
            />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--charcoal)]">
            Cek Email Anda
          </h1>
          <p className="mt-3 text-sm text-[var(--gray-600)] leading-relaxed">
            Kami telah mengirimkan link verifikasi ke email Anda.
            <br />
            Silakan buka email dan klik link tersebut untuk mengaktifkan akun.
          </p>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-[var(--info-light)] bg-[var(--info-50)] px-4 py-3 text-sm text-[var(--info)]">
          Link verifikasi berlaku selama 24 jam. Cek juga folder spam jika tidak menemukan email.
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full h-11 text-sm font-medium"
            >
              Kembali ke Login
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-[var(--gray-400)]">
          Tidak menerima email? Hubungi support di support@gezma.id
        </p>
      </div>
    </div>
  );
}
