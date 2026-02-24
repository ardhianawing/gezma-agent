'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, DollarSign, Building2, FileText, CheckCircle, XCircle, Copy, Download } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { formatCurrency } from '@/lib/utils';
import type { Package } from '@/types/package';

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

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
    if (!pkg || !confirm(`Hapus paket "${pkg.name}"?`)) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/packages');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Gagal menghapus paket');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleDuplicate = async () => {
    if (!pkg || duplicating) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/packages/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const newPkg = await res.json();
        router.push(`/packages/${newPkg.id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Gagal menduplikasi paket');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
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
        alert(data.error || 'Gagal membuat brosur');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>Memuat data...</div>;
  }

  if (!pkg) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary }}>Paket tidak ditemukan</p>
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
              Edit Package
            </button>
          </Link>
          <button onClick={handleDelete} style={{
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Pricing</h3>
          </div>
          <div style={{ ...cardBodyStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 4px 0' }}>Published Price</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>{formatCurrency(pkg.publishedPrice)}</p>
            </div>
            {pkg.isPromo && pkg.promoPrice && (
              <div>
                <span style={{
                  display: 'inline-block', padding: '4px 10px', fontSize: '12px', fontWeight: '600',
                  backgroundColor: c.errorLight, color: c.error, borderRadius: '8px',
                }}>Promo Price</span>
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Hotels</h3>
          </div>
          <div style={{ ...cardBodyStyle, display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <div>
              <p style={{ fontWeight: '500', color: c.textPrimary, margin: '0 0 4px 0' }}>Makkah</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 2px 0' }}>{pkg.makkahHotel}</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{pkg.makkahHotelRating} star &bull; {pkg.makkahHotelDistance}</p>
            </div>
            <div>
              <p style={{ fontWeight: '500', color: c.textPrimary, margin: '0 0 4px 0' }}>Madinah</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 2px 0' }}>{pkg.madinahHotel}</p>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{pkg.madinahHotelRating} star &bull; {pkg.madinahHotelDistance}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ ...cardStyle, gridColumn: isMobile ? undefined : '1 / -1' }}>
          <div style={cardHeaderStyle}>
            <FileText style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Package Description</h3>
          </div>
          <div style={cardBodyStyle}>
            <p style={{ color: c.textMuted, margin: 0, lineHeight: '1.6' }}>{pkg.description}</p>
          </div>
        </div>

        {/* Inclusions */}
        <div style={{ ...cardStyle, gridColumn: isMobile ? undefined : 'span 1' }}>
          <div style={cardHeaderStyle}>
            <CheckCircle style={{ width: '18px', height: '18px', color: c.success }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Included</h3>
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Not Included</h3>
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
      </div>
    </div>
  );
}
