'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface Deposit {
  id: string;
  amount: number;
  method: string;
  notes: string | null;
  balanceAfter: number;
  createdAt: string;
}

interface SavingsPlan {
  id: string;
  pilgrimName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  packageName: string | null;
  status: string;
  deposits: Deposit[];
  createdAt: string;
}

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

function getMethodLabel(method: string): string {
  switch (method) {
    case 'transfer':
      return 'Transfer Bank';
    case 'cash':
      return 'Tunai';
    case 'auto_debit':
      return 'Auto Debit';
    default:
      return method;
  }
}

export default function TabunganPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  const [savings, setSavings] = useState<SavingsPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Create new plan form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    pilgrimName: '',
    targetAmount: '',
    targetDate: '',
    packageName: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Deposit form
  const [depositForm, setDepositForm] = useState({
    amount: '',
    method: 'transfer',
    notes: '',
  });
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tabungan');
      if (res.ok) {
        const data = await res.json();
        setSavings(data.savings);
      }
    } catch (error) {
      console.error('Gagal memuat data tabungan:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePlan = async () => {
    if (!createForm.pilgrimName || !createForm.targetAmount || !createForm.targetDate) return;

    setCreateLoading(true);
    try {
      const res = await fetch('/api/tabungan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilgrimName: createForm.pilgrimName,
          targetAmount: parseFloat(createForm.targetAmount),
          targetDate: createForm.targetDate,
          packageName: createForm.packageName || null,
        }),
      });
      if (res.ok) {
        setShowCreateForm(false);
        setCreateForm({ pilgrimName: '', targetAmount: '', targetDate: '', packageName: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Gagal membuat rencana tabungan:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!savings || !depositForm.amount || parseFloat(depositForm.amount) <= 0) return;

    setDepositLoading(true);
    try {
      const res = await fetch('/api/tabungan/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savingsId: savings.id,
          amount: parseFloat(depositForm.amount),
          method: depositForm.method,
          notes: depositForm.notes || null,
        }),
      });
      if (res.ok) {
        setDepositForm({ amount: '', method: 'transfer', notes: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Gagal menyetor:', error);
    } finally {
      setDepositLoading(false);
    }
  };

  const progressPercent = savings
    ? Math.min((savings.currentAmount / savings.targetAmount) * 100, 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Tabungan Umrah"
        description="Rencanakan tabungan umrah Anda"
      />

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: '1px solid ' + c.border,
          }}
        >
          <p style={{ fontSize: '14px', color: c.textMuted }}>Memuat data...</p>
        </div>
      ) : !savings ? (
        /* No Savings Plan */
        <div
          style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '16px',
            padding: isMobile ? '24px' : '40px',
            textAlign: 'center',
          }}
        >
          {!showCreateForm ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'\uD83C\uDFAF'}</div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>
                Belum ada rencana tabungan
              </p>
              <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 20px' }}>
                Buat rencana tabungan umrah pertama Anda
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: c.primary,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                Buat Rencana Tabungan
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: '0 0 20px' }}>
                Buat Rencana Tabungan
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                    Nama Jamaah
                  </label>
                  <input
                    type="text"
                    value={createForm.pilgrimName}
                    onChange={(e) => setCreateForm({ ...createForm, pilgrimName: e.target.value })}
                    placeholder="Nama lengkap jamaah"
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
                    Target Tabungan
                  </label>
                  <input
                    type="number"
                    value={createForm.targetAmount}
                    onChange={(e) => setCreateForm({ ...createForm, targetAmount: e.target.value })}
                    placeholder="Contoh: 30000000"
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
                    Target Tanggal
                  </label>
                  <input
                    type="date"
                    value={createForm.targetDate}
                    onChange={(e) => setCreateForm({ ...createForm, targetDate: e.target.value })}
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
                    Nama Paket (opsional)
                  </label>
                  <input
                    type="text"
                    value={createForm.packageName}
                    onChange={(e) => setCreateForm({ ...createForm, packageName: e.target.value })}
                    placeholder="Contoh: Paket Reguler 9 Hari"
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
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid ' + c.border,
                      backgroundColor: c.cardBg,
                      color: c.textPrimary,
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    disabled={createLoading || !createForm.pilgrimName || !createForm.targetAmount || !createForm.targetDate}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: c.primary,
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: createLoading ? 0.7 : 1,
                    }}
                  >
                    {createLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Savings Progress Card */}
          <div
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: isMobile ? '20px' : '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px' }}>
                  {savings.pilgrimName}
                </h2>
                {savings.packageName && (
                  <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
                    {savings.packageName}
                  </p>
                )}
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '8px',
                  backgroundColor: savings.status === 'active' ? '#dcfce7' : savings.status === 'completed' ? '#dbeafe' : '#fecaca',
                  color: savings.status === 'active' ? '#166534' : savings.status === 'completed' ? '#1e40af' : '#991b1b',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {savings.status === 'active' ? 'Aktif' : savings.status === 'completed' ? 'Tercapai' : 'Dibatalkan'}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: 700, color: c.primary }}>
                  {formatCurrency(savings.currentAmount)}
                </span>
                <span style={{ fontSize: '13px', color: c.textMuted }}>
                  dari {formatCurrency(savings.targetAmount)}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: c.borderLight,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: progressPercent + '%',
                    height: '100%',
                    borderRadius: '5px',
                    background: progressPercent >= 100
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, #2563EB, #3b82f6)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: c.textSecondary }}>
                  {progressPercent.toFixed(1)}%
                </span>
                <span style={{ fontSize: '12px', color: c.textMuted }}>
                  Target: {formatDate(savings.targetDate)}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: c.pageBg,
                border: '1px solid ' + c.borderLight,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: c.textMuted }}>Sisa yang dibutuhkan</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: c.textPrimary }}>
                  {formatCurrency(Math.max(savings.targetAmount - savings.currentAmount, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <div
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: isMobile ? '20px' : '24px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
              Setor Tabungan
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
                  Jumlah Setoran
                </label>
                <input
                  type="number"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  placeholder="Masukkan jumlah"
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
                  Metode
                </label>
                <select
                  value={depositForm.method}
                  onChange={(e) => setDepositForm({ ...depositForm, method: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid ' + c.border,
                    backgroundColor: c.inputBg,
                    color: c.textPrimary,
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="transfer">Transfer Bank</option>
                  <option value="cash">Tunai</option>
                  <option value="auto_debit">Auto Debit</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textSecondary, marginBottom: '6px' }}>
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={depositForm.notes}
                  onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
                  placeholder="Catatan tambahan"
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
            </div>
            <button
              onClick={handleDeposit}
              disabled={depositLoading || !depositForm.amount || parseFloat(depositForm.amount) <= 0}
              style={{
                marginTop: '16px',
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: (!depositForm.amount || parseFloat(depositForm.amount) <= 0) ? c.border : c.primary,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (!depositForm.amount || parseFloat(depositForm.amount) <= 0) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                opacity: depositLoading ? 0.7 : 1,
              }}
            >
              {depositLoading ? 'Memproses...' : 'Setor Sekarang'}
            </button>
          </div>

          {/* Deposit History */}
          <div
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: isMobile ? '16px' : '24px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
              Riwayat Setoran
            </h3>

            {savings.deposits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
                  Belum ada setoran
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savings.deposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid ' + c.borderLight,
                      backgroundColor: c.pageBg,
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#22c55e18',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        color: '#22c55e',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>
                          {formatCurrency(deposit.amount)}
                        </span>
                        <span style={{ fontSize: '12px', color: c.textMuted }}>
                          {formatDate(deposit.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '12px', color: c.textMuted }}>
                          {getMethodLabel(deposit.method)}
                          {deposit.notes ? ` - ${deposit.notes}` : ''}
                        </span>
                        <span style={{ fontSize: '12px', color: c.textSecondary }}>
                          Saldo: {formatCurrency(deposit.balanceAfter)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
