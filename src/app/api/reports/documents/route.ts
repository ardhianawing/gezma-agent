import { NextResponse } from 'next/server';

export async function GET() {
  const totalPilgrims = 156;

  const docs = [
    { type: "passport", label: "Passport", total: totalPilgrims, uploaded: 14, verified: 128 },
    { type: "visa", label: "Visa", total: totalPilgrims, uploaded: 13, verified: 85 },
    { type: "insurance", label: "Asuransi", total: totalPilgrims, uploaded: 5, verified: 115 },
    { type: "health_certificate", label: "Surat Kesehatan", total: totalPilgrims, uploaded: 11, verified: 78 },
    { type: "photo", label: "Foto 4x6", total: totalPilgrims, uploaded: 3, verified: 145 },
  ];

  const completion = docs.map(doc => {
    const missing = doc.total - doc.uploaded - doc.verified;
    const completionRate = doc.total > 0 ? Math.round((doc.verified / doc.total) * 100) : 0;
    return {
      type: doc.type,
      label: doc.label,
      verified: doc.verified,
      uploaded: doc.uploaded,
      missing: missing > 0 ? missing : 0,
      total: doc.total,
      completionRate,
    };
  });

  return NextResponse.json({
    totalPilgrims,
    completion,
  });
}
