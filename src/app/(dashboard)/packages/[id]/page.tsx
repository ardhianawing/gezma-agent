'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, DollarSign, Building2, FileText, CheckCircle, XCircle, Copy, Download, MapPin, Calendar } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import type { Package, ItineraryDay } from '@/types/package';
import { DetailSkeleton } from '@/components/shared/loading-skeleton';
import { useLanguage } from '@/lib/i18n';

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(false);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const res = await fetch(`/api/packages/${id}`);
        if (!res.ok) throw new Error('Not found');
        setPkg(await res.json());
      } catch {
        setPkg(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [id]);

  const handleDelete = async () => {
    if (!pkg) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'success', title: t.common.success });
        router.push('/packages');
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: 'error', title: t.common.error, description: data.error || 'Terjadi kesalahan' });
      }
    } catch {
      addToast({ type: 'error', title: t.common.errorNetwork });
    }
    setDeleteTarget(false);
  };

  const handleDuplicate = async () => {
    if (!pkg || duplicating) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/packages/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const newPkg = await res.json();
        router.push(`/packages/${newPkg.id}`);
        addToast({ type: 'success', title: t.common.success });
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: 'error', title: t.common.error, description: data.error });
      }
    } catch {
      addToast({ type: 'error', title: t.common.errorNetwork });
    } finally {
      setDuplicating(false);
    }
  };

  const handleBrochure = async () => {
    if (!pkg || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const res = await fetch(`/api/packages/${id}/brochure`, { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `brosur-${pkg.slug || pkg.name}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: 'error', title: t.common.error, description: data.error });
      }
    } catch {
      addToast({ type: 'error', title: t.common.errorNetwork });
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!pkg) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary }}>{t.common.noData}</p>
          <Link href="/packages" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px',
              backgroundColor: c.cardBg, color: c.textSecondary, border: `1px solid ${c.border}`,
              borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Kembali ke Daftar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    borderRadius: '16px',
    border: `1px solid ${c.border}`,
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: isMobile ? '16px 20px' : '20px 28px',
    borderBottom: `1px solid ${c.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const cardBodyStyle: React.CSSProperties = {
    padding: isMobile ? '20px' : '28px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/packages" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '8px',
              borderRadius: '8px', color: c.textSecondary, display: 'flex', alignItems: 'center',
            }}>
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </button>
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>{pkg.name}</h1>
            <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
              {pkg.duration} days &bull; {pkg.category.toUpperCase()}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleBrochure} disabled={generatingPdf} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: c.cardBg, color: c.textSecondary, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600',
            cursor: generatingPdf ? 'not-allowed' : 'pointer', opacity: generatingPdf ? 0.6 : 1,
          }}>
            <Download style={{ width: '16px', height: '16px' }} />
            {generatingPdf ? 'Generating...' : 'Brosur PDF'}
          </button>
          <button onClick={handleDuplicate} disabled={duplicating} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: c.cardBg, color: c.textSecondary, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600',
            cursor: duplicating ? 'not-allowed' : 'pointer', opacity: duplicating ? 0.6 : 1,
          }}>
            <Copy style={{ width: '16px', height: '16px' }} />
            {duplicating ? 'Menduplikasi...' : 'Duplikat'}
          </button>
          <Link href={`/packages/${pkg.id}/edit`} style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: c.cardBg, color: c.textSecondary, border: `1px solid ${c.border}`,
              borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              <Edit style={{ width: '16px', height: '16px' }} />
              Ubah Paket
            </button>
          </Link>
          <button onClick={() => setDeleteTarget(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: c.cardBg, color: c.textSecondary, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}>
            <Trash2 style={{ width: '16px', height: '16px' }} />
            Hapus
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
      }}>
        {/* Pricing */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <DollarSign style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Harga</h3>
          </div>
          <div style={{ ...cardBodyStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 4px 0' }}>Harga Jual</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>{formatCurrency(pkg.publishedPrice)}</p>
            </div>
            {pkg.isPromo && pkg.promoPrice && (
              <div>
                <span style={{
                  display: 'inline-block', padding: '4px 10px', fontSize: '12px', fontWeight: '600',
                  backgroundColor: c.errorLight, color: c.error, borderRadius: '8px',
                }}>Harga Promo</span>
                <p style={{ fontSize: '20px', fontWeight: '700', color: c.error, margin: '4px 0 0 0' }}>{formatCurrency(pkg.promoPrice)}</p>
              </div>
            )}
            <div style={{ paddingTop: '12px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: c.textMuted }}>HPP</span>
                <span style={{ color: c.textPrimary }}>{formatCurrency(pkg.totalHpp)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: c.textMuted }}>Margin</span>
                <span style={{ color: c.success }}>{pkg.margin}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotels */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Building2 style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Hotel</h3>
          </div>
          <div style={{ ...cardBodyStyle, display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <div>
              <p style={{ fontWeight: '500', color: c.textPrimary, margin: '0 0 4px 0' }}>Makkah</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 2px 0' }}>{pkg.makkahHotel}</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{pkg.makkahHotelRating} bintang &bull; {pkg.makkahHotelDistance}</p>
            </div>
            <div>
              <p style={{ fontWeight: '500', color: c.textPrimary, margin: '0 0 4px 0' }}>Madinah</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 2px 0' }}>{pkg.madinahHotel}</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{pkg.madinahHotelRating} bintang &bull; {pkg.madinahHotelDistance}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ ...cardStyle, gridColumn: isMobile ? undefined : '1 / -1' }}>
          <div style={cardHeaderStyle}>
            <FileText style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Deskripsi Paket</h3>
          </div>
          <div style={cardBodyStyle}>
            <p style={{ color: c.textMuted, margin: 0, lineHeight: '1.6' }}>{pkg.description}</p>
          </div>
        </div>

        {/* Inclusions */}
        <div style={{ ...cardStyle, gridColumn: isMobile ? undefined : 'span 1' }}>
          <div style={cardHeaderStyle}>
            <CheckCircle style={{ width: '18px', height: '18px', color: c.success }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Termasuk</h3>
          </div>
          <div style={cardBodyStyle}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pkg.inclusions.map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: c.textMuted }}>
                  <span style={{ color: c.success, marginTop: '2px' }}>&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Exclusions */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <XCircle style={{ width: '18px', height: '18px', color: c.error }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Tidak Termasuk</h3>
          </div>
          <div style={cardBodyStyle}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pkg.exclusions.map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: c.textMuted }}>
                  <span style={{ color: c.error, marginTop: '2px' }}>&#10007;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Itinerary */}
        <div style={{ ...cardStyle, gridColumn: isMobile ? undefined : '1 / -1' }}>
          <div style={cardHeaderStyle}>
            <Calendar style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Jadwal Perjalanan</h3>
          </div>
          <div style={cardBodyStyle}>
            {(() => {
              const itinerary: ItineraryDay[] = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
              if (itinerary.length === 0) {
                return (
                  <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '24px 0' }}>
                    Belum ada itinerary untuk paket ini.
                  </p>
                );
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {itinerary.map((day, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px' }}>
                      {/* Timeline line + circle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px', flexShrink: 0 }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundColor: c.primary, color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, flexShrink: 0,
                        }}>
                          H-{day.day}
                        </div>
                        {i < itinerary.length - 1 && (
                          <div style={{ width: '2px', flex: 1, backgroundColor: c.border, minHeight: '20px' }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, paddingBottom: i < itinerary.length - 1 ? '24px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                            {day.title}
                          </h4>
                          {day.city && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '11px', fontWeight: 600,
                              padding: '2px 10px', borderRadius: '20px',
                              backgroundColor: day.city.toLowerCase().includes('makkah') ? '#FEF3C7' :
                                day.city.toLowerCase().includes('madinah') ? '#DBEAFE' :
                                day.city.toLowerCase().includes('jeddah') ? '#F3E8FF' : c.cardBgHover,
                              color: day.city.toLowerCase().includes('makkah') ? '#D97706' :
                                day.city.toLowerCase().includes('madinah') ? '#2563EB' :
                                day.city.toLowerCase().includes('jeddah') ? '#7C3AED' : c.textSecondary,
                            }}>
                              <MapPin style={{ width: '10px', height: '10px' }} />
                              {day.city}
                            </span>
                          )}
                        </div>
                        {day.description && (
                          <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 8px 0', lineHeight: 1.5 }}>
                            {day.description}
                          </p>
                        )}
                        {day.activities && day.activities.length > 0 && (
                          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {day.activities.map((act, j) => {
                              const actTitle = typeof act === 'string' ? act : act.title;
                              const actTime = typeof act === 'string' ? null : act.time;
                              return (
                                <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: c.textSecondary }}>
                                  <span style={{ color: c.textLight, marginTop: '1px' }}>&bull;</span>
                                  {actTime && (
                                    <span style={{ fontWeight: 600, color: c.textMuted, minWidth: '42px', flexShrink: 0 }}>{actTime}</span>
                                  )}
                                  {actTitle}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={deleteTarget}
        onClose={() => setDeleteTarget(false)}
        onConfirm={handleDelete}
        title={`Hapus paket "${pkg?.name}"?`}
        description="Data paket akan dihapus permanen."
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  );
}
