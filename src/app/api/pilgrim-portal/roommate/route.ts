import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getPilgrimPayload(req);
  if (!auth) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const preference = await prisma.roommatePreference.findUnique({
      where: { pilgrimId: auth.pilgrimId },
    });

    return NextResponse.json({ data: preference });
  } catch (error) {
    console.error('Roommate preference fetch error:', error);
    return NextResponse.json({ error: 'Gagal memuat preferensi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getPilgrimPayload(req);
  if (!auth) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gender, ageRange, smokingPref, snoringPref, languagePref, notes, tripId } = body;

    if (!gender || !ageRange || !smokingPref || !snoringPref || !languagePref) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const preference = await prisma.roommatePreference.upsert({
      where: { pilgrimId: auth.pilgrimId },
      create: {
        pilgrimId: auth.pilgrimId,
        agencyId: auth.agencyId,
        gender,
        ageRange,
        smokingPref,
        snoringPref,
        languagePref,
        notes: notes || null,
        tripId: tripId || null,
      },
      update: {
        gender,
        ageRange,
        smokingPref,
        snoringPref,
        languagePref,
        notes: notes || null,
        tripId: tripId || null,
      },
    });

    return NextResponse.json({ data: preference, message: 'Preferensi berhasil disimpan' });
  } catch (error) {
    console.error('Roommate preference save error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan preferensi' }, { status: 500 });
  }
}
