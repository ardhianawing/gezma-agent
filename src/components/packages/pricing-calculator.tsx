'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const totalHpp = Object.values(hpp).reduce((sum, val) => sum + val, 0);
  const marginAmount = totalHpp * (margin / 100);
  const publishedPrice = totalHpp + marginAmount;

  const handleHppChange = (key: keyof PricingBreakdown, value: string) => {
    const numValue = parseFloat(value) || 0;
    onHppChange({ ...hpp, [key]: numValue });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* HPP Input */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown (HPP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hppFields.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <Label className="w-32 text-sm text-[var(--gray-600)]">{label}</Label>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--gray-600)]">Rp</span>
                <Input
                  type="number"
                  value={hpp[key] || ''}
                  onChange={(e) => handleHppChange(key, e.target.value)}
                  className="pl-10 text-right"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total HPP */}
          <div className="p-4 bg-[var(--gray-100)] rounded-[12px]">
            <p className="text-sm text-[var(--gray-600)]">Total HPP (Cost)</p>
            <p className="text-2xl font-bold text-[var(--charcoal)]">{formatCurrency(totalHpp)}</p>
          </div>

          {/* Margin */}
          <div>
            <Label>Profit Margin (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={margin}
                onChange={(e) => onMarginChange(parseFloat(e.target.value) || 0)}
                className="w-24"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={margin}
                onChange={(e) => onMarginChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-[var(--gray-600)] w-12">{margin}%</span>
            </div>
            <p className="text-sm text-[var(--gray-600)] mt-2">
              Margin Amount: <span className="font-medium text-[var(--charcoal)]">{formatCurrency(marginAmount)}</span>
            </p>
          </div>

          {/* Published Price */}
          <div className="p-4 bg-[var(--gezma-red-light)] rounded-[12px] border-2 border-[var(--gezma-red)]">
            <p className="text-sm text-[var(--charcoal)]">Published Price</p>
            <p className="text-3xl font-bold text-[var(--gezma-red)]">{formatCurrency(publishedPrice)}</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 pt-4 border-t border-[var(--gray-border)]">
            <p className="text-sm font-medium text-[var(--charcoal)]">Cost Breakdown</p>
            {hppFields.map(({ key, label }) => (
              hpp[key] > 0 && (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-[var(--gray-600)]">{label}</span>
                  <span className="text-[var(--charcoal)]">{formatCurrency(hpp[key])}</span>
                </div>
              )
            ))}
            <div className="flex justify-between text-sm pt-2 border-t border-[var(--gray-border)]">
              <span className="font-medium text-[var(--charcoal)]">Total HPP</span>
              <span className="font-medium text-[var(--charcoal)]">{formatCurrency(totalHpp)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--success)]">+ Margin ({margin}%)</span>
              <span className="text-[var(--success)]">{formatCurrency(marginAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-[var(--gray-border)]">
              <span className="text-[var(--gezma-red)]">Published Price</span>
              <span className="text-[var(--gezma-red)]">{formatCurrency(publishedPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
