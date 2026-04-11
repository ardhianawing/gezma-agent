'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Building2, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface Financing {
  id: string;
  amount: number;
  purpose: string;
  tenorMonths: number;
  monthlyAmount: number;
  status: string;
  notes: string | null;
  approvedAt: string | null;
  createdAt: string;
  installments: Installment[];
}

interface Installment {
  id: string;
  installmentNo: number;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
}

function formatRupiah(amount: number): string {
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// STATUS_CONFIG labels are set dynamically using t.foundation keys below

export default function FinancingPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: '#D97706', label: t.foundation.statusPending },
    approved: { icon: CheckCircle, color: '#16A34A', label: t.foundation.statusApproved },
    rejected: { icon: XCircle, color: '#DC2626', label: t.foundation.statusRejected },
    active: { icon: AlertCircle, color: '#2563EB', label: t.foundation.statusActive },
    completed: { icon: CheckCircle, color: '#6B7280', label: t.foundation.statusCompleted },
  };

  const [financings, setFinancings] = useState<Financing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', purpose: '', tenorMonths: '6' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFinancings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/foundation/financing');
      if (res.ok) {
        const data = await res.json();
        setFinancings(data.financings || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFinancings(); }, [fetchFinancings]);

  const monthlyPreview = form.amount && form.tenorMonths
    ? parseFloat(form.amount) / parseInt(form.tenorMonths, 10)
    : 0;

  const handleSubmit = async () => {
    setFormError('');
    if (!form.amount || !form.purpose) {
      setFormError(t.foundation.financingValidationRequired);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/foundation/financing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          purpose: form.purpose,
          tenorMonths: parseInt(form.tenorMonths, 10),
        }),
      });
      if (res.ok) {
        setFormSuccess(true);
        setShowForm(false);
        setForm({ amount: '', purpose: '', tenorMonths: '6' });
        fetchFinancings();
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        const data = await res.json();
        setFormError(data.error || t.foundation.applyError);
      }
    } catch {
      setFormError(t.foundation.applyError);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    minHeight: '44px',
    borderRadius: '10px',
    border: '1px solid ' + c.border,
    backgroundColor: c.cardBg,
    color: c.textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t.foundation.financingTitle}
        description={t.foundation.financingDesc}
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', minHeight: '44px', borderRadius: '10px',
              border: 'none', backgroundColor: c.primary, color: '#fff',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            {t.foundation.financingApply}
          </button>
        }
      />

      {/* Info Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Building2 style={{ width: '20px', height: '20px', color: '#2563EB', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E40AF', margin: '0 0 4px' }}>{t.foundation.financingBannerTitle}</p>
          <p style={{ fontSize: '13px', color: '#3B82F6', margin: 0, lineHeight: '1.5' }}>
            {t.foundation.financingBannerDesc}
          </p>
        </div>
      </div>

      {/* Success */}
      {formSuccess && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: '14px', fontWeight: 500 }}>
          {'\u{2705}'} {t.foundation.applySuccess}
        </div>
      )}

      {/* Application Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.primary,
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 20px' }}>
            {t.foundation.financingFormTitle}
          </h3>

          {formError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>
                {t.foundation.labelLoanAmount}
              </label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder={t.foundation.placeholderLoanAmount} min="1" max="500000000" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }} onBlur={(e) => { e.target.style.borderColor = c.border; }} />
              {form.amount && (
                <p style={{ fontSize: '12px', color: c.textMuted, marginTop: '4px' }}>
                  = {parseFloat(form.amount || '0').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>
                {t.foundation.labelLoanPurpose}
              </label>
              <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder={t.foundation.placeholderLoanPurpose} rows={4}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }} onBlur={(e) => { e.target.style.borderColor = c.border; }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>
                {t.foundation.labelTenor}
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[3, 6, 12].map((tenor) => {
                  const isSelected = form.tenorMonths === String(tenor);
                  return (
                    <button
                      key={tenor}
                      type="button"
                      onClick={() => setForm({ ...form, tenorMonths: String(tenor) })}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid ' + c.primary : '1px solid ' + c.border,
                        backgroundColor: isSelected ? c.primaryLight : 'transparent',
                        color: isSelected ? c.primary : c.textSecondary,
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 400,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tenor} {t.foundation.months}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {monthlyPreview > 0 && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: c.primaryLight,
                  border: '1px solid ' + c.primary + '40',
                }}
              >
                <p style={{ fontSize: '13px', color: c.textSecondary, margin: '0 0 4px' }}>{t.foundation.monthlyEstimate}</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: c.primary, margin: 0 }}>
                  {formatRupiah(monthlyPreview)}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0 0' }}>
                  x {form.tenorMonths} {t.foundation.months} = {form.amount ? formatRupiah(parseFloat(form.amount)) : '-'}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setFormError(''); }}
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid ' + c.border, backgroundColor: 'transparent', color: c.textSecondary, fontSize: '14px', cursor: 'pointer' }}>
                {t.foundation.cancelBtn}
              </button>
              <button type="button" onClick={handleSubmit} disabled={submitting}
                style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', backgroundColor: submitting ? c.border : c.primary, color: '#fff', fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? t.foundation.financingSubmittingBtn : t.foundation.financingSubmitBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financing List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: c.cardBg, borderRadius: '14px', border: '1px solid ' + c.border }}>
          <p style={{ color: c.textMuted }}>{t.foundation.loadingData}</p>
        </div>
      ) : financings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: c.cardBg, borderRadius: '14px', border: '1px solid ' + c.border }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'\u{1F3E6}'}</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>{t.foundation.emptyTitle}</p>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{t.foundation.financingEmptyDesc}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {financings.map((item) => {
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const Icon = status.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: c.cardBg,
                  border: '1px solid ' + c.border,
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      backgroundColor: status.color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px', color: status.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary }}>
                        {formatRupiah(item.amount)}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: status.color, backgroundColor: status.color + '18', padding: '2px 8px', borderRadius: '6px' }}>
                        {status.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: c.textSecondary, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.purpose}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: c.textMuted }}>
                        {item.tenorMonths} {t.foundation.months} · {formatRupiah(item.monthlyAmount)}/{t.foundation.months}
                      </span>
                      <span style={{ fontSize: '12px', color: c.textMuted }}>
                        {t.foundation.submittedOn} {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <span style={{ color: c.textMuted, fontSize: '20px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    {'\u{25BE}'}
                  </span>
                </div>

                {/* Installments */}
                {isExpanded && item.installments.length > 0 && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid ' + c.borderLight }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: c.textSecondary, margin: '16px 0 12px' }}>
                      {t.foundation.installmentSchedule}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '8px' }}>
                      {item.installments.map((ins) => {
                        const isPaid = ins.status === 'paid';
                        const isOverdue = ins.status === 'overdue';
                        return (
                          <div
                            key={ins.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              backgroundColor: isPaid ? '#F0FDF4' : isOverdue ? '#FEF2F2' : c.pageBg,
                              border: '1px solid ' + (isPaid ? '#BBF7D0' : isOverdue ? '#FECACA' : c.borderLight),
                            }}
                          >
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
                                {t.foundation.installmentLabel} {ins.installmentNo}
                              </p>
                              <p style={{ fontSize: '11px', color: c.textMuted, margin: '2px 0 0' }}>
                                <Calendar style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />
                                {formatDate(ins.dueDate)}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '13px', fontWeight: 700, color: isPaid ? '#16A34A' : isOverdue ? '#DC2626' : c.textPrimary, margin: 0 }}>
                                {formatRupiah(ins.amount)}
                              </p>
                              <p style={{ fontSize: '11px', color: isPaid ? '#16A34A' : isOverdue ? '#DC2626' : c.textMuted, margin: '2px 0 0' }}>
                                {isPaid ? `\u{2705} ${t.foundation.installmentPaid}` : isOverdue ? `\u{26A0} ${t.foundation.installmentOverdue}` : t.foundation.installmentPending}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
