import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { sendMessage } from '@/lib/services/whatsapp.service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();

    const { to, content, toName, templateId } = body as {
      to: string;
      content: string;
      toName?: string;
      templateId?: string;
    };

    if (!to || !content) {
      return NextResponse.json(
        { error: 'Nomor tujuan dan isi pesan wajib diisi' },
        { status: 400 }
      );
    }

    const message = await sendMessage({
      to,
      content,
      agencyId: auth.agencyId,
      toName,
      templateId,
    });

    return NextResponse.json({ data: message });
  } catch (error) {
    logger.error('POST /api/integrations/whatsapp/send error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
