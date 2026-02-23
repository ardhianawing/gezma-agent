import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { searchHotels } from '@/lib/services/nusuk.service';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'makkah';
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Parameter checkIn dan checkOut wajib diisi' },
        { status: 400 }
      );
    }

    const hotels = await searchHotels({
      city,
      checkIn,
      checkOut,
      agencyId: auth.agencyId,
    });

    return NextResponse.json({ data: hotels });
  } catch (error) {
    console.error('GET /api/integrations/nusuk/hotels error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
