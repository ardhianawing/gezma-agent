'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_AGENCY } from '@/data/mock-agencies';
import { formatDate } from '@/lib/utils';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Users,
  CreditCard,
  QrCode,
  CheckCircle2,
  Edit2,
  Copy
} from 'lucide-react';

export default function AgencyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Profile"
        description="View and manage your agency information"
        actions={
          <Button>
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        }
      />

      {/* Agency Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--charcoal)] to-[var(--gray-700)] p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <Building2 className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{DEFAULT_AGENCY.name}</h2>
                {DEFAULT_AGENCY.isVerified && (
                  <Badge className="bg-[var(--success)] text-white border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-white/70">{DEFAULT_AGENCY.legalName}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {DEFAULT_AGENCY.email}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {DEFAULT_AGENCY.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-5 bg-[var(--gray-50)]">
          <div className="flex items-center gap-2 text-sm text-[var(--gray-600)]">
            <MapPin className="h-4 w-4" />
            {DEFAULT_AGENCY.address}, {DEFAULT_AGENCY.city}, {DEFAULT_AGENCY.province}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* PPIU License */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--success)]" />
              PPIU License
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-[var(--success-light)] to-white rounded-xl border border-[var(--success)]/20">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="success" className="text-xs">
                  {DEFAULT_AGENCY.ppiuStatus}
                </Badge>
              </div>
              <p className="text-lg font-mono font-bold text-[var(--charcoal)]">
                {DEFAULT_AGENCY.ppiuNumber}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[var(--gray-100)]">
                <span className="text-sm text-[var(--gray-500)] flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Issued
                </span>
                <span className="text-sm font-medium text-[var(--charcoal)]">
                  {formatDate(DEFAULT_AGENCY.ppiuIssueDate)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--gray-500)] flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expires
                </span>
                <span className="text-sm font-medium text-[var(--charcoal)]">
                  {formatDate(DEFAULT_AGENCY.ppiuExpiryDate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Persons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--info)]" />
              Contact Persons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_AGENCY.contactPersons.map((contact, index) => (
              <div
                key={contact.id}
                className={`p-4 rounded-xl ${contact.isPrimary ? 'bg-[var(--info-light)] border border-[var(--info)]/20' : 'bg-[var(--gray-50)]'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[var(--charcoal)]">{contact.name}</p>
                    <p className="text-xs text-[var(--gray-500)]">{contact.position}</p>
                  </div>
                  {contact.isPrimary && (
                    <Badge variant="secondary" className="text-xs bg-[var(--info)] text-white border-0">
                      Primary
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-[var(--gray-600)]">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {contact.email}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Verification QR */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[var(--gray-500)]" />
              Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-6 bg-white rounded-xl border-2 border-dashed border-[var(--gray-200)]">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-28 h-28 bg-[var(--gray-900)] rounded-xl mb-3">
                  <QrCode className="h-20 w-20 text-white" />
                </div>
                <p className="text-xs text-[var(--gray-500)]">Scan to verify agency</p>
              </div>
            </div>

            <div className="p-3 bg-[var(--gray-50)] rounded-lg">
              <p className="text-xs text-[var(--gray-500)] mb-1">Verification Code</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono font-bold text-[var(--charcoal)]">
                  {DEFAULT_AGENCY.verificationCode}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {DEFAULT_AGENCY.isVerified && (
              <div className="flex items-center gap-2 p-3 bg-[var(--success-light)] rounded-lg text-[var(--success)]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Agency Verified</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[var(--warning)]" />
            Bank Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DEFAULT_AGENCY.bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className={`p-4 rounded-xl border-2 ${bank.isPrimary ? 'border-[var(--warning)] bg-[var(--warning-light)]' : 'border-[var(--gray-200)] bg-[var(--gray-50)]'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${bank.isPrimary ? 'bg-[var(--warning)]/20' : 'bg-[var(--gray-200)]'}`}>
                      <CreditCard className={`h-5 w-5 ${bank.isPrimary ? 'text-[var(--warning)]' : 'text-[var(--gray-500)]'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--charcoal)]">{bank.bankName}</p>
                      {bank.isPrimary && (
                        <Badge variant="warning" className="text-xs mt-1">Primary</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-mono font-bold text-[var(--charcoal)]">{bank.accountNumber}</p>
                  <p className="text-sm text-[var(--gray-600)]">{bank.accountName}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
