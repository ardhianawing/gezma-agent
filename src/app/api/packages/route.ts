import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
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

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const isActive = searchParams.get('isActive');

  const where: Record<string, unknown> = { agencyId: auth.agencyId };

  if (category) {
    where.category = category;
  }

  if (isActive !== null && isActive !== '') {
    where.isActive = isActive === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const data = await prisma.package.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/packages error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

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
    let slug = slugify(data.name);

    // Check slug uniqueness within agency
    const existingSlug = await prisma.package.findFirst({
      where: { slug, agencyId: auth.agencyId },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const { totalHpp, marginAmount, publishedPrice } = computePricing(
      data.hpp as Record<string, number>,
      data.margin
    );

    const pkg = await prisma.package.create({
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
        agencyId: auth.agencyId,
      },
    });

    logActivity({
      type: 'package',
      action: 'created',
      title: 'Paket baru dibuat',
      description: `Paket "${pkg.name}" telah dibuat`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: pkg.id },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error('POST /api/packages error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
