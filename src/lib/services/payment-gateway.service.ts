// Payment Gateway Service - Abstract layer for Midtrans/Xendit/Duitku integration
// Currently returns mock data. Replace with real API calls when ready.

export type PaymentProvider = 'midtrans' | 'xendit' | 'duitku';
export type PaymentChannel =
  | 'va_bca'
  | 'va_mandiri'
  | 'va_bni'
  | 'va_bri'
  | 'qris'
  | 'ewallet_gopay'
  | 'ewallet_ovo'
  | 'ewallet_dana'
  | 'credit_card';

export interface PaymentGatewayConfig {
  provider: PaymentProvider | null;
  isEnabled: boolean;
  serverKey: string | null;
  clientKey: string | null;
  isProduction: boolean;
  enabledChannels: PaymentChannel[];
  webhookUrl: string;
}

export interface CreateInvoiceParams {
  pilgrimId: string;
  amount: number;
  description: string;
  channel: PaymentChannel;
  agencyId: string;
  userId: string;
}

export interface Invoice {
  id: string;
  externalId: string;
  pilgrimId: string;
  pilgrimName: string;
  amount: number;
  description: string;
  channel: PaymentChannel;
  channelLabel: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentUrl: string | null;
  vaNumber: string | null;
  qrCode: string | null;
  paidAt: string | null;
  expiredAt: string;
  createdAt: string;
}

// In-memory store for mock invoices (per agency)
const mockInvoiceStore: Map<string, Invoice[]> = new Map();

// In-memory store for mock configs (per agency)
const mockConfigStore: Map<string, PaymentGatewayConfig> = new Map();

function generateId(): string {
  return 'INV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function generateExternalId(): string {
  return 'EXT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateVaNumber(channel: PaymentChannel): string | null {
  if (!channel.startsWith('va_')) return null;
  const prefixes: Record<string, string> = {
    va_bca: '1234',
    va_mandiri: '8888',
    va_bni: '9889',
    va_bri: '1055',
  };
  const prefix = prefixes[channel] || '0000';
  const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return prefix + random;
}

function generateQrCode(channel: PaymentChannel): string | null {
  if (channel !== 'qris') return null;
  // TODO: Replace with real QRIS string from payment gateway
  return '00020101021226670016COM.NOBUBANK.WWW01189360010300000000210214GEZMA' + Date.now().toString().slice(-8);
}

function generatePaymentUrl(channel: PaymentChannel): string | null {
  if (channel === 'qris') return null;
  if (channel.startsWith('va_')) return null;
  // TODO: Replace with real payment URL from gateway
  return 'https://sandbox.midtrans.com/v2/vtweb/' + Math.random().toString(36).substring(2, 14);
}

export async function getPaymentGatewayConfig(agencyId: string): Promise<PaymentGatewayConfig> {
  // TODO: Replace with real database query to fetch agency payment config
  const existing = mockConfigStore.get(agencyId);
  if (existing) return existing;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.gezma.id';
  const defaultConfig: PaymentGatewayConfig = {
    provider: null,
    isEnabled: false,
    serverKey: null,
    clientKey: null,
    isProduction: false,
    enabledChannels: [],
    webhookUrl: `${baseUrl}/api/integrations/payment/webhook`,
  };

  return defaultConfig;
}

export async function updatePaymentGatewayConfig(
  agencyId: string,
  update: Partial<Omit<PaymentGatewayConfig, 'webhookUrl'>>
): Promise<PaymentGatewayConfig> {
  // TODO: Replace with real database UPDATE for agency payment config
  const current = await getPaymentGatewayConfig(agencyId);
  const updated: PaymentGatewayConfig = {
    ...current,
    ...update,
  };
  mockConfigStore.set(agencyId, updated);
  return updated;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
  // TODO: Replace with real Midtrans/Xendit/Duitku API call to create invoice
  const config = await getPaymentGatewayConfig(params.agencyId);
  if (!config.isEnabled || !config.provider) {
    throw new Error('Payment gateway belum dikonfigurasi');
  }

  const now = new Date();
  const expiredAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const invoice: Invoice = {
    id: generateId(),
    externalId: generateExternalId(),
    pilgrimId: params.pilgrimId,
    pilgrimName: '', // Will be populated below
    amount: params.amount,
    description: params.description,
    channel: params.channel,
    channelLabel: getChannelLabel(params.channel),
    status: 'pending',
    paymentUrl: generatePaymentUrl(params.channel),
    vaNumber: generateVaNumber(params.channel),
    qrCode: generateQrCode(params.channel),
    paidAt: null,
    expiredAt: expiredAt.toISOString(),
    createdAt: now.toISOString(),
  };

  // Store mock invoice
  const agencyInvoices = mockInvoiceStore.get(params.agencyId) || [];
  agencyInvoices.unshift(invoice);
  mockInvoiceStore.set(params.agencyId, agencyInvoices);

  return invoice;
}

export async function getInvoice(invoiceId: string, agencyId: string): Promise<Invoice | null> {
  // TODO: Replace with real database query + payment gateway status check
  const agencyInvoices = mockInvoiceStore.get(agencyId) || [];
  return agencyInvoices.find((inv) => inv.id === invoiceId) || null;
}

export async function listInvoices(
  agencyId: string,
  filters?: { pilgrimId?: string; status?: string }
): Promise<Invoice[]> {
  // TODO: Replace with real database query for invoices
  let invoices = mockInvoiceStore.get(agencyId) || [];

  if (filters?.pilgrimId) {
    invoices = invoices.filter((inv) => inv.pilgrimId === filters.pilgrimId);
  }
  if (filters?.status) {
    invoices = invoices.filter((inv) => inv.status === filters.status);
  }

  return invoices;
}

export async function cancelInvoice(invoiceId: string, agencyId: string): Promise<Invoice> {
  // TODO: Replace with real payment gateway cancel API call
  const agencyInvoices = mockInvoiceStore.get(agencyId) || [];
  const index = agencyInvoices.findIndex((inv) => inv.id === invoiceId);

  if (index === -1) {
    throw new Error('Invoice tidak ditemukan');
  }

  const invoice = agencyInvoices[index];
  if (invoice.status !== 'pending') {
    throw new Error('Hanya invoice pending yang dapat dibatalkan');
  }

  agencyInvoices[index] = { ...invoice, status: 'cancelled' };
  mockInvoiceStore.set(agencyId, agencyInvoices);

  return agencyInvoices[index];
}

export async function handleWebhook(provider: PaymentProvider, payload: unknown): Promise<void> {
  // TODO: Replace with real webhook verification and processing
  // 1. Verify webhook signature (Midtrans: SHA512, Xendit: callback token, Duitku: merchant code)
  // 2. Extract transaction ID and status from payload
  // 3. Update invoice status in database
  // 4. If paid, create PaymentRecord and update pilgrim totalPaid
  // 5. Send notification to agency

  console.log(`[Payment Webhook] Provider: ${provider}`, JSON.stringify(payload, null, 2));

  // Mock: just log for now
  // In production, this would:
  // - Verify the webhook signature
  // - Find the invoice by external ID
  // - Update status to 'paid' if successful
  // - Trigger a payment record creation
}

export function getChannelLabel(channel: PaymentChannel): string {
  const labels: Record<PaymentChannel, string> = {
    va_bca: 'Virtual Account BCA',
    va_mandiri: 'Virtual Account Mandiri',
    va_bni: 'Virtual Account BNI',
    va_bri: 'Virtual Account BRI',
    qris: 'QRIS',
    ewallet_gopay: 'GoPay',
    ewallet_ovo: 'OVO',
    ewallet_dana: 'DANA',
    credit_card: 'Kartu Kredit',
  };
  return labels[channel] || channel;
}

export function getAvailableChannels(): Array<{
  id: PaymentChannel;
  label: string;
  icon: string;
  group: string;
}> {
  return [
    { id: 'va_bca', label: 'BCA', icon: '🏦', group: 'Virtual Account' },
    { id: 'va_mandiri', label: 'Mandiri', icon: '🏦', group: 'Virtual Account' },
    { id: 'va_bni', label: 'BNI', icon: '🏦', group: 'Virtual Account' },
    { id: 'va_bri', label: 'BRI', icon: '🏦', group: 'Virtual Account' },
    { id: 'ewallet_gopay', label: 'GoPay', icon: '💚', group: 'E-Wallet' },
    { id: 'ewallet_ovo', label: 'OVO', icon: '💜', group: 'E-Wallet' },
    { id: 'ewallet_dana', label: 'DANA', icon: '💙', group: 'E-Wallet' },
    { id: 'qris', label: 'QRIS', icon: '📱', group: 'Lainnya' },
    { id: 'credit_card', label: 'Kartu Kredit', icon: '💳', group: 'Lainnya' },
  ];
}
