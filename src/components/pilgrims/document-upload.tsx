'use client';

import * as React from 'react';
import { Upload, X, FileText, Check, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PilgrimDocument } from '@/types/pilgrim';
import type { DocumentType, DocumentStatus } from '@/types';

interface DocumentUploadProps {
  documents: PilgrimDocument[];
  onUpload: (type: DocumentType, file: File) => void;
  onRemove: (documentId: string) => void;
  isEditable?: boolean;
}

const documentTypes: { type: DocumentType; label: string; required: boolean }[] = [
  { type: 'ktp', label: 'KTP (ID Card)', required: true },
  { type: 'passport', label: 'Passport', required: true },
  { type: 'photo', label: 'Passport Photo', required: true },
  { type: 'visa', label: 'Visa', required: false },
  { type: 'health_cert', label: 'Health Certificate', required: false },
  { type: 'book_nikah', label: 'Marriage Certificate', required: false },
];

const statusConfig: Record<DocumentStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  missing: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'var(--gray-600)',
    bgColor: 'var(--gray-100)',
    label: 'Missing',
  },
  uploaded: {
    icon: <Clock className="h-4 w-4" />,
    color: 'var(--warning)',
    bgColor: 'var(--warning-light)',
    label: 'Pending Review',
  },
  verified: {
    icon: <Check className="h-4 w-4" />,
    color: 'var(--success)',
    bgColor: 'var(--success-light)',
    label: 'Verified',
  },
  expired: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'var(--error)',
    bgColor: 'var(--error-light)',
    label: 'Expired',
  },
  rejected: {
    icon: <X className="h-4 w-4" />,
    color: 'var(--error)',
    bgColor: 'var(--error-light)',
    label: 'Rejected',
  },
};

export function DocumentUpload({ documents, onUpload, onRemove, isEditable = true }: DocumentUploadProps) {
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const getDocumentByType = (type: DocumentType) => {
    return documents.find((d) => d.type === type);
  };

  const handleFileChange = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(type, file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map(({ type, label, required }) => {
            const doc = getDocumentByType(type);
            const status = doc?.status || 'missing';
            const config = statusConfig[status];

            return (
              <div
                key={type}
                className={cn(
                  'rounded-[12px] border-2 border-dashed p-4 transition-colors',
                  status === 'missing'
                    ? 'border-[var(--gray-border)] bg-[var(--gray-100)]/50'
                    : 'border-transparent bg-white shadow-sm'
                )}
                style={{
                  borderColor: status !== 'missing' ? config.color : undefined,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm text-[var(--charcoal)]">
                      {label}
                      {required && <span className="text-[var(--error)] ml-1">*</span>}
                    </p>
                    <div
                      className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      {config.icon}
                      {config.label}
                    </div>
                  </div>
                  {doc && doc.status !== 'missing' && isEditable && (
                    <button
                      type="button"
                      onClick={() => onRemove(doc.id)}
                      className="p-1 rounded-full hover:bg-[var(--gray-100)] transition-colors"
                    >
                      <X className="h-4 w-4 text-[var(--gray-600)]" />
                    </button>
                  )}
                </div>

                {doc && doc.fileName ? (
                  <div className="flex items-center gap-2 p-2 bg-[var(--gray-100)] rounded-[8px]">
                    <FileText className="h-4 w-4 text-[var(--gray-600)]" />
                    <span className="text-sm text-[var(--charcoal)] truncate flex-1">
                      {doc.fileName}
                    </span>
                  </div>
                ) : isEditable ? (
                  <>
                    <input
                      type="file"
                      ref={(el) => { fileInputRefs.current[type] = el; }}
                      onChange={(e) => handleFileChange(type, e)}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRefs.current[type]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-[var(--gray-600)]">No document uploaded</p>
                )}

                {doc?.expiryDate && (
                  <p className="text-xs text-[var(--gray-600)] mt-2">
                    Expires: {new Date(doc.expiryDate).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
