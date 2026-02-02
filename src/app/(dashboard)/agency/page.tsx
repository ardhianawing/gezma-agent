import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_AGENCY } from '@/data/mock-agencies';
import { formatDate } from '@/lib/utils';
import { QrCode } from 'lucide-react';

export default function AgencyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Profile"
        description="View and manage your agency information"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Basic Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Agency Name</p>
                <p className="text-sm text-[var(--charcoal)]">{DEFAULT_AGENCY.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Legal Name</p>
                <p className="text-sm text-[var(--charcoal)]">{DEFAULT_AGENCY.legalName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Email</p>
                <p className="text-sm text-[var(--charcoal)]">{DEFAULT_AGENCY.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Phone</p>
                <p className="text-sm text-[var(--charcoal)]">{DEFAULT_AGENCY.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-[var(--gray-600)]">Address</p>
                <p className="text-sm text-[var(--charcoal)]">
                  {DEFAULT_AGENCY.address}, {DEFAULT_AGENCY.city}, {DEFAULT_AGENCY.province}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PPIU Status */}
        <Card>
          <CardHeader>
            <CardTitle>PPIU License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Badge variant="success">{DEFAULT_AGENCY.ppiuStatus}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">License Number</p>
              <p className="text-sm font-mono text-[var(--charcoal)]">{DEFAULT_AGENCY.ppiuNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">Issued</p>
              <p className="text-sm text-[var(--charcoal)]">{formatDate(DEFAULT_AGENCY.ppiuIssueDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">Expires</p>
              <p className="text-sm text-[var(--charcoal)]">{formatDate(DEFAULT_AGENCY.ppiuExpiryDate)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Persons */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Persons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_AGENCY.contactPersons.map((contact) => (
              <div key={contact.id}>
                <div className="flex items-start justify-between">
                  <p className="font-medium text-sm text-[var(--charcoal)]">{contact.name}</p>
                  {contact.isPrimary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                </div>
                <p className="text-sm text-[var(--gray-600)] mt-1">{contact.position}</p>
                <p className="text-sm text-[var(--gray-600)]">{contact.phone}</p>
                <p className="text-sm text-[var(--gray-600)]">{contact.email}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bank Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_AGENCY.bankAccounts.map((bank) => (
              <div key={bank.id}>
                <div className="flex items-start justify-between">
                  <p className="font-medium text-sm text-[var(--charcoal)]">{bank.bankName}</p>
                  {bank.isPrimary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                </div>
                <p className="text-sm font-mono text-[var(--gray-600)] mt-1">{bank.accountNumber}</p>
                <p className="text-sm text-[var(--gray-600)]">{bank.accountName}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-6 bg-[var(--gray-100)] rounded-[12px]">
              <QrCode className="h-24 w-24 text-[var(--gray-600)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--gray-600)]">Verification Code</p>
              <p className="text-sm font-mono text-[var(--charcoal)]">{DEFAULT_AGENCY.verificationCode}</p>
            </div>
            {DEFAULT_AGENCY.isVerified && (
              <Badge variant="success">✓ Verified</Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
