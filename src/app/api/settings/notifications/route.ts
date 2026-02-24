import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { notificationPreferencesSchema } from '@/lib/validations/notification';
import { mergeWithDefaults } from '@/lib/services/notification-prefs.service';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const record = await prisma.notificationPreference.findUnique({
      where: { userId: auth.userId },
    });

    const preferences = mergeWithDefaults(
      record?.preferences as Record<string, Record<string, boolean>> | null
    );

    return NextResponse.json({ data: preferences });
  } catch (error) {
    console.error('GET /api/settings/notifications error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = notificationPreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const preferences = parsed.data;

    await prisma.notificationPreference.upsert({
      where: { userId: auth.userId },
      update: { preferences: JSON.parse(JSON.stringify(preferences)) },
      create: {
        userId: auth.userId,
        preferences: JSON.parse(JSON.stringify(preferences)),
      },
    });

    return NextResponse.json({ data: preferences });
  } catch (error) {
    console.error('PUT /api/settings/notifications error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
