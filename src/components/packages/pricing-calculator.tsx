'use client';

import * as React from 'react';
import { DollarSign, Calculator } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { formatCurrency } from '@/lib/utils';
import type { PricingBreakdown } from '@/types/package';

interface PricingCalculatorProps {
  hpp: PricingBreakdown;
  margin: number;
  onHppChange: (hpp: PricingBreakdown) => void;
  onMarginChange: (margin: number) => void;
}

const hppFields: { key: keyof PricingBreakdown; label: string }[] = [
  { key: 'airline', label: 'Airline / Flight' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'visa', label: 'Visa' },
  { key: 'transport', label: 'Transport' },
  { key: 'meals', label: 'Meals' },
  { key: 'guide', label: 'Guide / Muthawwif' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'handling', label: 'Handling' },
  { key: 'others', label: 'Others' },
];

export function PricingCalculator({ hpp, margin, onHppChange, onMarginChange }: PricingCalculatorProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const totalHpp = Object.values(hpp).reduce((sum, val) => sum + val, 0);
  const marginAmount = totalHpp * (margin / 100);
  const publishedPrice = totalHpp + marginAmount;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    color: c.textPrimary,
    backgroundColor: c.cardBgHover,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '500',
    color: c.textMuted,
  };

  const handleHppChange = (key: keyof PricingBreakdown, value: string) => {
    const numValue = parseFloat(value) || 0;
    onHppChange({ ...hpp, [key]: numValue });
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    borderRadius: '16px',
    border: `1px solid ${c.border}`,
    overflow: 'hidden',
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
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
      {/* HPP Input */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <DollarSign style={{ width: '18px', height: '18px', color: c.textMuted }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
            Cost Breakdown (HPP)
          </h3>
        </div>
        <div style={{ ...cardBodyStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {hppFields.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ ...labelStyle, width: '120px', flexShrink: 0 }}>{label}</label>
              <div style={{ flex: 1, position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13px',
                    color: c.textMuted,
                  }}
                >
                  Rp
                </span>
                <input
                  type="number"
                  value={hpp[key] || ''}
                  onChange={(e) => handleHppChange(key, e.target.value)}
                  placeholder="0"
                  style={{ ...inputStyle, paddingLeft: '42px', textAlign: 'right' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <Calculator style={{ width: '18px', height: '18px', color: c.textMuted }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
            Pricing Summary
          </h3>
        </div>
        <div style={{ ...cardBodyStyle, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Total HPP */}
          <div
            style={{
              padding: '16px',
              backgroundColor: c.cardBgHover,
              borderRadius: '12px',
            }}
          >
            <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Total HPP (Cost)</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: '4px 0 0 0' }}>
              {formatCurrency(totalHpp)}
            </p>
          </div>

          {/* Margin */}
          <div>
            <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Profit Margin (%)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min={0}
                max={100}
                value={margin}
                onChange={(e) => onMarginChange(parseFloat(e.target.value) || 0)}
                style={{ ...inputStyle, width: '80px', textAlign: 'center', flexShrink: 0 }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={margin}
                onChange={(e) => onMarginChange(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '14px', color: c.textMuted, width: '40px', flexShrink: 0 }}>{margin}%</span>
            </div>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: '8px 0 0 0' }}>
              Margin Amount: <span style={{ fontWeight: '500', color: c.textPrimary }}>{formatCurrency(marginAmount)}</span>
            </p>
          </div>

          {/* Published Price */}
          <div
            style={{
              padding: '16px',
              backgroundColor: c.primaryLight,
              borderRadius: '12px',
              border: `2px solid ${c.primary}`,
            }}
          >
            <p style={{ fontSize: '13px', color: c.textPrimary, margin: 0 }}>Published Price</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: c.primary, margin: '4px 0 0 0' }}>
              {formatCurrency(publishedPrice)}
            </p>
          </div>

          {/* Breakdown */}
          <div style={{ paddingTop: '16px', borderTop: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: '0 0 12px 0' }}>Cost Breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hppFields.map(({ key, label }) => (
                hpp[key] > 0 && (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: c.textMuted }}>{label}</span>
                    <span style={{ color: c.textPrimary }}>{formatCurrency(hpp[key])}</span>
                  </div>
                )
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingTop: '8px', borderTop: `1px solid ${c.border}` }}>
                <span style={{ fontWeight: '500', color: c.textPrimary }}>Total HPP</span>
                <span style={{ fontWeight: '500', color: c.textPrimary }}>{formatCurrency(totalHpp)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: c.success }}>+ Margin ({margin}%)</span>
                <span style={{ color: c.success }}>{formatCurrency(marginAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', paddingTop: '8px', borderTop: `1px solid ${c.border}` }}>
                <span style={{ color: c.primary }}>Published Price</span>
                <span style={{ color: c.primary }}>{formatCurrency(publishedPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
