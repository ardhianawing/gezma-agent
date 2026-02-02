'use client';

import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--gray-border)] bg-white px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
          <input
            type="search"
            placeholder="Search pilgrims, packages, trips..."
            className="h-10 w-full rounded-[12px] border border-[var(--gray-border)] bg-white pl-10 pr-4 text-sm placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gezma-red)]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gezma-red)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--gezma-red)]"></span>
          </span>
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 rounded-[12px] border border-[var(--gray-border)] px-3 py-1.5 hover:bg-[var(--gray-100)] cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gray-100)]">
            <User className="h-4 w-4 text-[var(--gray-600)]" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-[var(--charcoal)]">Admin</p>
            <p className="text-xs text-[var(--gray-600)]">admin@barokah.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
