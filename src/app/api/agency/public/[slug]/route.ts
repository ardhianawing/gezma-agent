import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: public agency profile (NO auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const agency = await prisma.agency.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        legalName: true,
        tagline: true,
        description: true,
        logoUrl: true,
        phone: true,
        email: true,
        website: true,
        whatsapp: true,
        city: true,
        province: true,
        address: true,
        ppiuNumber: true,
        primaryColor: true,
        isVerified: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency tidak ditemukan' }, { status: 404 });
    }

    // Get active packages
    const packages = await prisma.package.findMany({
      where: { agencyId: agency.id, isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        duration: true,
        publishedPrice: true,
        thumbnailUrl: true,
        slug: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    // Get public testimonials
    const testimonials = await prisma.pilgrimTestimonial.findMany({
      where: { agencyId: agency.id, isPublic: true },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        pilgrim: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get stats
    const [pilgrimCount, tripCount] = await Promise.all([
      prisma.pilgrim.count({ where: { agencyId: agency.id } }),
      prisma.trip.count({ where: { agencyId: agency.id } }),
    ]);

    // Calculate average rating
    const avgRatingResult = await prisma.pilgrimTestimonial.aggregate({
      where: { agencyId: agency.id, isPublic: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = avgRatingResult._avg.rating ?? 0;
    const reviewCount = avgRatingResult._count.rating ?? 0;

    return NextResponse.json({
      agency,
      packages,
      testimonials: testimonials.map(t => ({
        id: t.id,
        rating: t.rating,
        comment: t.comment,
        pilgrimName: t.pilgrim.name,
        createdAt: t.createdAt,
      })),
      stats: {
        pilgrimCount,
        tripCount,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
      },
    });
  } catch (error) {
    console.error('GET /api/agency/public/[slug] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
