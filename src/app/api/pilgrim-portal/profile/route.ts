import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { awardPilgrimPoints } from '@/lib/services/pilgrim-gamification.service';

const updateSchema = z.object({
  phone: z.string().min(1).optional(),
  email: z.string().email('Email tidak valid').optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContact: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(result.data)) {
      if (value !== undefined) {
        data[key] = key === 'emergencyContact' ? value : value;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diperbarui' }, { status: 400 });
    }

    const pilgrim = await prisma.pilgrim.update({
      where: { id: payload.pilgrimId },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        province: true,
      },
    });

    // Award points for updating profile (fire-and-forget)
    awardPilgrimPoints(payload.pilgrimId, 'update_profile', 'Memperbarui profil').catch(() => {});

    return NextResponse.json({ success: true, data: pilgrim });
  } catch (error) {
    console.error('PATCH /api/pilgrim-portal/profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
