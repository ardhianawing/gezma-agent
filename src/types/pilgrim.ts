import { DocumentType, DocumentStatus, PilgrimStatus, Gender } from './index';

export interface PilgrimDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number; // in bytes
  uploadedAt?: string; // ISO date
  expiryDate?: string; // ISO date (for passport)
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string; // e.g., "Istri", "Suami", "Anak", "Orang Tua"
}

export interface PilgrimChecklist {
  ktpUploaded: boolean;
  passportUploaded: boolean;
  passportValid: boolean; // > 6 months from departure
  photoUploaded: boolean;
  dpPaid: boolean;
  dpAmount?: number;
  dpDate?: string;
  fullPayment: boolean;
  fullPaymentDate?: string;
  visaSubmitted: boolean;
  visaSubmittedDate?: string;
  visaReceived: boolean;
  visaReceivedDate?: string;
  healthCertificate: boolean;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  type: 'dp' | 'installment' | 'full' | 'refund';
  method: 'transfer' | 'cash' | 'card';
  date: string;
  notes?: string;
  receiptUrl?: string;
}

export interface Pilgrim {
  id: string;

  // Personal Info
  nik: string; // 16 digits
  name: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string; // ISO date
  address: string;
  city: string;
  province: string;
  postalCode?: string;

  // Contact
  phone: string;
  email: string;
  whatsapp?: string;

  // Emergency Contact
  emergencyContact: EmergencyContact;

  // Status & Assignment
  status: PilgrimStatus;
  tripId?: string;
  roomNumber?: string;
  roomType?: 'single' | 'double' | 'triple' | 'quad';

  // Documents
  documents: PilgrimDocument[];

  // Checklist
  checklist: PilgrimChecklist;

  // Payments
  payments: PaymentRecord[];
  totalPaid: number;
  remainingBalance: number;

  // Metadata
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// For list/table display
export interface PilgrimSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: PilgrimStatus;
  tripId?: string;
  tripName?: string;
  documentsComplete: number;
  documentsTotal: number;
  createdAt: string;
}
