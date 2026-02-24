import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceAgency {
  name: string;
  legalName: string;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  phone: string;
  email: string;
  ppiuNumber?: string | null;
}

interface InvoicePayment {
  id: string;
  date: string | Date;
  type: string;
  method: string;
  amount: number;
  notes?: string | null;
}

interface InvoicePilgrim {
  name: string;
  nik: string;
  bookingCode?: string | null;
  totalPaid: number;
  remainingBalance: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    dp: 'DP',
    installment: 'Cicilan',
    full: 'Lunas',
    refund: 'Refund',
  };
  return map[type] || type;
}

function methodLabel(method: string): string {
  const map: Record<string, string> = {
    transfer: 'Transfer',
    cash: 'Cash',
    card: 'Kartu',
  };
  return map[method] || method;
}

export function generateInvoicePdf(
  pilgrim: InvoicePilgrim,
  payments: InvoicePayment[],
  agency: InvoiceAgency
): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Header: Agency info ---
  doc.setFillColor(200, 30, 30);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(agency.name, margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(agency.legalName, margin, 26);

  const addressParts = [agency.address, agency.city, agency.province].filter(Boolean);
  if (addressParts.length > 0) {
    doc.text(addressParts.join(', '), margin, 31);
  }

  const contactLine = [agency.phone, agency.email].filter(Boolean).join(' | ');
  doc.text(contactLine, margin, 36);

  if (agency.ppiuNumber) {
    doc.setFontSize(9);
    doc.text(`PPIU: ${agency.ppiuNumber}`, pageWidth - margin, 36, { align: 'right' });
  }

  y = 50;

  // --- Title ---
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KWITANSI PEMBAYARAN', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // --- Pilgrim info ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Nama:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(pilgrim.name, margin + 35, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('NIK:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(pilgrim.nik, margin + 35, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Kode Booking:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(pilgrim.bookingCode || '-', margin + 35, y);
  y += 12;

  // --- Payment table ---
  const tableBody = payments.map((p) => [
    formatDate(p.date),
    typeLabel(p.type),
    methodLabel(p.method),
    formatCurrency(p.amount),
    p.notes || '-',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Tanggal', 'Tipe', 'Metode', 'Jumlah', 'Keterangan']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [200, 30, 30], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 'auto' },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // --- Total row ---
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, 14, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Total Dibayar:', margin + 6, y + 9);
  doc.text(formatCurrency(totalPaid), pageWidth - margin - 6, y + 9, { align: 'right' });
  y += 20;

  // --- Remaining balance ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Sisa Tagihan: ${formatCurrency(pilgrim.remainingBalance)}`, margin, y);
  y += 10;

  // --- LUNAS watermark ---
  const isLunas = pilgrim.remainingBalance <= 0 || pilgrim.totalPaid >= pilgrim.remainingBalance + pilgrim.totalPaid;
  if (isLunas) {
    doc.setTextColor(0, 180, 0);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');

    // Save state and set transparency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gState = new (doc as any).GState({ opacity: 0.15 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).setGState(gState);

    doc.text('LUNAS', pageWidth / 2, 160, {
      align: 'center',
      angle: 30,
    });

    // Reset opacity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetState = new (doc as any).GState({ opacity: 1 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).setGState(resetState);
  }

  // --- Print date ---
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Dicetak pada: ${formatDate(new Date())}`,
    margin,
    doc.internal.pageSize.getHeight() - 15
  );

  // --- Footer ---
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${agency.name} | ${contactLine}`,
      margin,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(
      `Halaman ${p} / ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}
