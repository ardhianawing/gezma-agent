'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';

const RATE_STORAGE_KEY = 'gezma_sar_rate';
const DEFAULT_RATE = 4200;

function formatIDR(amount: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(amount));
}

function formatSAR(amount: number): string {
  return 'SAR ' + new Intl.NumberFormat('en').format(Number(amount.toFixed(2)));
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function CurrencyConverterPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [sarValue, setSarValue] = useState('');
  const [idrValue, setIdrValue] = useState('');
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RATE_STORAGE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) setRate(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const handleSarChange = (val: string) => {
    setSarValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setIdrValue(String(Math.round(num * rate)));
    } else {
      setIdrValue('');
    }
  };

  const handleIdrChange = (val: string) => {
    setIdrValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setSarValue((num / rate).toFixed(2));
    } else {
      setSarValue('');
    }
  };

  const handleRateSave = () => {
    const num = parseFloat(rateInput);
    if (!isNaN(num) && num > 0) {
      setRate(num);
      try {
        localStorage.setItem(RATE_STORAGE_KEY, String(num));
      } catch {
        // ignore
      }
      // Recalculate if SAR has value
      if (sarValue) {
        const sarNum = parseFloat(sarValue);
        if (!isNaN(sarNum)) {
          setIdrValue(String(Math.round(sarNum * num)));
        }
      }
    }
    setEditingRate(false);
  };

  const handleQuickConvert = (sar: number) => {
    setSarValue(String(sar));
    setIdrValue(String(Math.round(sar * rate)));
  };

  if (!loaded) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '18px',
    fontWeight: 600,
    border: '1px solid ' + c.border,
    borderRadius: '10px',
    backgroundColor: c.pageBg,
    color: c.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}>
          {'\u{1F4B1}'} Konversi Mata Uang
        </h1>
        <p style={{
          fontSize: '14px',
          color: c.textMuted,
          margin: 0,
        }}>
          IDR (Rupiah) &harr; SAR (Riyal Saudi)
        </p>
      </div>

      {/* Rate card */}
      <div style={{
        backgroundColor: c.cardBg,
        border: '1px solid ' + c.border,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '13px', color: c.textMuted }}>Kurs saat ini</span>
          {!editingRate ? (
            <button
              onClick={() => { setEditingRate(true); setRateInput(String(rate)); }}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: GREEN,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              Ubah
            </button>
          ) : (
            <button
              onClick={handleRateSave}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: GREEN,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                padding: '4px 10px',
              }}
            >
              {t.common.save}
            </button>
          )}
        </div>
        {editingRate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: c.textPrimary, fontWeight: 500 }}>1 SAR =</span>
            <input
              type="number"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRateSave(); }}
              style={{
                padding: '6px 10px',
                fontSize: '16px',
                fontWeight: 600,
                border: '1px solid ' + GREEN,
                borderRadius: '6px',
                backgroundColor: GREEN_LIGHT,
                color: GREEN_DARK,
                outline: 'none',
                width: '120px',
              }}
              autoFocus
            />
            <span style={{ fontSize: '14px', color: c.textPrimary, fontWeight: 500 }}>IDR</span>
          </div>
        ) : (
          <p style={{
            fontSize: '22px',
            fontWeight: 700,
            color: GREEN,
            margin: 0,
          }}>
            1 SAR = {formatIDR(rate)}
          </p>
        )}
      </div>

      {/* Converter */}
      <div style={{
        backgroundColor: c.cardBg,
        border: '1px solid ' + c.border,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: c.textMuted,
            marginBottom: '6px',
          }}>
            {'\u{1F1F8}\u{1F1E6}'} SAR (Riyal Saudi)
          </label>
          <input
            type="number"
            placeholder="0"
            value={sarValue}
            onChange={(e) => handleSarChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Arrow */}
        <div style={{
          textAlign: 'center',
          margin: '4px 0',
          fontSize: '20px',
          color: c.textMuted,
        }}>
          {'\u{2195}\u{FE0F}'}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: c.textMuted,
            marginBottom: '6px',
          }}>
            {'\u{1F1EE}\u{1F1E9}'} IDR (Rupiah)
          </label>
          <input
            type="number"
            placeholder="0"
            value={idrValue}
            onChange={(e) => handleIdrChange(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Quick convert */}
      <div style={{
        backgroundColor: c.cardBg,
        border: '1px solid ' + c.border,
        borderRadius: '16px',
        padding: '20px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: c.textPrimary,
          margin: '0 0 12px 0',
        }}>
          Konversi Cepat
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {QUICK_AMOUNTS.map((sar) => (
            <button
              key={sar}
              onClick={() => handleQuickConvert(sar)}
              style={{
                padding: '12px 8px',
                minHeight: '44px',
                backgroundColor: c.pageBg,
                border: '1px solid ' + c.borderLight,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
                boxSizing: 'border-box',
              }}
            >
              <p style={{
                fontSize: '15px',
                fontWeight: 600,
                color: GREEN,
                margin: '0 0 4px 0',
              }}>
                {sar} SAR
              </p>
              <p style={{
                fontSize: '12px',
                color: c.textMuted,
                margin: 0,
              }}>
                {formatIDR(sar * rate)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
