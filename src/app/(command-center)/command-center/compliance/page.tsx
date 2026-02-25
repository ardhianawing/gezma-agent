'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronDown, ChevronUp, Filter, Building2 } from 'lucide-react';
import { useResponsive } from '@/lib/hooks/use-responsive';

const cc = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

interface ComplianceAgency {
  id: string;
  name: string;
  ppiuStatus: string;
  ppiuNumber: string | null;
  ppiuExpiryDate: string | null;
  city: string | null;
  totalPilgrims: number;
  totalScore: number;
  breakdown: {
    ppiu: number;
    document: number;
    activity: number;
    pilgrimVerification: number;
  };
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  active: { bg: '#DCFCE7', text: '#15803D' },
  expiring: { bg: '#FFEDD5', text: '#EA580C' },
  expired: { bg: '#FEE2E2', text: '#DC2626' },
  suspended: { bg: '#F1F5F9', text: '#64748B' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#15803D';
  if (score >= 60) return '#D97706';
  return '#DC2626';
}

function getScoreBg(score: number): string {
  if (score >= 80) return '#DCFCE7';
  if (score >= 60) return '#FEF3C7';
  return '#FEE2E2';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

export default function CompliancePage() {
  const { isMobile } = useResponsive();
  const [agencies, setAgencies] = useState<ComplianceAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (minScore) params.set('minScore', minScore);
      if (maxScore) params.set('maxScore', maxScore);
      const res = await fetch(`/api/command-center/compliance?${params}`);
      if (res.ok) {
        const json = await res.json();
        setAgencies(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, minScore, maxScore]);

  const handleFilter = () => {
    fetchData();
  };

  const breakdownLabels: Record<string, string> = {
    ppiu: 'Status PPIU (40%)',
    document: 'Verifikasi Dokumen (30%)',
    activity: 'Aktivitas Terakhir (20%)',
    pilgrimVerification: 'Verifikasi Jamaah (10%)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck style={{ width: '28px', height: '28px', color: cc.primary }} />
          Compliance Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px' }}>
          Skor kepatuhan agensi berdasarkan status PPIU, dokumen, aktivitas, dan verifikasi jamaah.
        </p>
      </div>

      {/* Filter Toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: cc.cardBg,
            border: `1px solid ${cc.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: cc.textSecondary,
            width: 'fit-content',
          }}
        >
          <Filter style={{ width: '16px', height: '16px' }} />
          Filter
          {showFilters ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
        </button>

        {showFilters && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              padding: '16px',
              backgroundColor: cc.cardBg,
              border: `1px solid ${cc.border}`,
              borderRadius: '12px',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: cc.textMuted, fontWeight: '500' }}>Status PPIU</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 12px',
                  fontSize: '14px',
                  border: `1px solid ${cc.border}`,
                  borderRadius: '8px',
                  backgroundColor: cc.cardBg,
                  color: cc.textPrimary,
                  cursor: 'pointer',
                }}
              >
                <option value="">Semua</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: cc.textMuted, fontWeight: '500' }}>Min Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="0"
                style={{
                  height: '40px',
                  width: '80px',
                  padding: '0 12px',
                  fontSize: '14px',
                  border: `1px solid ${cc.border}`,
                  borderRadius: '8px',
                  backgroundColor: cc.cardBg,
                  color: cc.textPrimary,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: cc.textMuted, fontWeight: '500' }}>Max Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="100"
                style={{
                  height: '40px',
                  width: '80px',
                  padding: '0 12px',
                  fontSize: '14px',
                  border: `1px solid ${cc.border}`,
                  borderRadius: '8px',
                  backgroundColor: cc.cardBg,
                  color: cc.textPrimary,
                }}
              />
            </div>
            <button
              onClick={handleFilter}
              style={{
                height: '40px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: cc.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Terapkan
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <p style={{ textAlign: 'center', color: cc.textMuted, padding: '40px 0' }}>Memuat data compliance...</p>
      ) : agencies.length === 0 ? (
        <p style={{ textAlign: 'center', color: cc.textMuted, padding: '40px 0' }}>Tidak ada data agensi.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {agencies.map((agency) => {
            const isExpanded = expandedId === agency.id;
            const status = statusColors[agency.ppiuStatus] || statusColors.pending;
            return (
              <div
                key={agency.id}
                style={{
                  backgroundColor: cc.cardBg,
                  borderRadius: '12px',
                  border: `1px solid ${cc.border}`,
                  overflow: 'hidden',
                }}
              >
                {/* Main row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : agency.id)}
                  style={{
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: '16px',
                    padding: isMobile ? '14px' : '16px 20px',
                    cursor: 'pointer',
                    flexDirection: isMobile ? 'column' : 'row',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: getScoreBg(agency.totalScore),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Building2 style={{ width: '20px', height: '20px', color: getScoreColor(agency.totalScore) }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/command-center/agencies/${agency.id}`}
                        style={{ textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p style={{ fontSize: '14px', fontWeight: '600', color: cc.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {agency.name}
                        </p>
                      </Link>
                      <p style={{ fontSize: '12px', color: cc.textMuted, margin: '2px 0 0 0' }}>
                        {agency.city || '-'} &middot; {agency.totalPilgrims} jamaah
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: status.bg,
                        color: status.text,
                        textTransform: 'capitalize',
                      }}
                    >
                      {agency.ppiuStatus}
                    </span>

                    {/* Score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: isMobile ? 1 : 'none', minWidth: isMobile ? 0 : '200px' }}>
                      <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: '#F1F5F9', overflow: 'hidden', minWidth: '100px' }}>
                        <div
                          style={{
                            width: `${agency.totalScore}%`,
                            height: '100%',
                            borderRadius: '4px',
                            backgroundColor: getScoreBarColor(agency.totalScore),
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: getScoreColor(agency.totalScore),
                          minWidth: '36px',
                          textAlign: 'right',
                        }}
                      >
                        {agency.totalScore}
                      </span>
                    </div>

                    {isExpanded
                      ? <ChevronUp style={{ width: '18px', height: '18px', color: cc.textMuted, flexShrink: 0 }} />
                      : <ChevronDown style={{ width: '18px', height: '18px', color: cc.textMuted, flexShrink: 0 }} />
                    }
                  </div>
                </div>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div
                    style={{
                      padding: isMobile ? '14px' : '0 20px 20px 20px',
                      borderTop: `1px solid ${cc.borderLight}`,
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: '12px',
                    }}
                  >
                    {Object.entries(agency.breakdown).map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          padding: '12px',
                          backgroundColor: cc.borderLight,
                          borderRadius: '8px',
                        }}
                      >
                        <p style={{ fontSize: '12px', color: cc.textMuted, margin: 0 }}>
                          {breakdownLabels[key] || key}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <div style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${value}%`,
                                height: '100%',
                                borderRadius: '3px',
                                backgroundColor: getScoreBarColor(value),
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: getScoreColor(value), minWidth: '28px', textAlign: 'right' }}>
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
