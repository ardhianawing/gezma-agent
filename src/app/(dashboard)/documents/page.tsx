'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Eye, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { DEFAULT_AGENCY } from '@/data/mock-agencies';
import { formatDate } from '@/lib/utils';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'valid':
      return <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />;
    case 'expiring':
      return <Clock className="h-5 w-5 text-[var(--warning)]" />;
    case 'expired':
      return <AlertCircle className="h-5 w-5 text-[var(--error)]" />;
    default:
      return <FileText className="h-5 w-5 text-[var(--gray-500)]" />;
  }
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Documents"
        description="Manage your agency legal documents and licenses"
        actions={
          <Button>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-[var(--success-light)] to-white border-[var(--success)]/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--success)]/10">
                <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--success)]">
                  {DEFAULT_AGENCY.documents.filter(d => d.status === 'valid').length}
                </p>
                <p className="text-sm text-[var(--gray-600)]">Valid Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--warning-light)] to-white border-[var(--warning)]/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--warning)]/10">
                <Clock className="h-6 w-6 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--warning)]">
                  {DEFAULT_AGENCY.documents.filter(d => d.status === 'expiring').length}
                </p>
                <p className="text-sm text-[var(--gray-600)]">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--error-light)] to-white border-[var(--error)]/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--error)]/10">
                <AlertCircle className="h-6 w-6 text-[var(--error)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--error)]">
                  {DEFAULT_AGENCY.documents.filter(d => d.status === 'expired').length}
                </p>
                <p className="text-sm text-[var(--gray-600)]">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <div className="p-5 border-b border-[var(--gray-100)]">
          <h3 className="text-lg font-semibold text-[var(--charcoal)]">All Documents</h3>
          <p className="text-sm text-[var(--gray-500)] mt-1">Manage and track your agency's legal documents</p>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-[var(--gray-100)]">
            {DEFAULT_AGENCY.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-5 hover:bg-[var(--gray-50)] transition-colors group"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                  doc.status === 'valid' ? 'bg-[var(--success-light)]' :
                  doc.status === 'expiring' ? 'bg-[var(--warning-light)]' :
                  'bg-[var(--error-light)]'
                }`}>
                  <FileText className={`h-7 w-7 ${
                    doc.status === 'valid' ? 'text-[var(--success)]' :
                    doc.status === 'expiring' ? 'text-[var(--warning)]' :
                    'text-[var(--error)]'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-[var(--charcoal)]">{doc.name}</h4>
                    <Badge
                      variant={
                        doc.status === 'valid' ? 'success' :
                        doc.status === 'expiring' ? 'warning' : 'error'
                      }
                    >
                      {doc.status === 'valid' ? 'Valid' :
                       doc.status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                    </Badge>
                  </div>
                  {doc.number && (
                    <p className="text-sm font-mono text-[var(--gray-500)] mb-2">{doc.number}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--gray-500)]">
                    {doc.issueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Issued: {formatDate(doc.issueDate)}
                      </span>
                    )}
                    {doc.expiryDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Expires: {formatDate(doc.expiryDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
