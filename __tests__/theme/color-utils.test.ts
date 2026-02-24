import { describe, it, expect } from 'vitest';
import { lighten, darken, hexToRgba } from '@/lib/theme/color-utils';

describe('lighten', () => {
  it('lightens black to gray with 0.5', () => {
    const result = lighten('#000000', 0.5);
    expect(result).toBe('#808080');
  });

  it('returns white when amount is 1', () => {
    const result = lighten('#000000', 1);
    expect(result).toBe('#ffffff');
  });

  it('returns same color when amount is 0', () => {
    const result = lighten('#FF0000', 0);
    expect(result).toBe('#ff0000');
  });

  it('lightens red correctly', () => {
    const result = lighten('#FF0000', 0.5);
    expect(result).toBe('#ff8080');
  });

  it('returns valid hex format', () => {
    const result = lighten('#2563EB', 0.3);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('does not exceed #ffffff', () => {
    const result = lighten('#FFFFFF', 0.5);
    expect(result).toBe('#ffffff');
  });

  it('returns original color for invalid hex', () => {
    const result = lighten('invalid', 0.5);
    expect(result).toBe('invalid');
  });
});

describe('darken', () => {
  it('darkens white to gray with 0.5', () => {
    const result = darken('#FFFFFF', 0.5);
    expect(result).toBe('#808080');
  });

  it('returns black when amount is 1', () => {
    const result = darken('#FFFFFF', 1);
    expect(result).toBe('#000000');
  });

  it('returns same color when amount is 0', () => {
    const result = darken('#FF0000', 0);
    expect(result).toBe('#ff0000');
  });

  it('darkens blue correctly', () => {
    const result = darken('#0000FF', 0.5);
    expect(result).toBe('#000080');
  });

  it('returns valid hex format', () => {
    const result = darken('#2563EB', 0.3);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('does not go below #000000', () => {
    const result = darken('#000000', 0.5);
    expect(result).toBe('#000000');
  });

  it('returns original color for invalid hex', () => {
    const result = darken('invalid', 0.5);
    expect(result).toBe('invalid');
  });
});

describe('hexToRgba', () => {
  it('converts black with alpha 1', () => {
    const result = hexToRgba('#000000', 1);
    expect(result).toBe('rgba(0, 0, 0, 1)');
  });

  it('converts white with alpha 0.5', () => {
    const result = hexToRgba('#FFFFFF', 0.5);
    expect(result).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('converts red with alpha 0.3', () => {
    const result = hexToRgba('#FF0000', 0.3);
    expect(result).toBe('rgba(255, 0, 0, 0.3)');
  });

  it('handles primary blue color', () => {
    const result = hexToRgba('#2563EB', 0.15);
    expect(result).toBe('rgba(37, 99, 235, 0.15)');
  });

  it('returns correct rgba string format', () => {
    const result = hexToRgba('#123456', 0.8);
    expect(result).toMatch(/^rgba\(\d+, \d+, \d+, [\d.]+\)$/);
  });

  it('returns original string for invalid hex', () => {
    const result = hexToRgba('invalid', 0.5);
    expect(result).toBe('invalid');
  });

  it('handles alpha of 0', () => {
    const result = hexToRgba('#FF0000', 0);
    expect(result).toBe('rgba(255, 0, 0, 0)');
  });
});
