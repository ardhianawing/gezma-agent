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
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-3 rounded-[12px] border border-[var(--gray-border)] p-4 transition-all hover:border-[var(--gray-400)] hover:shadow-sm">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: action.bgColor }}
                >
                  <action.icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="font-medium text-sm text-[var(--charcoal)]">{action.title}</p>
                  <p className="text-xs text-[var(--gray-600)]">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
