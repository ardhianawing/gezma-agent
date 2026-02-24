import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BrochureAgency {
  name: string;
  legalName: string;
  phone: string;
  email: string;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  ppiuNumber?: string | null;
}

interface ItineraryActivity {
  time: string;
  title: string;
  description?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
  city: string;
}

interface BrochurePackage {
  name: string;
  category: string;
  description: string;
  duration: number;
  airline: string;
  itinerary: unknown[];
  publishedPrice: number;
  isPromo: boolean;
  promoPrice: number | null;
  makkahHotel: string;
  makkahHotelRating: number;
  makkahHotelDistance: string;
  madinahHotel: string;
  madinahHotelRating: number;
  madinahHotelDistance: string;
  inclusions: string[];
  exclusions: string[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function stars(count: number): string {
  const clamped = Math.max(0, Math.min(5, count || 0));
  return '\u2605'.repeat(clamped) + '\u2606'.repeat(5 - clamped);
}

export function generateBrochurePdf(pkg: BrochurePackage, agency: BrochureAgency): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Header: Agency name + info ---
  doc.setFillColor(200, 30, 30);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(agency.name, margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(agency.legalName, margin, 26);

  const contactLine = [agency.phone, agency.email, agency.website].filter(Boolean).join(' | ');
  doc.text(contactLine, margin, 33);

  if (agency.ppiuNumber) {
    doc.setFontSize(9);
    doc.text(`PPIU: ${agency.ppiuNumber}`, pageWidth - margin, 33, { align: 'right' });
  }

  y = 50;

  // --- Package Title ---
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(pkg.name, margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${(pkg.category || '').toUpperCase()} | ${pkg.duration} Hari | ${pkg.airline || '-'}`, margin, y);
  y += 10;

  // --- Description ---
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(pkg.description || '', contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 6;

  // --- Price Box ---
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, pkg.isPromo && pkg.promoPrice ? 22 : 16, 3, 3, 'F');

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');

  if (pkg.isPromo && pkg.promoPrice) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text(`Harga Normal: ${formatCurrency(pkg.publishedPrice)}`, margin + 6, y + 8);
    doc.setTextColor(200, 30, 30);
    doc.setFontSize(14);
    doc.text(`Harga Promo: ${formatCurrency(pkg.promoPrice)}`, margin + 6, y + 17);
    y += 28;
  } else {
    doc.text(`Harga: ${formatCurrency(pkg.publishedPrice)} / pax`, margin + 6, y + 11);
    y += 22;
  }

  // --- Hotels ---
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Akomodasi Hotel', margin, y);
  y += 7;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Kota', 'Hotel', 'Rating', 'Jarak ke Masjid']],
    body: [
      ['Makkah', pkg.makkahHotel || '-', stars(pkg.makkahHotelRating), pkg.makkahHotelDistance || '-'],
      ['Madinah', pkg.madinahHotel || '-', stars(pkg.madinahHotelRating), pkg.madinahHotelDistance || '-'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [200, 30, 30], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // --- Itinerary ---
  const itinerary = (Array.isArray(pkg.itinerary) ? pkg.itinerary : []) as ItineraryDay[];
  if (itinerary.length > 0) {
    // Check if we need a new page
    if (y > 220) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Jadwal Perjalanan', margin, y);
    y += 7;

    const itineraryRows = itinerary.map((day) => {
      const activitiesText = (day.activities || [])
        .map((a) => `${a.time} - ${a.title}`)
        .join('\n');
      return [`Hari ${day.day}`, day.title || '', day.city || '', activitiesText];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Hari', 'Judul', 'Kota', 'Aktivitas']],
      body: itineraryRows,
      theme: 'striped',
      headStyles: { fillColor: [200, 30, 30], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Inclusions / Exclusions ---
  if (y > 230) {
    doc.addPage();
    y = margin;
  }

  const halfWidth = (contentWidth - 6) / 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 130, 30);
  doc.text('Termasuk', margin, y);

  doc.setTextColor(200, 30, 30);
  doc.text('Tidak Termasuk', margin + halfWidth + 6, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const inclusions = pkg.inclusions || [];
  const exclusions = pkg.exclusions || [];
  const maxRows = Math.max(inclusions.length, exclusions.length);
  for (let i = 0; i < maxRows; i++) {
    if (y > 275) {
      doc.addPage();
      y = margin;
    }

    if (i < inclusions.length) {
      doc.setTextColor(50, 50, 50);
      doc.text(`\u2713 ${inclusions[i]}`, margin, y);
    }
    if (i < exclusions.length) {
      doc.setTextColor(150, 50, 50);
      doc.text(`\u2717 ${exclusions[i]}`, margin + halfWidth + 6, y);
    }
    y += 5;
  }

  y += 6;

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
