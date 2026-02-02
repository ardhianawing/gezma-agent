'use client';

import { Bell, Search, User, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--gray-200)]">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Menu button (mobile) + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--gray-100)] transition-colors"
          >
            <Menu className="h-5 w-5 text-[var(--gray-600)]" />
          </button>

          {/* Search */}
          <div className="relative hidden sm:block w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
            <input
              type="search"
              placeholder="Search pilgrims, packages, trips..."
              className="h-10 w-full rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] pl-10 pr-4 text-sm placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gezma-red)] focus:ring-offset-1 focus:bg-white focus:border-[var(--gezma-red)] transition-all"
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
          <Button variant="ghost" size="icon" className="relative hover:bg-[var(--gray-100)]">
            <Bell className="h-5 w-5 text-[var(--gray-600)]" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gezma-red)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--gezma-red)]"></span>
            </span>
          </Button>

          {/* Divider */}
          <div className="hidden lg:block h-8 w-px bg-[var(--gray-200)]" />

          {/* User Menu */}
          <button className="flex items-center gap-3 rounded-lg px-2 lg:px-3 py-2 hover:bg-[var(--gray-100)] transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gezma-red)] to-[var(--gezma-red-hover)] shadow-sm">
              <span className="text-sm font-semibold text-white">AD</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-[var(--charcoal)]">Admin</p>
              <p className="text-xs text-[var(--gray-500)]">Barokah Travel</p>
            </div>
            <ChevronDown className="hidden lg:block h-4 w-4 text-[var(--gray-400)]" />
          </button>
        </div>
      </div>
    </header>
  );
}
