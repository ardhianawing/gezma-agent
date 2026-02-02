import { TripStatus, PilgrimStatus } from './index';

export interface FlightInfo {
  departureAirline: string;
  departureFlightNo: string;
  departureDate: string;
  departureTime: string;
  departureAirport: string; // e.g., "CGK - Soekarno Hatta"
  departureTerminal?: string;

  returnAirline: string;
  returnFlightNo: string;
  returnDate: string;
  returnTime: string;
  returnAirport: string;
  returnTerminal?: string;
}

export interface ManifestEntry {
  pilgrimId: string;
  pilgrimName: string;
  pilgrimStatus: PilgrimStatus;
  documentsComplete: number;
  documentsTotal: number;
  roomNumber?: string;
  roomType?: string;
  seatPreference?: string;
  mealPreference?: string;
  specialNeeds?: string;
  addedAt: string;
}

export interface RoomAssignment {
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad';
  hotel: 'makkah' | 'madinah';
  pilgrims: {
    pilgrimId: string;
    pilgrimName: string;
  }[];
}

export interface TripChecklist {
  allPilgrimsConfirmed: boolean;
  manifestComplete: boolean;
  roomingListFinalized: boolean;
  flightTicketsIssued: boolean;
  hotelConfirmed: boolean;
  guideAssigned: boolean;
  guideName?: string;
  guidePhone?: string;
  insuranceProcessed: boolean;
  departureBriefingDone: boolean;
  departureBriefingDate?: string;
}

export interface Trip {
  id: string;

  // Basic Info
  name: string; // e.g., "Umrah Reguler - Maret 2026"
  packageId: string;
  packageName: string;

  // Dates
  departureDate: string;
  returnDate: string;
  registrationCloseDate?: string;

  // Capacity
  capacity: number;
  registeredCount: number;
  confirmedCount: number;

  // Status
  status: TripStatus;

  // Flight
  flightInfo: FlightInfo;

  // Manifest
  manifest: ManifestEntry[];

  // Rooming
  roomAssignments: RoomAssignment[];

  // Checklist
  checklist: TripChecklist;

  // Guide
  muthawwifName?: string;
  muthawwifPhone?: string;

  // Pricing (from package, can be overridden)
  pricePerPerson: number;

  // Notes
  notes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
