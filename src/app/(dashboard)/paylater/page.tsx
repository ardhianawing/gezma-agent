'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface Installment {
  id: string;
  installmentNo: number;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
}

interface PayLaterApp {
  id: string;
  pilgrimName: string;
  pilgrimPhone: string;
  totalAmount: number;
  tenorMonths: number;
  monthlyAmount: number;
  akadType: string;
  marginRate: number;
  status: string;
  notes: string | null;
  installments: Installment[];
  createdAt: string;
}

const MARGIN_RATE = 0.015; // 1.5% per month

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function calculateMonthly(total: number, tenorMonths: number): number {
  return (total * (1 + MARGIN_RATE * tenorMonths / 12)) / tenorMonths;
}

// Status badge functions moved inside component for i18n

export default function PayLaterPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();

  function getStatusBadge(status: string): { bg: string; text: string; label: string } {
    switch (status) {
      case 'pending':
        return { bg: '#fef9c3', text: '#854d0e', label: t.payLater.statusPending };
      case 'approved':
        return { bg: '#dcfce7', text: '#166534', label: t.payLater.statusApproved };
      case 'rejected':
        return { bg: '#fecaca', text: '#991b1b', label: t.payLater.statusRejected };
      case 'active':
        return { bg: '#dbeafe', text: '#1e40af', label: t.payLater.statusActive };
      case 'completed':
        return { bg: '#d1fae5', text: '#065f46', label: t.payLater.statusCompleted };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', label: status };
    }
  }

  function getInstallmentStatusBadge(status: string): { bg: string; text: string; label: string } {
    switch (status) {
      case 'paid':
        return { bg: '#dcfce7', text: '#166534', label: t.payLater.installmentPaid };
      case 'pending':
        return { bg: '#fef9c3', text: '#854d0e', label: t.payLater.installmentPending };
      case 'overdue':
        return { bg: '#fecaca', text: '#991b1b', label: t.payLater.installmentOverdue };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', label: status };
    }
  }

  const [applications, setApplications] = useState<PayLaterApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Calculator
  const [calcTotal, setCalcTotal] = useState('');
  const [calcTenor, setCalcTenor] = useState(6);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    pilgrimName: '',
    pilgrimPhone: '',
    totalAmount: '',
    tenorMonths: '6',
    akadType: 'murabahah',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paylater');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Gagal memuat data PayLater:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.pilgrimName || !form.pilgrimPhone || !form.totalAmount) return;

    setFormLoading(true);
    try {
      const res = await fetch('/api/paylater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilgrimName: form.pilgrimName,
          pilgrimPhone: form.pilgrimPhone,
          totalAmount: parseFloat(form.totalAmount),
          tenorMonths: parseInt(form.tenorMonths, 10),
          akadType: form.akadType,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ pilgrimName: '', pilgrimPhone: '', totalAmount: '', tenorMonths: '6', akadType: 'murabahah' });
        fetchData();
      }
    } catch (error) {
      console.error('Gagal mengajukan PayLater:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const calcMonthly = calcTotal && parseFloat(calcTotal) > 0
    ? calculateMonthly(parseFloat(calcTotal), calcTenor)
    : 0;
  const calcTotalPayment = calcMonthly * calcTenor;

  const selectedApplication = applications.find((a) => a.id === selectedApp);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t.payLater.title}
        description={t.payLater.description}
      />

      {/* Info Card */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '16px' : '24px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 12px' }}>
          {t.payLater.akadTitle}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '14px',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{'\uD83D\uDCDC'}</div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', margin: '0 0 4px' }}>
              {t.payLater.murabahahTitle}
            </h4>
            <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0, lineHeight: '1.5' }}>
              {t.payLater.murabahahDesc}
            </p>
          </div>
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{'\uD83E\uDD1D'}</div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#166534', margin: '0 0 4px' }}>
              {t.payLater.ijarahTitle}
            </h4>
            <p style={{ fontSize: '12px', color: '#22c55e', margin: 0, lineHeight: '1.5' }}>
              {t.payLater.ijarahDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '16px' : '24px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
          {t.payLater.calculatorTitle}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
              {t.payLater.calcTotalLabel}
            </label>
            <input
              type="number"
              value={calcTotal}
              onChange={(e) => setCalcTotal(e.target.value)}
              placeholder={t.payLater.calcTotalPlaceholder}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid ' + c.border,
                backgroundColor: c.inputBg,
                color: c.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = c.primary; }}
              onBlur={(e) => { e.target.style.borderColor = c.border; }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
              {t.payLater.calcTenorLabel}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[3, 6, 12].map((tenor) => (
                <button
                  key={tenor}
                  onClick={() => setCalcTenor(tenor)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    minHeight: '44px',
                    borderRadius: '10px',
                    border: calcTenor === tenor ? '2px solid ' + c.primary : '1px solid ' + c.border,
                    backgroundColor: calcTenor === tenor ? c.primary + '12' : c.pageBg,
                    color: calcTenor === tenor ? c.primary : c.textPrimary,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tenor} {t.payLater.tenorUnit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {calcMonthly > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: c.pageBg,
              border: '1px solid ' + c.borderLight,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px' }}>{t.payLater.calcMonthly}</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: c.primary, margin: 0 }}>
                  {formatCurrency(calcMonthly)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px' }}>{t.payLater.calcTotalPayment}</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
                  {formatCurrency(calcTotalPayment)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px' }}>{t.payLater.calcMargin} ({(MARGIN_RATE * 100).toFixed(1)}%{t.payLater.monthlyUnit})</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: c.textSecondary, margin: 0 }}>
                  {formatCurrency(calcTotalPayment - parseFloat(calcTotal))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Application Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '14px',
          minHeight: '48px',
          borderRadius: '12px',
          border: showForm ? '1px solid ' + c.border : 'none',
          backgroundColor: showForm ? c.cardBg : c.primary,
          color: showForm ? c.textPrimary : '#fff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          width: '100%',
        }}
      >
        {showForm ? t.common.cancel : t.payLater.applyBtn}
      </button>

      {/* Application Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
            {t.payLater.formTitle}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '14px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                {t.payLater.formName}
              </label>
              <input
                type="text"
                value={form.pilgrimName}
                onChange={(e) => setForm({ ...form, pilgrimName: e.target.value })}
                placeholder={t.payLater.formNamePlaceholder}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '46px',
                  borderRadius: '10px',
                  border: '1px solid ' + c.border,
                  backgroundColor: c.inputBg,
                  color: c.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }}
                onBlur={(e) => { e.target.style.borderColor = c.border; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                {t.payLater.formPhone}
              </label>
              <input
                type="tel"
                value={form.pilgrimPhone}
                onChange={(e) => setForm({ ...form, pilgrimPhone: e.target.value })}
                placeholder={t.payLater.formPhonePlaceholder}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '46px',
                  borderRadius: '10px',
                  border: '1px solid ' + c.border,
                  backgroundColor: c.inputBg,
                  color: c.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }}
                onBlur={(e) => { e.target.style.borderColor = c.border; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                {t.payLater.formTotal}
              </label>
              <input
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                placeholder={t.payLater.calcTotalPlaceholder}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '46px',
                  borderRadius: '10px',
                  border: '1px solid ' + c.border,
                  backgroundColor: c.inputBg,
                  color: c.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }}
                onBlur={(e) => { e.target.style.borderColor = c.border; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                {t.payLater.formTenor}
              </label>
              <select
                value={form.tenorMonths}
                onChange={(e) => setForm({ ...form, tenorMonths: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '46px',
                  borderRadius: '10px',
                  border: '1px solid ' + c.border,
                  backgroundColor: c.inputBg,
                  color: c.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              >
                <option value="3">{t.payLater.tenor3}</option>
                <option value="6">{t.payLater.tenor6}</option>
                <option value="12">{t.payLater.tenor12}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                {t.payLater.formAkad}
              </label>
              <select
                value={form.akadType}
                onChange={(e) => setForm({ ...form, akadType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '46px',
                  borderRadius: '10px',
                  border: '1px solid ' + c.border,
                  backgroundColor: c.inputBg,
                  color: c.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              >
                <option value="murabahah">Murabahah</option>
                <option value="ijarah">Ijarah</option>
              </select>
            </div>
          </div>

          {form.totalAmount && parseFloat(form.totalAmount) > 0 && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: c.pageBg,
                border: '1px solid ' + c.borderLight,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: c.textMuted }}>{t.payLater.formEstimate}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: c.primary }}>
                  {formatCurrency(calculateMonthly(parseFloat(form.totalAmount), parseInt(form.tenorMonths, 10)))}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={formLoading || !form.pilgrimName || !form.pilgrimPhone || !form.totalAmount}
            style={{
              marginTop: '16px',
              padding: '12px 28px',
              minHeight: '48px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: (!form.pilgrimName || !form.pilgrimPhone || !form.totalAmount) ? c.border : c.primary,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (!form.pilgrimName || !form.pilgrimPhone || !form.totalAmount) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
              opacity: formLoading ? 0.7 : 1,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {formLoading ? t.payLater.formLoading : t.payLater.formSubmit}
          </button>
        </div>
      )}

      {/* Application List */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '16px' : '24px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
          {t.payLater.listTitle}
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '14px', color: c.textMuted }}>{t.common.loadingData}</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\uD83D\uDCB3'}</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>
              {t.payLater.listEmptyTitle}
            </p>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
              {t.payLater.listEmptyDesc}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {applications.map((app) => {
              const statusBadge = getStatusBadge(app.status);
              const isSelected = selectedApp === app.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(isSelected ? null : app.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid ' + c.primary : '1px solid ' + c.borderLight,
                    backgroundColor: isSelected ? c.primary + '06' : c.pageBg,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: '0 0 2px' }}>
                        {app.pilgrimName}
                      </p>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                        {app.akadType === 'murabahah' ? t.payLater.murabahahTitle : t.payLater.ijarahTitle} - {app.tenorMonths} {t.payLater.tenorUnit}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.text,
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: c.primary }}>
                      {formatCurrency(app.totalAmount)}
                    </span>
                    <span style={{ fontSize: '12px', color: c.textMuted }}>
                      {formatCurrency(app.monthlyAmount)}{t.payLater.monthlyUnit}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: c.textMuted, margin: '6px 0 0' }}>
                    {formatDate(app.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Application Detail - Installment Schedule */}
      {selectedApplication && (
        <div
          style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '16px',
            padding: isMobile ? '16px' : '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px' }}>
            {t.payLater.scheduleTitle} - {selectedApplication.pilgrimName}
          </h3>
          <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 16px' }}>
            {selectedApplication.akadType === 'murabahah' ? t.payLater.murabahahTitle : t.payLater.ijarahTitle} | {selectedApplication.tenorMonths} {t.payLater.tenorUnit} | Total: {formatCurrency(selectedApplication.totalAmount)}
          </p>

          {selectedApplication.installments.length === 0 ? (
            <p style={{ fontSize: '13px', color: c.textMuted, textAlign: 'center', padding: '20px 0' }}>
              {t.payLater.scheduleEmpty}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedApplication.installments.map((inst) => {
                const instBadge = getInstallmentStatusBadge(inst.status);
                return (
                  <div
                    key={inst.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid ' + c.borderLight,
                      backgroundColor: inst.status === 'paid' ? '#f0fdf412' : c.pageBg,
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: inst.status === 'paid' ? '#22c55e' : inst.status === 'overdue' ? '#ef4444' : c.borderLight,
                        color: inst.status === 'pending' ? c.textMuted : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {inst.installmentNo}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
                        {formatCurrency(inst.amount)}
                      </p>
                      <p style={{ fontSize: '11px', color: c.textMuted, margin: '2px 0 0' }}>
                        {t.payLater.scheduleDue} {formatDate(inst.dueDate)}
                        {inst.paidAt ? ` | ${t.payLater.schedulePaid} ${formatDate(inst.paidAt)}` : ''}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: instBadge.bg,
                        color: instBadge.text,
                        fontSize: '10px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {instBadge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
