import { CheckCircle2, XCircle, Building2, Phone, Mail, MapPin, Calendar, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { mockAgencies } from '@/data/mock-agencies';

export default function VerifyPage({ params }: { params: { code: string } }) {
  const agency = mockAgencies.find((a) => a.verificationCode === params.code);
  const isVerified = agency?.isVerified;

  if (!agency) {
    return (
      <div className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--error-light)] flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-[var(--error)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--charcoal)] mb-2">Verification Failed</h1>
            <p className="text-[var(--gray-600)]">
              This verification code is not valid. Please check the code and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gray-100)] py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--charcoal)]">Agency Verification</h1>
          <p className="text-[var(--gray-600)] mt-1">GEZMA Verified Travel Agency</p>
        </div>

        {/* Verification Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isVerified ? 'bg-[var(--success-light)]' : 'bg-[var(--error-light)]'}`}>
                {isVerified ? (
                  <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
                ) : (
                  <XCircle className="h-8 w-8 text-[var(--error)]" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--charcoal)]">
                  {isVerified ? 'Verified Agency' : 'Not Verified'}
                </h2>
                <p className="text-sm text-[var(--gray-600)]">
                  {isVerified
                    ? 'This travel agency is officially registered and verified'
                    : 'This agency could not be verified'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agency Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--gray-border)]">
              <div className="w-12 h-12 rounded-[12px] bg-[var(--gezma-red-light)] flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[var(--gezma-red)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--charcoal)]">{agency.name}</h3>
                <p className="text-sm text-[var(--gray-600)]">{agency.legalName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow icon={Shield} label="PPIU Number" value={agency.ppiuNumber} />
              <InfoRow icon={Calendar} label="Valid Until" value={formatDate(agency.ppiuExpiryDate)} />
              <InfoRow icon={MapPin} label="Address" value={`${agency.city}, ${agency.province}`} />
              <InfoRow icon={Phone} label="Phone" value={agency.phone} />
              <InfoRow icon={Mail} label="Email" value={agency.email} />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-[var(--gray-600)]">
          <p>Verified by GEZMA</p>
          <p className="mt-1">Verification Code: <span className="font-mono">{params.code}</span></p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-[var(--gray-600)] flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-[var(--gray-600)]">{label}</p>
        <p className="text-sm text-[var(--charcoal)]">{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
