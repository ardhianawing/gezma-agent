import Link from 'next/link';
import { AlertCircle, FileX, ClipboardX, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  type: 'missing_docs' | 'incomplete_manifest' | 'license_expiring' | 'payment_pending';
  priority: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  count?: number;
  href: string;
}

const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    type: 'missing_docs',
    priority: 'critical',
    title: 'Missing Documents',
    description: '8 pilgrims have incomplete documents',
    count: 8,
    href: '/pilgrims?filter=missing_docs',
  },
  {
    id: 'alert_002',
    type: 'incomplete_manifest',
    priority: 'high',
    title: 'Incomplete Trip Manifest',
    description: 'Umrah Reguler - Maret 2026 needs confirmation',
    href: '/trips/trip_001',
  },
  {
    id: 'alert_003',
    type: 'license_expiring',
    priority: 'medium',
    title: 'PPIU License Expiring',
    description: 'License expires in 45 days',
    href: '/agency',
  },
];

const iconMap = {
  missing_docs: FileX,
  incomplete_manifest: ClipboardX,
  license_expiring: AlertTriangle,
  payment_pending: AlertCircle,
};

const priorityColors = {
  critical: 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]',
  high: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]',
  medium: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]',
};

export function ActionCenter() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Action Center</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </div>
          <Badge variant="error">{mockAlerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAlerts.length === 0 ? (
          <p className="text-center text-sm text-[var(--gray-600)] py-4">
            All caught up! No actions required.
          </p>
        ) : (
          mockAlerts.map((alert) => {
            const Icon = iconMap[alert.type];
            return (
              <Link key={alert.id} href={alert.href}>
                <div className={`flex items-start gap-3 rounded-[12px] border-l-4 bg-white p-4 transition-shadow hover:shadow-[var(--shadow-md)] ${priorityColors[alert.priority]}`}>
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-[var(--charcoal)]">{alert.title}</p>
                      {alert.count && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          {alert.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--gray-600)] mt-0.5">{alert.description}</p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
