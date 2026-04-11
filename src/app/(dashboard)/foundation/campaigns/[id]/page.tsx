'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Users, Calendar, Target } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: string;
  imageUrl: string | null;
  donations: DonationItem[];
  _count: { donations: number };
}

interface DonationItem {
  id: string;
  donorName: string;
  amount: number;
  isAnonymous: boolean;
  method: string;
  createdAt: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  bencana: '\u{1F6A8}',
  masjid: '\u{1F54C}',
  yatim: '\u{1F91D}',
  kesehatan: '\u{1F3E5}',
  pendidikan: '\u{1F4DA}',
  pelatihan: '\u{1F4BC}',
  umrah_dhuafa: '\u{1F4FF}',
};

function formatRupiah(amount: number): string {
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CampaignDetailPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donateForm, setDonateForm] = useState({
    donorName: '',
    donorEmail: '',
    amount: '',
    method: 'transfer',
    isAnonymous: false,
  });
  const [donating, setDonating] = useState(false);
  const [donateError, setDonateError] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`/api/foundation/campaigns/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCampaign(data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchCampaign();
  }, [params.id]);

  const handleDonate = async () => {
    setDonateError('');
    if (!donateForm.donorName || !donateForm.amount) {
      setDonateError(t.foundation.validationRequired);
      return;
    }

    setDonating(true);
    try {
      const res = await fetch(`/api/foundation/campaigns/${params.id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donateForm.donorName,
          donorEmail: donateForm.donorEmail || null,
          amount: parseFloat(donateForm.amount),
          type: 'onetime',
          method: donateForm.method,
          isAnonymous: donateForm.isAnonymous,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDonateError(data.error || t.foundation.donateError);
        return;
      }

      setDonateSuccess(true);
      // Refresh campaign data
      const updated = await fetch(`/api/foundation/campaigns/${params.id}`);
      if (updated.ok) setCampaign(await updated.json());
      setDonateForm({ donorName: '', donorEmail: '', amount: '', method: 'transfer', isAnonymous: false });
    } catch {
      setDonateError(t.foundation.donateError);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: c.textMuted }}>{t.foundation.loadingData}</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: c.textMuted }}>{t.foundation.campaignNotFound}</p>
        <button
          onClick={() => router.back()}
          style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '10px', border: '1px solid ' + c.border, cursor: 'pointer', backgroundColor: 'transparent', color: c.textSecondary }}
        >
          {t.foundation.backBtn}
        </button>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100));
  const daysLeft = campaign.deadline ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86_400_000)) : null;
  const emoji = CATEGORY_EMOJI[campaign.category] || '\u{1F4E6}';

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    minHeight: '44px',
    borderRadius: '10px',
    border: '1px solid ' + c.border,
    backgroundColor: c.pageBg,
    color: c.textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid ' + c.border,
          backgroundColor: 'transparent',
          color: c.textSecondary,
          fontSize: '13px',
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        {t.foundation.backBtn}
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: Campaign Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Thumbnail */}
          <div
            style={{
              height: '260px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
            }}
          >
            {campaign.imageUrl ? (
              <img src={campaign.imageUrl} alt={campaign.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              emoji
            )}
          </div>

          {/* Main Info */}
          <div
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: '#DC262618',
                color: '#DC2626',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              {campaign.category.replace('_', ' ')}
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: c.textPrimary, margin: '0 0 12px', lineHeight: '1.3' }}>
              {campaign.title}
            </h1>
            <p style={{ fontSize: '15px', color: c.textSecondary, lineHeight: '1.7', margin: 0 }}>
              {campaign.description}
            </p>
          </div>

          {/* Progress Card */}
          <div
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: c.primary }}>
                  {formatRupiah(campaign.currentAmount)}
                </span>
                <span style={{ fontSize: '13px', color: c.textMuted }}>{t.foundation.fromTarget} {formatRupiah(campaign.targetAmount)}</span>
              </div>
              <div
                style={{
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: c.border,
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: c.primary,
                    borderRadius: '5px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>{pct}% {t.foundation.progressAchieved}</p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              {[
                { icon: Users, label: t.foundation.donorLabel, value: String(campaign._count.donations) },
                { icon: Target, label: t.foundation.target, value: formatRupiah(campaign.targetAmount) },
                { icon: Calendar, label: t.foundation.deadline, value: daysLeft !== null ? `${daysLeft} hari` : t.foundation.noDeadline },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} style={{ textAlign: 'center', padding: '12px', backgroundColor: c.pageBg, borderRadius: '10px' }}>
                    <Icon style={{ width: '18px', height: '18px', color: c.primary, margin: '0 auto 6px' }} />
                    <p style={{ fontSize: '13px', fontWeight: 700, color: c.textPrimary, margin: '0 0 2px' }}>{stat.value}</p>
                    <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Donors */}
          {campaign.donations.length > 0 && (
            <div
              style={{
                backgroundColor: c.cardBg,
                border: '1px solid ' + c.border,
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
                {t.foundation.recentDonors}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {campaign.donations.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px',
                      backgroundColor: c.pageBg,
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: c.primaryLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                        }}
                      >
                        {'\u{1F464}'}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
                          {d.isAnonymous ? t.foundation.anonymous : d.donorName}
                        </p>
                        <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>
                          {formatDate(d.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: c.primary }}>
                      {formatRupiah(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Donate Form */}
        <div
          style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '16px',
            padding: '24px',
            position: isMobile ? 'static' : 'sticky',
            top: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Heart style={{ width: '22px', height: '22px', color: '#DC2626' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
              {t.foundation.donateBtn}
            </h3>
          </div>

          {donateSuccess && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#16A34A',
                fontSize: '14px',
                marginBottom: '16px',
                fontWeight: 500,
              }}
            >
              {'\u{2705}'} {t.foundation.donateSuccess}
            </div>
          )}

          {donateError && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            >
              {donateError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>
                {t.foundation.labelDonorName}
              </label>
              <input
                type="text"
                value={donateForm.donorName}
                onChange={(e) => setDonateForm({ ...donateForm, donorName: e.target.value })}
                placeholder={t.foundation.placeholderDonorName}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }}
                onBlur={(e) => { e.target.style.borderColor = c.border; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>
                {t.foundation.labelDonorEmail}
              </label>
              <input
                type="email"
                value={donateForm.donorEmail}
                onChange={(e) => setDonateForm({ ...donateForm, donorEmail: e.target.value })}
                placeholder={t.foundation.placeholderDonorEmail}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }}
                onBlur={(e) => { e.target.style.borderColor = c.border; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>
                {t.foundation.labelDonationAmount}
              </label>
              <input
                type="number"
                value={donateForm.amount}
                onChange={(e) => setDonateForm({ ...donateForm, amount: e.target.value })}
                placeholder={t.foundation.placeholderDonationAmount}
                min="1"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }}
                onBlur={(e) => { e.target.style.borderColor = c.border; }}
              />
              {/* Quick amount buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                {[25000, 50000, 100000, 250000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonateForm({ ...donateForm, amount: String(amt) })}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid ' + c.border,
                      backgroundColor: donateForm.amount === String(amt) ? c.primaryLight : 'transparent',
                      color: donateForm.amount === String(amt) ? c.primary : c.textMuted,
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {(amt / 1000).toFixed(0)}Rb
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>
                {t.foundation.labelPaymentMethod}
              </label>
              <select
                value={donateForm.method}
                onChange={(e) => setDonateForm({ ...donateForm, method: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="transfer">{t.foundation.methodTransfer}</option>
                <option value="cash">{t.foundation.methodCash}</option>
                <option value="gezmapay">{t.foundation.methodGezmaPay}</option>
              </select>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                color: c.textSecondary,
              }}
            >
              <input
                type="checkbox"
                checked={donateForm.isAnonymous}
                onChange={(e) => setDonateForm({ ...donateForm, isAnonymous: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              {t.foundation.donateAnonymous}
            </label>

            <button
              type="button"
              onClick={handleDonate}
              disabled={donating || campaign.status !== 'active'}
              style={{
                width: '100%',
                padding: '14px',
                minHeight: '52px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: campaign.status !== 'active' ? c.border : donating ? '#991B1B' : '#DC2626',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: campaign.status !== 'active' || donating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.15s',
              }}
            >
              <Heart style={{ width: '20px', height: '20px' }} />
              {donating ? t.foundation.donatingBtn : campaign.status !== 'active' ? t.foundation.campaignEndedBtn : t.foundation.donateBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
