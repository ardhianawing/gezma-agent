'use client';

import * as React from 'react';
import { Upload, X, FileText, Check, AlertCircle, Clock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
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

export function DocumentUpload({ documents, onUpload, onRemove, isEditable = true }: DocumentUploadProps) {
  const { c } = useTheme();
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const statusConfig: Record<DocumentStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
    missing: {
      icon: <AlertCircle style={{ width: '16px', height: '16px' }} />,
      color: c.textMuted,
      bgColor: c.cardBgHover,
      label: 'Missing',
    },
    uploaded: {
      icon: <Clock style={{ width: '16px', height: '16px' }} />,
      color: c.warning,
      bgColor: c.warningLight,
      label: 'Pending Review',
    },
    verified: {
      icon: <Check style={{ width: '16px', height: '16px' }} />,
      color: c.success,
      bgColor: c.successLight,
      label: 'Verified',
    },
    expired: {
      icon: <AlertCircle style={{ width: '16px', height: '16px' }} />,
      color: c.error,
      bgColor: c.errorLight,
      label: 'Expired',
    },
    rejected: {
      icon: <X style={{ width: '16px', height: '16px' }} />,
      color: c.error,
      bgColor: c.errorLight,
      label: 'Rejected',
    },
  };

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
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Documents</h3>
      </div>
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          {documentTypes.map(({ type, label, required }) => {
            const doc = getDocumentByType(type);
            const status = doc?.status || 'missing';
            const config = statusConfig[status];

            return (
              <div
                key={type}
                style={{
                  borderRadius: '12px',
                  border: status === 'missing'
                    ? `2px dashed ${c.border}`
                    : `2px dashed ${config.color}`,
                  padding: '16px',
                  backgroundColor: status === 'missing'
                    ? c.cardBgHover
                    : c.cardBg,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontWeight: '500', fontSize: '14px', color: c.textPrimary, margin: 0 }}>
                      {label}
                      {required && <span style={{ color: c.error, marginLeft: '4px' }}>*</span>}
                    </p>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        backgroundColor: config.bgColor,
                        color: config.color,
                      }}
                    >
                      {config.icon}
                      {config.label}
                    </div>
                  </div>
                  {doc && doc.status !== 'missing' && isEditable && (
                    <button
                      type="button"
                      onClick={() => onRemove(doc.id)}
                      style={{
                        padding: '4px',
                        borderRadius: '9999px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X style={{ width: '16px', height: '16px', color: c.textMuted }} />
                    </button>
                  )}
                </div>

                {doc && doc.fileName ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      backgroundColor: c.cardBgHover,
                      borderRadius: '8px',
                    }}
                  >
                    <FileText style={{ width: '16px', height: '16px', color: c.textMuted, flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '14px',
                        color: c.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
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
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[type]?.click()}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: c.textSecondary,
                        backgroundColor: 'transparent',
                        border: `1px solid ${c.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <Upload style={{ width: '16px', height: '16px' }} />
                      Upload
                    </button>
                  </>
                ) : (
                  <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>No document uploaded</p>
                )}

                {doc?.expiryDate && (
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: '8px 0 0 0' }}>
                    Expires: {new Date(doc.expiryDate).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
