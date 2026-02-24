import jsPDF from 'jspdf';

interface CertUser {
  name: string;
}

interface CertCourse {
  title: string;
}

interface CertAttempt {
  score: number;
  attemptedAt: Date;
}

export function generateCertificatePdf(
  user: CertUser,
  course: CertCourse,
  attempt: CertAttempt,
): Buffer {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Decorative border (gold lines)
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(2);
  doc.rect(10, 10, pageW - 20, pageH - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, pageW - 28, pageH - 28);

  // Corner ornaments
  const corners = [
    [18, 18], [pageW - 18, 18],
    [18, pageH - 18], [pageW - 18, pageH - 18],
  ];
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  for (const [cx, cy] of corners) {
    doc.circle(cx, cy, 3, 'S');
  }

  // Top accent line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  const lineY = 45;
  doc.line(60, lineY, pageW - 60, lineY);

  // Title
  doc.setTextColor(30, 64, 175); // Blue
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('GEZMA ACADEMY', pageW / 2, 35, { align: 'center' });

  doc.setTextColor(51, 51, 51);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('SERTIFIKAT PENYELESAIAN', pageW / 2, 58, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Dengan ini menerangkan bahwa', pageW / 2, 72, { align: 'center' });

  // User name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(user.name, pageW / 2, 90, { align: 'center' });

  // Decorative line under name
  const nameWidth = doc.getTextWidth(user.name);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(pageW / 2 - nameWidth / 2 - 10, 94, pageW / 2 + nameWidth / 2 + 10, 94);

  // Completion text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Telah berhasil menyelesaikan kursus', pageW / 2, 107, { align: 'center' });

  // Course title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  // Wrap long titles
  const maxLineWidth = pageW - 80;
  const titleLines = doc.splitTextToSize(course.title, maxLineWidth);
  doc.text(titleLines, pageW / 2, 120, { align: 'center' });

  // Score and date
  const completionDate = new Date(attempt.attemptedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const infoY = 120 + titleLines.length * 8 + 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Skor: ${attempt.score}% | Tanggal: ${completionDate}`, pageW / 2, infoY, { align: 'center' });

  // Bottom accent line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(60, pageH - 40, pageW - 60, pageH - 40);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Sertifikat ini diterbitkan secara digital oleh GEZMA Academy', pageW / 2, pageH - 30, { align: 'center' });

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
