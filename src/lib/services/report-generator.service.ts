import { prisma } from '@/lib/prisma';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export async function generateFinancialReport(agencyId: string) {
  const pilgrims = await prisma.pilgrim.findMany({
    where: { agencyId },
    select: { totalPaid: true, status: true },
  });
  const totalRevenue = pilgrims.reduce((sum, p) => sum + p.totalPaid, 0);
  const totalPilgrims = pilgrims.length;
  const paidCount = pilgrims.filter(p => p.totalPaid > 0).length;

  return `
    <h2>Laporan Keuangan</h2>
    <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Pemasukan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalRevenue)}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Jemaah</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${totalPilgrims}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Jemaah Sudah Bayar</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${paidCount}</td></tr>
    </table>
  `;
}

export async function generatePilgrimReport(agencyId: string) {
  const counts = await prisma.pilgrim.groupBy({
    by: ['status'],
    where: { agencyId },
    _count: true,
  });
  const total = counts.reduce((s, c) => s + c._count, 0);
  const rows = counts.map(c => `<tr><td style="padding: 8px; border: 1px solid #ddd;">${c.status}</td><td style="padding: 8px; border: 1px solid #ddd;">${c._count}</td></tr>`).join('');

  return `
    <h2>Laporan Jemaah</h2>
    <p>Total Jemaah: <strong>${total}</strong></p>
    <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
      <tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Jumlah</th></tr>
      ${rows}
    </table>
  `;
}

export async function generateTripReport(agencyId: string) {
  const trips = await prisma.trip.findMany({
    where: { agencyId },
    select: { name: true, status: true, departureDate: true, registeredCount: true },
    orderBy: { departureDate: 'desc' },
    take: 10,
  });
  const rows = trips.map(t => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.status}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.departureDate ? new Date(t.departureDate).toLocaleDateString('id-ID') : '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.registeredCount}</td>
    </tr>
  `).join('');

  return `
    <h2>Laporan Trip</h2>
    <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
      <tr style="background: #f5f5f5;">
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nama Trip</th>
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Keberangkatan</th>
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Jemaah</th>
      </tr>
      ${rows}
    </table>
  `;
}
