import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logActivity } from '@/lib/activity-logger';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const original = await prisma.package.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!original) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
    }

    // Generate unique slug
    let slug = slugify(original.name + ' copy');
    const slugConflict = await prisma.package.findFirst({
      where: { slug, agencyId: auth.agencyId },
    });
    if (slugConflict) {
      slug = `${slug}-${Date.now()}`;
    }

    const duplicated = await prisma.package.create({
      data: {
        name: `${original.name} (Copy)`,
        slug,
        category: original.category,
        description: original.description,
        duration: original.duration,
        airline: original.airline,
        itinerary: JSON.parse(JSON.stringify(original.itinerary)),
        hpp: JSON.parse(JSON.stringify(original.hpp)),
        totalHpp: original.totalHpp,
        margin: original.margin,
        marginAmount: original.marginAmount,
        publishedPrice: original.publishedPrice,
        makkahHotel: original.makkahHotel,
        makkahHotelRating: original.makkahHotelRating,
        makkahHotelDistance: original.makkahHotelDistance,
        madinahHotel: original.madinahHotel,
        madinahHotelRating: original.madinahHotelRating,
        madinahHotelDistance: original.madinahHotelDistance,
        inclusions: original.inclusions,
        exclusions: original.exclusions,
        galleryUrls: original.galleryUrls,
        isActive: false,
        isPromo: false,
        promoPrice: null,
        promoEndDate: null,
        thumbnailUrl: original.thumbnailUrl,
        brochureUrl: null,
        agencyId: auth.agencyId,
      },
    });

    logActivity({
      type: 'package',
      action: 'created',
      title: 'Paket diduplikasi',
      description: `Paket "${duplicated.name}" diduplikasi dari "${original.name}"`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: duplicated.id, sourceId: original.id },
    });

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    console.error('POST /api/packages/[id]/duplicate error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
