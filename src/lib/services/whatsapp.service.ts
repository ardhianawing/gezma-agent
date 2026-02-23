// WhatsApp API Integration Service (Mock)
// Supports multiple providers: Fonnte, Wablas, Official WA Business API

export type WAProvider = 'fonnte' | 'wablas' | 'official';

export interface WAConfig {
  provider: WAProvider | null;
  isEnabled: boolean;
  apiKey: string | null;
  senderNumber: string | null;
  lastTestAt: string | null;
  isConnected: boolean;
}

export interface WATemplate {
  id: string;
  name: string;
  type: 'reminder' | 'status_update' | 'payment' | 'departure' | 'welcome' | 'custom';
  content: string;
  variables: string[];
  isActive: boolean;
}

export interface WAMessage {
  id: string;
  to: string;
  toName: string;
  templateId: string | null;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string | null;
  deliveredAt: string | null;
  error: string | null;
}

export interface WABroadcast {
  id: string;
  name: string;
  templateId: string;
  recipients: Array<{ phone: string; name: string; pilgrimId: string }>;
  status: 'draft' | 'sending' | 'completed' | 'partial';
  totalSent: number;
  totalFailed: number;
  createdAt: string;
}

// In-memory mock store per agency
const configStore: Record<string, WAConfig> = {};
const messageStore: Record<string, WAMessage[]> = {};

const DEFAULT_TEMPLATES: WATemplate[] = [
  {
    id: 'tpl-001',
    name: 'Selamat Datang',
    type: 'welcome',
    content: 'Assalamualaikum {{nama}},\n\nSelamat bergabung di perjalanan umrah/haji bersama kami. Kode booking Anda: {{kode_booking}}.\n\nSemoga perjalanan ibadah Anda diberkahi. Kami akan menghubungi Anda untuk informasi selanjutnya.\n\nJazakallahu khairan.',
    variables: ['nama', 'kode_booking'],
    isActive: true,
  },
  {
    id: 'tpl-002',
    name: 'Reminder Pembayaran',
    type: 'payment',
    content: 'Assalamualaikum {{nama}},\n\nIni adalah pengingat pembayaran untuk perjalanan Anda.\n\nSisa pembayaran: Rp {{sisa_bayar}}\nJatuh tempo: {{tanggal}}\n\nSilakan lakukan pembayaran sebelum tanggal jatuh tempo untuk menghindari keterlambatan proses.\n\nTerima kasih.',
    variables: ['nama', 'sisa_bayar', 'tanggal'],
    isActive: true,
  },
  {
    id: 'tpl-003',
    name: 'Update Status',
    type: 'status_update',
    content: 'Assalamualaikum {{nama}},\n\nStatus perjalanan Anda telah diperbarui.\n\nStatus baru: {{status}}\nTanggal update: {{tanggal}}\n\nJika ada pertanyaan, silakan hubungi kami.\n\nTerima kasih.',
    variables: ['nama', 'status', 'tanggal'],
    isActive: true,
  },
  {
    id: 'tpl-004',
    name: 'Reminder Keberangkatan',
    type: 'departure',
    content: 'Assalamualaikum {{nama}},\n\nPerjalanan Anda akan berangkat dalam 3 hari!\n\nTanggal keberangkatan: {{tanggal}}\nKode booking: {{kode_booking}}\n\nPastikan semua dokumen sudah lengkap dan siap. Jangan lupa bawa:\n- Paspor asli\n- Buku vaksin\n- Pakaian ihram\n\nSemoga perjalanan lancar dan diberkahi.',
    variables: ['nama', 'tanggal', 'kode_booking'],
    isActive: true,
  },
  {
    id: 'tpl-005',
    name: 'Reminder Dokumen',
    type: 'reminder',
    content: 'Assalamualaikum {{nama}},\n\nKami mengingatkan bahwa dokumen Anda belum lengkap.\n\nStatus: {{status}}\nBatas waktu: {{tanggal}}\n\nMohon segera lengkapi dokumen yang diperlukan agar proses perjalanan tidak terhambat.\n\nTerima kasih atas kerjasamanya.',
    variables: ['nama', 'status', 'tanggal'],
    isActive: true,
  },
  {
    id: 'tpl-006',
    name: 'Custom',
    type: 'custom',
    content: 'Assalamualaikum {{nama}},\n\n(Tulis pesan Anda di sini)\n\nTerima kasih.',
    variables: ['nama'],
    isActive: true,
  },
];

function getDefaultConfig(): WAConfig {
  return {
    provider: null,
    isEnabled: false,
    apiKey: null,
    senderNumber: null,
    lastTestAt: null,
    isConnected: false,
  };
}

export async function getWAConfig(agencyId: string): Promise<WAConfig> {
  if (!configStore[agencyId]) {
    configStore[agencyId] = getDefaultConfig();
  }
  return { ...configStore[agencyId] };
}

export async function updateWAConfig(agencyId: string, config: Partial<WAConfig>): Promise<WAConfig> {
  if (!configStore[agencyId]) {
    configStore[agencyId] = getDefaultConfig();
  }
  configStore[agencyId] = { ...configStore[agencyId], ...config };
  return { ...configStore[agencyId] };
}

export async function testConnection(agencyId: string): Promise<{ success: boolean; message: string }> {
  const config = await getWAConfig(agencyId);

  if (!config.provider) {
    return { success: false, message: 'Provider belum dipilih' };
  }
  if (!config.apiKey) {
    return { success: false, message: 'API Key belum diisi' };
  }
  if (!config.senderNumber) {
    return { success: false, message: 'Nomor pengirim belum diisi' };
  }

  // Mock: simulate connection test with 1s delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock: always succeed if config is filled
  configStore[agencyId] = {
    ...configStore[agencyId],
    isConnected: true,
    lastTestAt: new Date().toISOString(),
  };

  return { success: true, message: `Koneksi ke ${config.provider} berhasil! Nomor ${config.senderNumber} aktif.` };
}

export async function listTemplates(agencyId: string): Promise<WATemplate[]> {
  // Mock: return default templates (in real app, stored per agency)
  void agencyId;
  return [...DEFAULT_TEMPLATES];
}

export async function sendMessage(params: {
  to: string;
  content: string;
  agencyId: string;
  toName?: string;
  templateId?: string;
}): Promise<WAMessage> {
  const config = await getWAConfig(params.agencyId);

  if (!config.isEnabled || !config.isConnected) {
    return {
      id: `msg-${Date.now()}`,
      to: params.to,
      toName: params.toName || params.to,
      templateId: params.templateId || null,
      content: params.content,
      status: 'failed',
      sentAt: null,
      deliveredAt: null,
      error: 'WhatsApp belum dikonfigurasi atau tidak terhubung',
    };
  }

  // Mock: simulate send delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const message: WAMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    to: params.to,
    toName: params.toName || params.to,
    templateId: params.templateId || null,
    content: params.content,
    status: 'sent',
    sentAt: new Date().toISOString(),
    deliveredAt: null,
    error: null,
  };

  if (!messageStore[params.agencyId]) {
    messageStore[params.agencyId] = [];
  }
  messageStore[params.agencyId].push(message);

  return message;
}

export async function sendBroadcast(params: {
  templateId: string;
  recipients: Array<{ phone: string; name: string; pilgrimId: string }>;
  templateContent: string;
  agencyId: string;
}): Promise<WABroadcast> {
  const config = await getWAConfig(params.agencyId);

  if (!config.isEnabled || !config.isConnected) {
    return {
      id: `bc-${Date.now()}`,
      name: `Broadcast ${new Date().toLocaleDateString('id-ID')}`,
      templateId: params.templateId,
      recipients: params.recipients,
      status: 'partial',
      totalSent: 0,
      totalFailed: params.recipients.length,
      createdAt: new Date().toISOString(),
    };
  }

  // Mock: simulate broadcast with some success and possible failures
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const totalSent = Math.max(1, params.recipients.length - Math.floor(Math.random() * 2));
  const totalFailed = params.recipients.length - totalSent;

  const broadcast: WABroadcast = {
    id: `bc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: `Broadcast ${new Date().toLocaleDateString('id-ID')}`,
    templateId: params.templateId,
    recipients: params.recipients,
    status: totalFailed === 0 ? 'completed' : 'partial',
    totalSent,
    totalFailed,
    createdAt: new Date().toISOString(),
  };

  // Store individual messages
  if (!messageStore[params.agencyId]) {
    messageStore[params.agencyId] = [];
  }

  for (let i = 0; i < params.recipients.length; i++) {
    const r = params.recipients[i];
    const isFailed = i >= totalSent;
    const personalContent = params.templateContent.replace(/\{\{nama\}\}/g, r.name);

    messageStore[params.agencyId].push({
      id: `msg-${Date.now()}-${i}`,
      to: r.phone,
      toName: r.name,
      templateId: params.templateId,
      content: personalContent,
      status: isFailed ? 'failed' : 'sent',
      sentAt: isFailed ? null : new Date().toISOString(),
      deliveredAt: null,
      error: isFailed ? 'Nomor tidak terdaftar di WhatsApp' : null,
    });
  }

  return broadcast;
}

export async function getMessageHistory(
  agencyId: string,
  filters?: { pilgrimId?: string }
): Promise<WAMessage[]> {
  const messages = messageStore[agencyId] || [];

  if (filters?.pilgrimId) {
    // In real app, would filter by pilgrim's phone number
    return messages;
  }

  // Return most recent first, up to 50
  return [...messages].reverse().slice(0, 50);
}
