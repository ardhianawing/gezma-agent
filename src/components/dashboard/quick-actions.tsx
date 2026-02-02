import Link from 'next/link';
import { UserPlus, Package, Plane, FileText, Building2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const actions = [
  {
    title: 'Add Pilgrim',
    description: 'Register a new pilgrim',
    icon: UserPlus,
    href: '/pilgrims/new',
    color: 'var(--gezma-red)',
    bgColor: 'var(--gezma-red-light)',
  },
  {
    title: 'Create Package',
    description: 'Build a new umrah package',
    icon: Package,
    href: '/packages/new',
    color: 'var(--info)',
    bgColor: 'var(--info-light)',
  },
  {
    title: 'New Trip',
    description: 'Schedule a departure',
    icon: Plane,
    href: '/trips/new',
    color: 'var(--success)',
    bgColor: 'var(--success-light)',
  },
  {
    title: 'Documents',
    description: 'Manage agency docs',
    icon: FileText,
    href: '/documents',
    color: 'var(--warning)',
    bgColor: 'var(--warning-light)',
  },
  {
    title: 'Agency Profile',
    description: 'Update company info',
    icon: Building2,
    href: '/agency',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
  },
  {
    title: 'Settings',
    description: 'Configure system',
    icon: Settings,
    href: '/settings',
    color: 'var(--gray-600)',
    bgColor: 'var(--gray-100)',
  },
];

export function QuickActions() {
  return (
    <Card className="rounded-xl border border-[var(--gray-200)] shadow-sm overflow-hidden">
      <CardHeader className="p-6 pb-6">
        <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-4 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)]/50 p-5 transition-all duration-200 hover:border-[var(--gezma-red)] hover:bg-white hover:shadow-md group">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ backgroundColor: action.bgColor }}
                >
                  <action.icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--charcoal)]">{action.title}</p>
                  <p className="text-xs text-[var(--gray-500)] mt-0.5">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
