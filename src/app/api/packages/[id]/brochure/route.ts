import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { generateBrochurePdf } from '@/lib/services/brochure.service';
import { logger } from '@/lib/logger';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
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

    const agency = await prisma.agency.findUnique({
      where: { id: auth.agencyId },
      select: {
        name: true,
        legalName: true,
        phone: true,
        email: true,
        website: true,
        address: true,
        city: true,
        province: true,
        ppiuNumber: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency tidak ditemukan' }, { status: 404 });
    }

    const pdfBuffer = generateBrochurePdf(
      {
        name: pkg.name,
        category: pkg.category,
        description: pkg.description,
        duration: pkg.duration,
        airline: pkg.airline,
        itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary as unknown[] : [],
        publishedPrice: pkg.publishedPrice,
        isPromo: pkg.isPromo,
        promoPrice: pkg.promoPrice,
        makkahHotel: pkg.makkahHotel,
        makkahHotelRating: pkg.makkahHotelRating,
        makkahHotelDistance: pkg.makkahHotelDistance,
        madinahHotel: pkg.madinahHotel,
        madinahHotelRating: pkg.madinahHotelRating,
        madinahHotelDistance: pkg.madinahHotelDistance,
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
      },
      agency
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="brosur-${pkg.slug || pkg.id}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('POST /api/packages/[id]/brochure error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
