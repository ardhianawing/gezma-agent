'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Shield, Loader2, Copy } from 'lucide-react';

interface CertificateData {
  id: string;
  certificateNumber: string;
  txHash: string;
  blockNumber: number;
  metadata: Record<string, unknown> | null;
  status: string;
  issuedAt: string;
  verifiedAt: string | null;
  pilgrim: { name: string; nik: string };
  agency: { name: string };
}

export default function VerifyCertificatePage() {
  const params = useParams<{ number: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const res = await fetch(`/api/blockchain/verify/${params.number}`);
        if (res.ok) {
          const json = await res.json();
          setCertificate(json.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificate();
  }, [params.number]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '520px',
    overflow: 'hidden',
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: '40px', height: '40px', color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>Memverifikasi sertifikat...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}>
              <XCircle style={{ width: '36px', height: '36px', color: '#dc2626' }} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
              Sertifikat Tidak Ditemukan
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Nomor sertifikat <strong>{params.number}</strong> tidak ditemukan dalam sistem.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  const isVerified = certificate.status === 'verified';
  const isRevoked = certificate.status === 'revoked';

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: isRevoked ? '#fef2f2' : '#f0fdf4',
          borderBottom: `1px solid ${isRevoked ? '#fecaca' : '#bbf7d0'}`,
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: isRevoked ? '#fee2e2' : '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}>
            {isRevoked ? (
              <XCircle style={{ width: '36px', height: '36px', color: '#dc2626' }} />
            ) : (
              <CheckCircle2 style={{ width: '36px', height: '36px', color: '#16a34a' }} />
            )}
          </div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: isRevoked ? '#dc2626' : '#15803d',
            margin: '0 0 4px 0',
          }}>
            {isRevoked ? 'Dicabut' : 'Terverifikasi'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {isRevoked
              ? 'Sertifikat ini telah dicabut dan tidak lagi berlaku'
              : 'Sertifikat ini valid dan terverifikasi di blockchain'
            }
          </p>
        </div>

        {/* Certificate Details */}
        <div style={{ padding: '24px' }}>
          {/* Cert Number */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <Shield style={{ width: '18px', height: '18px', color: '#475569', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {certificate.certificateNumber}
            </span>
          </div>

          {/* Info Rows */}
          {[
            { label: 'Nama Jamaah', value: certificate.pilgrim.name },
            { label: 'NIK', value: certificate.pilgrim.nik },
            { label: 'Agensi', value: certificate.agency.name },
            { label: 'Tanggal Terbit', value: formatDate(certificate.issuedAt) },
            { label: 'Tanggal Verifikasi', value: certificate.verifiedAt ? formatDate(certificate.verifiedAt) : '-' },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{item.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', textAlign: 'right' }}>{item.value}</span>
            </div>
          ))}

          {/* Blockchain Info */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 12px 0',
            }}>
              Blockchain Info
            </p>

            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0' }}>Transaction Hash</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <code style={{
                  fontSize: '11px',
                  color: '#475569',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  flex: 1,
                }}>
                  {certificate.txHash}
                </code>
                <button
                  onClick={() => copyToClipboard(certificate.txHash)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  title={copied ? 'Tersalin!' : 'Salin'}
                >
                  <Copy style={{ width: '12px', height: '12px', color: copied ? '#16a34a' : '#94a3b8' }} />
                </button>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0' }}>Block Number</p>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', margin: 0, fontFamily: 'monospace' }}>
                #{certificate.blockNumber.toLocaleString()}
              </p>
            </div>

            {certificate.metadata && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px 0' }}>Network</p>
                <p style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>
                  {String((certificate.metadata as Record<string, unknown>).network || 'Gezma Simulated Chain')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            Powered by GEZMA Blockchain Verification System
          </p>
        </div>
      </div>
    </div>
  );
}
