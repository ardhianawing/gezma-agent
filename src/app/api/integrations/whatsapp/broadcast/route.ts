import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { sendBroadcast } from '@/lib/services/whatsapp.service';

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();

    const { templateId, recipients, templateContent } = body as {
      templateId: string;
      recipients: Array<{ phone: string; name: string; pilgrimId: string }>;
      templateContent: string;
    };

    if (!templateId || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Template dan daftar penerima wajib diisi' },
        { status: 400 }
      );
    }

    if (!templateContent) {
      return NextResponse.json(
        { error: 'Konten template wajib diisi' },
        { status: 400 }
      );
    }

    const broadcast = await sendBroadcast({
      templateId,
      recipients,
      templateContent,
      agencyId: auth.agencyId,
    });

    return NextResponse.json({ data: broadcast });
  } catch (error) {
    console.error('POST /api/integrations/whatsapp/broadcast error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
