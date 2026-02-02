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
  LucideIcon,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Premium Platinum Style */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[260px] bg-white transition-transform duration-300 ease-out",
          "border-r border-[var(--gray-200)]",
          "z-50 md:z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Logo - Generous Padding */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--gray-100)]">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/gezma-logo.png"
              alt="Logo"
              className="h-9 w-auto object-contain"
            />
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2.5 rounded-lg hover:bg-[var(--gray-100)] transition-colors"
          >
            <X className="h-5 w-5 text-[var(--gray-500)]" />
          </button>
        </div>

        {/* Navigation - Breathing Room */}
        <nav className="flex flex-col gap-1.5 p-4 overflow-y-auto h-[calc(100%-5.5rem-8rem)]">
          <p className="px-3 py-2 text-[11px] font-semibold text-[var(--gray-400)] uppercase tracking-wider">
            Menu
          </p>
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
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[var(--gezma-red)] text-white shadow-md'
                    : 'text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)]'
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-[var(--gray-400)]"
                )} />
                <span className="truncate">{item.title}</span>
                {item.badge && (
                  <span className={cn(
                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    isActive ? "bg-white/20 text-white" : "bg-[var(--gezma-red)] text-white"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-6 pt-4 border-t border-[var(--gray-100)]">
            <p className="px-3 py-2 text-[11px] font-semibold text-[var(--gray-400)] uppercase tracking-wider">
              Support
            </p>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)] transition-all duration-200"
            >
              <HelpCircle className="h-5 w-5 text-[var(--gray-400)]" />
              <span>Help Center</span>
            </Link>
          </div>
        </nav>

        {/* Footer - Premium Style */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--gray-100)] p-5 bg-[var(--gray-50)]/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-xl bg-[var(--charcoal)] flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">BT</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--charcoal)] truncate">Barokah Travel</p>
              <p className="text-xs text-[var(--gray-500)]">PPIU/123/2023</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--gray-600)] hover:text-[var(--error)] hover:bg-[var(--error-light)] rounded-xl transition-all duration-200">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
