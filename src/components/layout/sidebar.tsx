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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[260px] bg-white border-r border-[var(--gray-200)] transition-transform duration-300 ease-out",
          "shadow-xl lg:shadow-[var(--shadow-sm)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--gray-100)] px-5">
          <Link href="/pilgrims" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gezma-red)] to-[var(--gezma-red-hover)] shadow-md">
              <span className="font-bold text-white text-lg">G</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--charcoal)] tracking-tight">GEZMA</h1>
              <p className="text-[10px] text-[var(--gray-500)] uppercase tracking-wider font-medium">Agent Dashboard</p>
            </div>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--gray-100)] transition-colors"
          >
            <X className="h-5 w-5 text-[var(--gray-500)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-[calc(100%-4rem-7rem)]">
          <p className="px-3 py-2 text-[10px] font-semibold text-[var(--gray-400)] uppercase tracking-wider">
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-gradient-to-r from-[var(--gezma-red)] to-[var(--gezma-red-hover)] text-white shadow-md'
                    : 'text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)]'
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-[var(--gray-500)]"
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

          <div className="mt-4 pt-4 border-t border-[var(--gray-100)]">
            <p className="px-3 py-2 text-[10px] font-semibold text-[var(--gray-400)] uppercase tracking-wider">
              Support
            </p>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--charcoal)] transition-all duration-150"
            >
              <HelpCircle className="h-5 w-5 text-[var(--gray-500)]" />
              <span>Help Center</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--gray-100)] p-4 bg-[var(--gray-50)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--charcoal)] to-[var(--gray-700)] flex items-center justify-center shadow-sm">
              <span className="text-sm font-semibold text-white">BT</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--charcoal)] truncate">Barokah Travel</p>
              <p className="text-xs text-[var(--gray-500)]">PPIU/123/2023</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[var(--gray-600)] hover:text-[var(--error)] hover:bg-[var(--error-light)] rounded-lg transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
