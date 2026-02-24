import { describe, it, expect, vi } from 'vitest';

// Mock jspdf and jspdf-autotable
vi.mock('jspdf', () => {
  class MockJsPDF {
    setFillColor() { return this; }
    rect() { return this; }
    setTextColor() { return this; }
    setFontSize() { return this; }
    setFont() { return this; }
    text() { return this; }
    line() { return this; }
    setDrawColor() { return this; }
    setLineWidth() { return this; }
    getTextWidth() { return 50; }
    setGState() { return this; }
    roundedRect() { return this; }
    output() { return new ArrayBuffer(100); }
    getNumberOfPages() { return 1; }
    setPage() { return this; }
    GState = class {};
    lastAutoTable = { finalY: 150 };
    internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
  }
  return { default: MockJsPDF };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('Invoice Service', () => {
  it('generateInvoicePdf returns a Buffer', async () => {
    const { generateInvoicePdf } = await import('@/lib/services/invoice.service');

    const pilgrim = {
      name: 'Ahmad Test',
      nik: '1234567890123456',
      bookingCode: 'BK-001',
      totalPaid: 15000000,
      remainingBalance: 0,
    };

    const payments = [
      { id: 'p1', date: new Date(), type: 'dp', method: 'transfer', amount: 5000000, notes: 'DP' },
      { id: 'p2', date: new Date(), type: 'installment', method: 'cash', amount: 10000000, notes: 'Cicilan 1' },
    ];

    const agency = {
      name: 'PT Travel Berkah',
      legalName: 'PT Travel Berkah Abadi',
      address: 'Jl. Raya No 1',
      city: 'Jakarta',
      phone: '021-12345678',
      email: 'info@travel.com',
      ppiuNumber: 'PPIU-001',
    };

    const result = generateInvoicePdf(pilgrim, payments, agency);
    expect(result).toBeInstanceOf(Buffer);
  });

  it('generateInvoicePdf handles empty payments', async () => {
    const { generateInvoicePdf } = await import('@/lib/services/invoice.service');

    const result = generateInvoicePdf(
      { name: 'Test', nik: '1234567890123456', bookingCode: null, totalPaid: 0, remainingBalance: 5000000 },
      [],
      { name: 'Agency', legalName: 'PT Agency', address: null, city: null, phone: '021', email: 'a@b.com', ppiuNumber: null }
    );
    expect(result).toBeInstanceOf(Buffer);
  });

  it('generateInvoicePdf handles pilgrim with remaining balance', async () => {
    const { generateInvoicePdf } = await import('@/lib/services/invoice.service');

    const result = generateInvoicePdf(
      { name: 'Test', nik: '1234567890123456', bookingCode: 'BK-002', totalPaid: 5000000, remainingBalance: 10000000 },
      [{ id: 'p1', date: new Date(), type: 'dp', method: 'transfer', amount: 5000000, notes: null }],
      { name: 'Agency', legalName: 'PT Agency', address: 'Jl Test', city: 'Jakarta', phone: '021', email: 'a@b.com', ppiuNumber: 'PPIU-1' }
    );
    expect(result).toBeInstanceOf(Buffer);
  });
});
