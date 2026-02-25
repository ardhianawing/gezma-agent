import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const roommateSchema = z.object({
  gender: z.string().min(1, 'Gender wajib diisi'),
  ageRange: z.string().min(1, 'Rentang usia wajib diisi'),
  smokingPref: z.string().min(1, 'Preferensi merokok wajib diisi'),
  snoringPref: z.string().min(1, 'Preferensi mendengkur wajib diisi'),
  languagePref: z.string().min(1, 'Preferensi bahasa wajib diisi'),
  notes: z.string().max(500).optional(),
  tripId: z.string().optional(),
});

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
    logger.error('Roommate preference fetch error', { error: String(error) });
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
    const parsed = roommateSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { gender, ageRange, smokingPref, snoringPref, languagePref, notes, tripId } = parsed.data;

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
    logger.error('Roommate preference save error', { error: String(error) });
    return NextResponse.json({ error: 'Gagal menyimpan preferensi' }, { status: 500 });
  }
}
