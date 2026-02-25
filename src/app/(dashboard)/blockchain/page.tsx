'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, X, CheckCircle2, XCircle, Clock, Eye, AlertTriangle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { TableSkeleton, StatsSkeleton } from '@/components/shared/loading-skeleton';

interface Certificate {
  id: string;
  certificateNumber: string;
  txHash: string;
  blockNumber: number;
  metadata: Record<string, unknown> | null;
  status: string;
  issuedAt: string;
  verifiedAt: string | null;
  createdAt: string;
  pilgrim: { name: string; nik: string; phone?: string; email?: string };
  agency: { name: string };
}

interface Stats {
  total: number;
  verified: number;
  revoked: number;
}

interface Pilgrim {
  id: string;
  name: string;
  nik: string;
}

export default function BlockchainPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { addToast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Issue modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [selectedPilgrimId, setSelectedPilgrimId] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Revoke confirm
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const fetchCertificates = async (p: number = 1) => {
    try {
      const res = await fetch(`/api/blockchain/certificates?page=${p}&limit=20`);
      const json = await res.json();
      setCertificates(json.data || []);
      setStats(json.stats || { total: 0, verified: 0, revoked: 0 });
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates(page);
  }, [page]);

  const openIssueModal = async () => {
    setShowIssueModal(true);
    setSelectedPilgrimId('');
    setIssueError('');
    try {
      const res = await fetch('/api/pilgrims?limit=100');
      const json = await res.json();
      setPilgrims(json.data || []);
    } catch {
      setPilgrims([]);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedPilgrimId) {
      setIssueError('Pilih jamaah terlebih dahulu');
      return;
    }
    setIssuing(true);
    setIssueError('');
    try {
      const res = await fetch('/api/blockchain/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilgrimId: selectedPilgrimId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setIssueError(json.error || 'Gagal menerbitkan sertifikat');
        return;
      }
      setShowIssueModal(false);
      addToast({ type: 'success', title: 'Sertifikat berhasil diterbitkan' });
      setPage(1);
      fetchCertificates(1);
    } catch {
      setIssueError('Terjadi kesalahan jaringan');
      addToast({ type: 'error', title: 'Terjadi kesalahan jaringan' });
    } finally {
      setIssuing(false);
    }
  };

  const openDetailModal = async (cert: Certificate) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/blockchain/certificates/${cert.id}`);
      const json = await res.json();
      setSelectedCert(json.data || cert);
    } catch {
      setSelectedCert(cert);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedCert) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/blockchain/certificates/${selectedCert.id}/revoke`, {
        method: 'POST',
      });
      if (res.ok) {
        setShowRevokeConfirm(false);
        setShowDetailModal(false);
        addToast({ type: 'success', title: 'Sertifikat berhasil dicabut' });
        fetchCertificates(page);
      } else {
        addToast({ type: 'error', title: 'Gagal mencabut sertifikat' });
      }
    } catch {
      addToast({ type: 'error', title: 'Gagal mencabut sertifikat' });
    } finally {
      setRevoking(false);
    }
  };

  const truncateHash = (hash: string) => {
    if (!hash) return '-';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusBadge = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
    };
    if (status === 'verified') {
      return { ...base, backgroundColor: '#dcfce7', color: '#15803d' };
    }
    if (status === 'revoked') {
      return { ...base, backgroundColor: '#fee2e2', color: '#dc2626' };
    }
    return { ...base, backgroundColor: '#fef9c3', color: '#a16207' };
  };

  const statusLabel = (status: string) => {
    if (status === 'verified') return 'Terverifikasi';
    if (status === 'revoked') return 'Dicabut';
    return 'Pending';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'verified') return <CheckCircle2 style={{ width: '14px', height: '14px' }} />;
    if (status === 'revoked') return <XCircle style={{ width: '14px', height: '14px' }} />;
    return <Clock style={{ width: '14px', height: '14px' }} />;
  };

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px' }}>
        <StatsSkeleton count={3} />
        <div style={{ marginTop: '24px' }}><TableSkeleton rows={5} columns={5} /></div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            Blockchain Verification
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
            Kelola sertifikat blockchain untuk jamaah Anda
          </p>
        </div>
        <button
          onClick={openIssueModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: c.primary,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Terbitkan Sertifikat
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          { label: 'Total Diterbitkan', value: stats.total, color: c.primary, icon: Shield },
          { label: 'Terverifikasi', value: stats.verified, color: '#16a34a', icon: CheckCircle2 },
          { label: 'Dicabut', value: stats.revoked, color: '#dc2626', icon: XCircle },
        ].map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: `${stat.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <stat.icon style={{ width: '24px', height: '24px', color: stat.color }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: '4px 0 0 0' }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Table */}
      <div style={{
        backgroundColor: c.cardBg,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {isMobile ? (
          /* Mobile: Card layout */
          <div style={{ padding: '12px' }}>
            {certificates.length === 0 ? (
              <EmptyState icon={Shield} title="Belum ada sertifikat" />
            ) : (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => openDetailModal(cert)}
                  style={{
                    padding: '16px',
                    borderBottom: `1px solid ${c.borderLight}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                      {cert.pilgrim.name}
                    </p>
                    <span style={statusBadge(cert.status)}>
                      <StatusIcon status={cert.status} />
                      {statusLabel(cert.status)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0', fontFamily: 'monospace' }}>
                    {cert.certificateNumber}
                  </p>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                    {formatDate(cert.issuedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop/Tablet: Table layout */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: c.cardBgHover }}>
                  {['Jamaah', 'No. Sertifikat', 'TX Hash', 'Status', 'Tanggal', 'Aksi'].map((header) => (
                    <th key={header} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: c.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: `1px solid ${c.border}`,
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={Shield} title="Belum ada sertifikat" />
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr key={cert.id} style={{ borderBottom: `1px solid ${c.borderLight}` }}>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                          {cert.pilgrim.name}
                        </p>
                        <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                          {cert.pilgrim.nik}
                        </p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: c.textSecondary }}>
                          {cert.certificateNumber}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: c.textMuted }}>
                          {truncateHash(cert.txHash)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={statusBadge(cert.status)}>
                          <StatusIcon status={cert.status} />
                          {statusLabel(cert.status)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: c.textSecondary }}>
                        {formatDate(cert.issuedAt)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => openDetailModal(cert)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${c.border}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: c.textSecondary,
                            cursor: 'pointer',
                          }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px',
            borderTop: `1px solid ${c.borderLight}`,
          }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                color: page === 1 ? c.textLight : c.textSecondary,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Sebelumnya
            </button>
            <span style={{ fontSize: '13px', color: c.textMuted }}>
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                color: page === totalPages ? c.textLight : c.textSecondary,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Issue Certificate Modal */}
      {showIssueModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          padding: '16px',
        }}>
          <div role="dialog" aria-modal="true" style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
                Terbitkan Sertifikat
              </h2>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px', color: c.textMuted }} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: c.textSecondary, margin: '0 0 16px 0' }}>
              Pilih jamaah untuk diterbitkan sertifikat blockchain
            </p>

            <select
              value={selectedPilgrimId}
              onChange={(e) => setSelectedPilgrimId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                backgroundColor: c.inputBg,
                color: c.textPrimary,
                fontSize: '14px',
                marginBottom: '12px',
                outline: 'none',
              }}
            >
              <option value="">-- Pilih Jamaah --</option>
              {pilgrims.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.nik})
                </option>
              ))}
            </select>

            {issueError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '12px',
              }}>
                <AlertTriangle style={{ width: '16px', height: '16px', color: '#dc2626', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{issueError}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${c.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: c.textSecondary,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleIssueCertificate}
                disabled={issuing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: c.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: issuing ? 'not-allowed' : 'pointer',
                  opacity: issuing ? 0.7 : 1,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {issuing && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                  {issuing ? 'Memproses...' : 'Terbitkan'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          padding: '16px',
        }}>
          <div role="dialog" aria-modal="true" style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
                Detail Sertifikat
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px', color: c.textMuted }} />
              </button>
            </div>

            {detailLoading ? (
              <p style={{ textAlign: 'center', color: c.textMuted, fontSize: '14px' }}>Memuat...</p>
            ) : (
              <>
                {/* Status */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <span style={{ ...statusBadge(selectedCert.status), fontSize: '14px', padding: '6px 16px' }}>
                    <StatusIcon status={selectedCert.status} />
                    {statusLabel(selectedCert.status)}
                  </span>
                </div>

                {/* Certificate Info */}
                <div style={{
                  backgroundColor: c.pageBg,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  {[
                    { label: 'No. Sertifikat', value: selectedCert.certificateNumber },
                    { label: 'Jamaah', value: selectedCert.pilgrim.name },
                    { label: 'NIK', value: selectedCert.pilgrim.nik },
                    { label: 'Agensi', value: selectedCert.agency.name },
                    { label: 'Tanggal Terbit', value: formatDate(selectedCert.issuedAt) },
                    { label: 'Tanggal Verifikasi', value: selectedCert.verifiedAt ? formatDate(selectedCert.verifiedAt) : '-' },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: `1px solid ${c.borderLight}`,
                    }}>
                      <span style={{ fontSize: '13px', color: c.textMuted }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Blockchain Explorer Info */}
                <div style={{
                  backgroundColor: c.pageBg,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: c.textPrimary, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Blockchain Explorer
                  </p>

                  {/* TX Hash */}
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px 0' }}>Transaction Hash</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{
                        fontSize: '12px',
                        color: c.textSecondary,
                        backgroundColor: c.cardBg,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${c.borderLight}`,
                        flex: 1,
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                      }}>
                        {selectedCert.txHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedCert.txHash)}
                        title="Salin"
                        aria-label="Salin"
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${c.border}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <Copy style={{ width: '14px', height: '14px', color: c.textMuted }} />
                      </button>
                    </div>
                  </div>

                  {/* Block Number */}
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px 0' }}>Block Number</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, fontFamily: 'monospace' }}>
                      #{selectedCert.blockNumber.toLocaleString()}
                    </p>
                  </div>

                  {/* Metadata */}
                  {selectedCert.metadata && (
                    <div>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 8px 0' }}>Metadata</p>
                      {Object.entries(selectedCert.metadata).map(([key, val]) => (
                        <div key={key} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 0',
                        }}>
                          <span style={{ fontSize: '12px', color: c.textMuted }}>{key}</span>
                          <span style={{ fontSize: '12px', color: c.textSecondary, fontFamily: 'monospace' }}>
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Public verification link */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: `${c.primary}10`,
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <ExternalLink style={{ width: '16px', height: '16px', color: c.primary, flexShrink: 0 }} />
                  <a
                    href={`/verify/certificate/${selectedCert.certificateNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: c.primary, textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    {typeof window !== 'undefined' ? window.location.origin : ''}/verify/certificate/{selectedCert.certificateNumber}
                  </a>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {selectedCert.status === 'verified' && (
                    <button
                      onClick={() => setShowRevokeConfirm(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 20px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      <XCircle style={{ width: '16px', height: '16px' }} />
                      Cabut Sertifikat
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${c.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: c.textSecondary,
                      cursor: 'pointer',
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {showRevokeConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '16px',
        }}>
          <div role="dialog" aria-modal="true" style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <AlertTriangle style={{ width: '28px', height: '28px', color: '#dc2626' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: c.textPrimary, margin: '0 0 8px 0' }}>
              Cabut Sertifikat?
            </h3>
            <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 20px 0' }}>
              Tindakan ini tidak dapat dibatalkan. Sertifikat akan ditandai sebagai dicabut.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowRevokeConfirm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${c.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: c.textSecondary,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: revoking ? 'not-allowed' : 'pointer',
                  opacity: revoking ? 0.7 : 1,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {revoking && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                  {revoking ? 'Memproses...' : 'Ya, Cabut'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
