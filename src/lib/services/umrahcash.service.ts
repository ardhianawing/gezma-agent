// UmrahCash Fintech Integration Service
// Cross-border payment IDR → SAR for Umrah agencies
// Currently returns mock data — will be replaced with real UmrahCash API calls

export interface UmrahCashConfig {
  isEnabled: boolean;
  partnerId: string | null;
  partnerStatus: 'pending' | 'active' | 'suspended' | 'not_registered';
  apiKey: string | null;
}

export interface ExchangeRate {
  pair: 'IDR_SAR';
  rate: number;
  lockedUntil: string | null;
  source: string;
  updatedAt: string;
}

export interface UmrahCashTransaction {
  id: string;
  type: 'transfer' | 'rate_lock';
  amountIDR: number;
  amountSAR: number;
  rate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  pilgrimId: string | null;
  createdAt: string;
  completedAt: string | null;
  fee: number;
}

// In-memory store for mock config per agency
const configStore: Record<string, UmrahCashConfig> = {};

// In-memory store for locked rates per agency
const lockedRates: Record<string, ExchangeRate> = {};

// Mock transactions per agency
const transactionStore: Record<string, UmrahCashTransaction[]> = {};

const MOCK_RATE = 4150;
const MOCK_FEE = 25000;

const MOCK_TRANSACTIONS: UmrahCashTransaction[] = [
  {
    id: 'uc-txn-001',
    type: 'transfer',
    amountIDR: 41500000,
    amountSAR: 10000,
    rate: 4150,
    status: 'completed',
    recipientName: 'Ahmad bin Abdullah',
    recipientBank: 'Al Rajhi Bank',
    recipientAccount: 'SA4420000001234567891',
    pilgrimId: 'plg-001',
    createdAt: '2026-02-20T08:30:00Z',
    completedAt: '2026-02-20T09:15:00Z',
    fee: 25000,
  },
  {
    id: 'uc-txn-002',
    type: 'transfer',
    amountIDR: 20750000,
    amountSAR: 5000,
    rate: 4150,
    status: 'processing',
    recipientName: 'Fatimah Al-Zahrani',
    recipientBank: 'NCB (National Commercial Bank)',
    recipientAccount: 'SA5530000009876543210',
    pilgrimId: 'plg-002',
    createdAt: '2026-02-22T14:00:00Z',
    completedAt: null,
    fee: 25000,
  },
  {
    id: 'uc-txn-003',
    type: 'transfer',
    amountIDR: 8300000,
    amountSAR: 2000,
    rate: 4150,
    status: 'failed',
    recipientName: 'Mohammed Al-Harbi',
    recipientBank: 'Riyad Bank',
    recipientAccount: 'SA6640000005555666677',
    pilgrimId: null,
    createdAt: '2026-02-19T11:45:00Z',
    completedAt: null,
    fee: 25000,
  },
];

export async function getUmrahCashConfig(agencyId: string): Promise<UmrahCashConfig> {
  if (configStore[agencyId]) {
    return configStore[agencyId];
  }

  return {
    isEnabled: false,
    partnerId: null,
    partnerStatus: 'not_registered',
    apiKey: null,
  };
}

export async function updateUmrahCashConfig(
  agencyId: string,
  updates: Partial<Pick<UmrahCashConfig, 'isEnabled' | 'apiKey' | 'partnerId' | 'partnerStatus'>>
): Promise<UmrahCashConfig> {
  const current = await getUmrahCashConfig(agencyId);
  const updated: UmrahCashConfig = { ...current, ...updates };
  configStore[agencyId] = updated;
  return updated;
}

export async function getCurrentRate(): Promise<ExchangeRate> {
  return {
    pair: 'IDR_SAR',
    rate: MOCK_RATE,
    lockedUntil: null,
    source: 'UmrahCash Market Rate',
    updatedAt: new Date().toISOString(),
  };
}

export async function lockRate(agencyId: string, amountSAR: number): Promise<ExchangeRate> {
  void amountSAR;

  const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const rate: ExchangeRate = {
    pair: 'IDR_SAR',
    rate: MOCK_RATE,
    lockedUntil,
    source: 'UmrahCash Locked Rate',
    updatedAt: new Date().toISOString(),
  };

  lockedRates[agencyId] = rate;
  return rate;
}

export async function getLockedRate(agencyId: string): Promise<ExchangeRate | null> {
  const locked = lockedRates[agencyId];
  if (!locked || !locked.lockedUntil) return null;

  // Check if expired
  if (new Date(locked.lockedUntil) < new Date()) {
    delete lockedRates[agencyId];
    return null;
  }

  return locked;
}

export async function createTransfer(params: {
  amountSAR: number;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  pilgrimId?: string;
  agencyId: string;
}): Promise<UmrahCashTransaction> {
  const { amountSAR, recipientName, recipientBank, recipientAccount, pilgrimId, agencyId } = params;

  // Check for locked rate
  const locked = await getLockedRate(agencyId);
  const rate = locked ? locked.rate : MOCK_RATE;

  const transaction: UmrahCashTransaction = {
    id: `uc-txn-${Date.now()}`,
    type: 'transfer',
    amountIDR: amountSAR * rate,
    amountSAR,
    rate,
    status: 'pending',
    recipientName,
    recipientBank,
    recipientAccount,
    pilgrimId: pilgrimId || null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    fee: MOCK_FEE,
  };

  if (!transactionStore[agencyId]) {
    transactionStore[agencyId] = [...MOCK_TRANSACTIONS];
  }
  transactionStore[agencyId].unshift(transaction);

  return transaction;
}

export async function listTransactions(agencyId: string): Promise<UmrahCashTransaction[]> {
  if (transactionStore[agencyId]) {
    return transactionStore[agencyId];
  }

  // Return mock transactions for first load
  transactionStore[agencyId] = [...MOCK_TRANSACTIONS];
  return transactionStore[agencyId];
}

export async function getTransaction(id: string, agencyId: string): Promise<UmrahCashTransaction | null> {
  const transactions = await listTransactions(agencyId);
  return transactions.find((t) => t.id === id) || null;
}
