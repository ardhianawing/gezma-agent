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
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Pilgrims',
    href: '/pilgrims',
    icon: Users,
  },
  {
    title: 'Packages',
    href: '/packages',
    icon: Package,
  },
  {
    title: 'Trips',
    href: '/trips',
    icon: Plane,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    title: 'Agency',
    href: '/agency',
    icon: Building2,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--gray-border)] bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-[var(--gray-border)] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gezma-red)]">
          <span className="font-bold text-white text-sm">G</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-[var(--charcoal)]">GEZMA</h1>
          <p className="text-xs text-[var(--gray-600)]">Agent</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--gezma-red-light)] text-[var(--gezma-red)]'
                  : 'text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)]'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
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
      <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--gray-border)] p-4">
        <div className="text-xs text-[var(--gray-600)]">
          <p className="font-medium">Barokah Travel</p>
          <p className="mt-1">v2.0.0</p>
        </div>
      </div>
    </aside>
  );
}
