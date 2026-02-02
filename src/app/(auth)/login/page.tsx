'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@barokahtravel.com');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - just redirect to dashboard
    router.push('/pilgrims');
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden w-1/2 bg-[var(--charcoal)] lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="font-bold text-white text-lg">G</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">GEZMA Agent</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your Umrah travel agency with confidence.
          </h1>
          <p className="text-[var(--gray-400)] text-lg max-w-md">
            The complete operating system for modern PPIU. Streamline operations, manage pilgrims, and grow your business.
          </p>
        </div>

        <div className="relative z-10 text-sm text-[var(--gray-600)]">
          &copy; 2024 GEZMA Technology. All rights reserved.
        </div>

        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gezma-red)] rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 bg-white p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--charcoal)]">Welcome back</h2>
            <p className="mt-2 text-sm text-[var(--gray-600)]">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[var(--gezma-red)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-[var(--gray-100)] border-[var(--gray-200)] focus:bg-white transition-colors"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-[var(--shadow-lg)] hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Sign In to Dashboard
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--gray-600)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-[var(--gezma-red)] hover:underline">
              Register agency
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
