import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { packageFormSchema } from '@/lib/validations/package';
import { logActivity } from '@/lib/activity-logger';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function computePricing(hpp: Record<string, number>, margin: number) {
  const totalHpp = Object.values(hpp).reduce((sum, v) => sum + v, 0);
  const marginAmount = Math.round(totalHpp * (margin / 100));
  const publishedPrice = totalHpp + marginAmount;
  return { totalHpp, marginAmount, publishedPrice };
}

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const pkg = await prisma.package.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!pkg) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('GET /api/packages/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = packageFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.package.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
    }

    let slug = existing.slug;
    if (data.name !== existing.name) {
      slug = slugify(data.name);
      const slugConflict = await prisma.package.findFirst({
        where: { slug, agencyId: auth.agencyId, id: { not: id } },
      });
      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const { totalHpp, marginAmount, publishedPrice } = computePricing(
      data.hpp as Record<string, number>,
      data.margin
    );

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        category: data.category,
        description: data.description,
        duration: data.duration,
        airline: data.airline,
        itinerary: JSON.parse(JSON.stringify(data.itinerary)),
        hpp: JSON.parse(JSON.stringify(data.hpp)),
        totalHpp,
        margin: data.margin,
        marginAmount,
        publishedPrice,
        makkahHotel: data.makkahHotel,
        makkahHotelRating: data.makkahHotelRating,
        makkahHotelDistance: data.makkahHotelDistance,
        madinahHotel: data.madinahHotel,
        madinahHotelRating: data.madinahHotelRating,
        madinahHotelDistance: data.madinahHotelDistance,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        isActive: data.isActive,
      },
    });

    logActivity({
      type: 'package',
      action: 'updated',
      title: 'Paket diperbarui',
      description: `Paket "${pkg.name}" telah diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: pkg.id },
    });

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('PUT /api/packages/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.PACKAGES_DELETE);
  if (denied) return denied;

  const { id } = await params;

  try {
    const existing = await prisma.package.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
    }

    await prisma.package.delete({ where: { id } });

    logActivity({
      type: 'package',
      action: 'deleted',
      title: 'Paket dihapus',
      description: `Paket "${existing.name}" telah dihapus`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id },
    });

    return NextResponse.json({ message: 'Paket berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/packages/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
