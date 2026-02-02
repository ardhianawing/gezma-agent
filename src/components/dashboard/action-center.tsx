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
  critical: 'bg-[#D32F2F]', // GEZMA Red
  high: 'bg-[#F59E0B]',     // Warning Orange
  medium: 'bg-[#1E40AF]',   // Info Blue
};

export function ActionCenter() {
  return (
    <Card className="rounded-xl border border-[var(--gray-200)] shadow-sm overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Action Center</CardTitle>
            <CardDescription className="text-sm mt-1">Items requiring your attention</CardDescription>
          </div>
          {/* Badge lebih besar, dengan padding */}
          <Badge variant="error" className="h-8 w-8 text-sm font-bold flex items-center justify-center rounded-full flex-shrink-0">
            {mockAlerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        {mockAlerts.length === 0 ? (
          <p className="text-center text-sm text-[var(--gray-500)] py-6">
            All caught up! No actions required.
          </p>
        ) : (
          mockAlerts.map((alert) => {
            const Icon = iconMap[alert.type];
            return (
              <Link key={alert.id} href={alert.href}>
                <div className="group flex items-center gap-4 rounded-xl border border-[var(--gray-200)] bg-white pl-8 pr-6 py-5 transition-all duration-200 hover:border-[var(--gezma-red)] hover:shadow-xl relative overflow-hidden">
                  {/* Strategic Indicator Ribbon - Wider and Explicitly Colored */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${priorityColors[alert.priority]}`} />

                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[var(--gray-50)] flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-[var(--gray-600)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-base text-[var(--charcoal)]">{alert.title}</p>
                      {alert.count && (
                        <Badge variant="secondary" className="h-6 text-xs px-2.5 rounded-full font-bold ml-1 flex-shrink-0">
                          {alert.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--gray-500)] mt-1 line-clamp-1">{alert.description}</p>
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
