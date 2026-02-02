export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string; // e.g., "014" for BCA
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface AgencyDocument {
  id: string;
  type: 'ppiu_license' | 'siup' | 'npwp' | 'akta' | 'domisili' | 'other';
  name: string;
  number?: string; // Document number
  fileUrl?: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
}

export interface AgencyBranding {
  primaryColor: string;
  secondaryColor?: string;
  logoUrl?: string;
  logoIconUrl?: string;
  logoWhiteUrl?: string;
  faviconUrl?: string;
}

export interface Agency {
  id: string;

  // Basic Info
  name: string; // Company name
  legalName: string; // PT. ...
  tagline?: string;
  description?: string;

  // PPIU Info
  ppiuNumber: string; // Nomor izin PPIU
  ppiuIssueDate: string;
  ppiuExpiryDate: string;
  ppiuStatus: 'active' | 'expiring' | 'expired';

  // Contact
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;

  // Address
  address: string;
  city: string;
  province: string;
  postalCode: string;

  // Bank Accounts
  bankAccounts: BankAccount[];

  // Contact Persons
  contactPersons: ContactPerson[];

  // Documents
  documents: AgencyDocument[];

  // Branding
  branding: AgencyBranding;

  // Verification
  verificationCode: string; // For QR code
  verificationUrl: string;
  isVerified: boolean;

  // Settings
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
}
