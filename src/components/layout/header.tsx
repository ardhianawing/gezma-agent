'use client';

import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[var(--gray-border)]">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Menu button (mobile) + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-[8px] hover:bg-[var(--gray-100)]"
          >
            <Menu className="h-5 w-5 text-[var(--gray-600)]" />
          </button>

          {/* Search */}
          <div className="relative hidden sm:block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
            <input
              type="search"
              placeholder="Search pilgrims, packages, trips..."
              className="h-10 w-full rounded-[12px] border border-[var(--gray-border)] bg-[var(--gray-100)] pl-10 pr-4 text-sm placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gezma-red)] focus:bg-white"
            />
          </div>
        </div>

        {/* Right side - Notifications + User */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Mobile search button */}
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gezma-red)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--gezma-red)]"></span>
            </span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-2 lg:gap-3 rounded-[12px] border border-[var(--gray-border)] px-2 lg:px-3 py-1.5 hover:bg-[var(--gray-100)] cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gezma-red-light)]">
              <User className="h-4 w-4 text-[var(--gezma-red)]" />
            </div>
            <div className="hidden lg:block text-sm">
              <p className="font-medium text-[var(--charcoal)]">Admin</p>
              <p className="text-xs text-[var(--gray-600)]">Barokah Travel</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
