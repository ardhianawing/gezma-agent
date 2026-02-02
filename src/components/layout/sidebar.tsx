'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Plane,
  FileText,
  Building2,
  Settings,
  X,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/pilgrims', icon: LayoutDashboard },
  { title: 'Pilgrims', href: '/pilgrims', icon: Users },
  { title: 'Packages', href: '/packages', icon: Package },
  { title: 'Trips', href: '/trips', icon: Plane },
  { title: 'Documents', href: '/documents', icon: FileText },
  { title: 'Agency', href: '/agency', icon: Building2 },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-[var(--gray-border)] transition-transform duration-300 ease-in-out shadow-sm",
          // Mobile: standard translate logic
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible (reset translate)
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--gray-border)] px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--gezma-red)]">
              <span className="font-bold text-white text-lg">G</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--charcoal)]">GEZMA</h1>
              <p className="text-xs text-[var(--gray-600)]">Agent Dashboard</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-[8px] hover:bg-[var(--gray-100)]"
          >
            <X className="h-5 w-5 text-[var(--gray-600)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 overflow-y-auto h-[calc(100%-4rem-4rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/pilgrims' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--gezma-red-light)] text-[var(--gezma-red)]'
                    : 'text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)]'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--gezma-red)] px-1.5 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--gray-border)] p-4 bg-white">
          <div className="text-xs text-[var(--gray-600)]">
            <p className="font-medium text-[var(--charcoal)]">Barokah Travel</p>
            <p className="mt-0.5">PPIU/123/2023 • v2.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
