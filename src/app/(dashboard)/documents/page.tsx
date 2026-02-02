import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { DEFAULT_AGENCY } from '@/data/mock-agencies';
import { formatDate } from '@/lib/utils';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Documents"
        description="Manage your agency legal documents and licenses"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {DEFAULT_AGENCY.documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--gray-100)]">
                  <FileText className="h-6 w-6 text-[var(--gray-600)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[var(--charcoal)]">{doc.name}</h3>
                      {doc.number && (
                        <p className="text-sm font-mono text-[var(--gray-600)] mt-1">{doc.number}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        doc.status === 'valid'
                          ? 'success'
                          : doc.status === 'expiring'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-[var(--gray-600)]">
                    {doc.issueDate && <p>Issued: {formatDate(doc.issueDate)}</p>}
                    {doc.expiryDate && <p>Expires: {formatDate(doc.expiryDate)}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
