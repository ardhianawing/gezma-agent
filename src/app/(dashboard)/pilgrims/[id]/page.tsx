import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PilgrimDetailPage({ params }: { params: { id: string } }) {
  const pilgrim = mockPilgrims.find((p) => p.id === params.id);

  if (!pilgrim) {
    return <div>Pilgrim not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pilgrims">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={pilgrim.name}
          description={pilgrim.email}
          actions={
            <Link href={`/pilgrims/${pilgrim.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Full Name</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">NIK</p>
                <p className="text-sm font-mono text-[var(--charcoal)]">{pilgrim.nik}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Gender</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.gender === 'male' ? 'Male' : 'Female'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Birth</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.birthPlace}, {formatDate(pilgrim.birthDate)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-[var(--gray-600)]">Address</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.address}, {pilgrim.city}, {pilgrim.province}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Phone</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Email</p>
                <p className="text-sm text-[var(--charcoal)]">{pilgrim.email}</p>
              </div>
            </div>

            <div className="border-t border-[var(--gray-border)] pt-4">
              <p className="text-sm font-medium text-[var(--gray-600)] mb-2">Emergency Contact</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-[var(--gray-600)]">Name</p>
                  <p className="text-sm text-[var(--charcoal)]">{pilgrim.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--gray-600)]">Relation</p>
                  <p className="text-sm text-[var(--charcoal)]">{pilgrim.emergencyContact.relation}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--gray-600)]">Phone</p>
                  <p className="text-sm text-[var(--charcoal)]">{pilgrim.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)] mb-2">Current Status</p>
              <StatusBadge status={pilgrim.status} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">Total Paid</p>
              <p className="text-lg font-bold text-[var(--charcoal)]">{formatCurrency(pilgrim.totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">Remaining</p>
              <p className="text-lg font-bold text-[var(--error)]">{formatCurrency(pilgrim.remainingBalance)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {pilgrim.documents.map((doc) => (
                <div key={doc.id} className="rounded-[12px] border border-[var(--gray-border)] p-4">
                  <p className="text-sm font-medium text-[var(--charcoal)] uppercase">{doc.type.replace('_', ' ')}</p>
                  <StatusBadge status={doc.status as any} size="sm" className="mt-2" />
                  {doc.uploadedAt && (
                    <p className="text-xs text-[var(--gray-600)] mt-1">{formatDate(doc.uploadedAt)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ChecklistItem label="KTP Uploaded" checked={pilgrim.checklist.ktpUploaded} />
              <ChecklistItem label="Passport Uploaded" checked={pilgrim.checklist.passportUploaded} />
              <ChecklistItem label="Passport Valid (6+ months)" checked={pilgrim.checklist.passportValid} />
              <ChecklistItem label="Photo Uploaded" checked={pilgrim.checklist.photoUploaded} />
              <ChecklistItem label="DP Paid" checked={pilgrim.checklist.dpPaid} />
              <ChecklistItem label="Full Payment" checked={pilgrim.checklist.fullPayment} />
              <ChecklistItem label="Visa Submitted" checked={pilgrim.checklist.visaSubmitted} />
              <ChecklistItem label="Visa Received" checked={pilgrim.checklist.visaReceived} />
              <ChecklistItem label="Health Certificate" checked={pilgrim.checklist.healthCertificate} />
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        {pilgrim.payments.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pilgrim.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-[12px] border border-[var(--gray-border)] p-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--charcoal)] capitalize">{payment.type}</p>
                      <p className="text-xs text-[var(--gray-600)]">{formatDate(payment.date)} • {payment.method}</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--success)]">+ {formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${checked ? 'bg-[var(--success)]' : 'border-2 border-[var(--gray-border)]'}`}>
        {checked && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${checked ? 'text-[var(--charcoal)]' : 'text-[var(--gray-600)]'}`}>{label}</span>
    </div>
  );
}
