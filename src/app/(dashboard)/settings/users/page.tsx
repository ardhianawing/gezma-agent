import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage staff users and permissions"
      />

      <Card>
        <CardContent className="p-6">
          <p className="text-center text-sm text-[var(--gray-600)]">User management coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
