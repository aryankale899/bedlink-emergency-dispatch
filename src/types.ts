/**
 * BedLink Core Type Definitions
 * Healthcare Emergency Coordination Platform
 */

export type BedType = 
  | 'icu'
  | 'ventilator'
  | 'oxygen'
  | 'general'
  | 'cardiac'
  | 'burn'
  | 'stroke'
  | 'pediatric';

export type SpecialtyType = 
  | 'none'
  | 'cardiac'
  | 'trauma'
  | 'burns'
  | 'stroke'
  | 'pediatric'
  | 'neurology';

export type PatientCondition = 'critical' | 'urgent' | 'stable';

export interface BedDetail {
  total: number;
  occupied: number;
  available: number;
  held: number;
  lastUpdated: number;
}

export type BedInventoryMap = Record<BedType, BedDetail>;

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  emergencyRadioChannel: string;
  region: string;
  traumaLevel: 'Level 1 Trauma' | 'Level 2 Trauma' | 'Level 3 Trauma' | 'Community Hospital';
  coordinates: {
    lat: number;
    lng: number;
    x: number; // SVG map percentage 0-100
    y: number; // SVG map percentage 0-100
  };
  totalBeds: number;
  availableBeds: number;
  currentLoad: number; // 0-100%
  edDoctorsOnDuty: number;
  edBypassStatus: 'open' | 'caution' | 'diverting';
  lastUpdated: number; // Unix timestamp ms
  updatedByNurse: string;
  specialties: SpecialtyType[];
  specialtyLabels: string[];
  operatingHours: string;
  helipad: boolean;
  ambulanceEntrance: string;
  bloodBank: boolean;
  isolationRooms: number;
  beds: BedInventoryMap;
}

export interface PatientVitals {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  gcs: number;
  respiratoryRate: number;
}

export interface AdditionalRequirements {
  isolation: boolean;
  cardiologist: boolean;
  surgeryCapability: boolean;
  bloodBank: boolean;
  neonatalSupport: boolean;
  helipad: boolean;
}

export interface PatientRequest {
  caseId: string;
  condition: PatientCondition;
  requiredBedType: BedType;
  requiredSpecialty: SpecialtyType;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  chiefComplaint: string;
  notes: string;
  vitals: PatientVitals;
  additionalRequirements: AdditionalRequirements;
  location: {
    name: string;
    lat: number;
    lng: number;
    x: number; // SVG map percentage
    y: number; // SVG map percentage
  };
  ambulanceUnit: string;
  ambulanceType: 'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)' | 'MICU (Mobile ICU)';
  patientStability: 'Unstable' | 'Guarded' | 'Stable';
  requestedAt: number;
}

export interface MatchScoreBreakdown {
  bedMatch: number; // out of 40
  travelTime: number; // out of 25
  freshness: number; // out of 20
  currentLoad: number; // out of 15
  totalScore: number; // out of 100
  travelMinutes: number;
  distanceKm: number;
  dataAgeMinutes: number;
  availableMatchingBeds: number;
  specialtyMatched: boolean;
  warnings: string[];
  reasons: string[];
}

export interface RankedHospitalResult {
  hospital: Hospital;
  score: MatchScoreBreakdown;
  rank: number;
}

export type HoldStatus = 
  | 'pending'
  | 'held'
  | 'en_route'
  | 'ambulance_en_route'
  | 'arrived'
  | 'completed'
  | 'expiring_soon'
  | 'rejected'
  | 'timed_out';

export type RejectionReason = 
  | 'Bed no longer available'
  | 'Patient needs cannot be supported'
  | 'Staffing unavailable'
  | 'Specialty unavailable'
  | 'Critical ED saturation'
  | 'Other';

export interface BedHold {
  id: string;
  caseId: string;
  hospitalId: string;
  hospitalName: string;
  bedType: BedType;
  specialty: SpecialtyType;
  ambulanceUnit: string;
  requestedAt: number;
  expiresAt: number; // 2 minutes from request for pending, or 30-45 mins when held
  status: HoldStatus;
  rejectionReason?: string;
  holdToken?: string;
  assignedBay?: string;
  travelMinutes: number;
  nextBestHospitalId?: string;
  patientSummary: string;
  lastHospitalUpdate: number;
  notesFromDispatch?: string;
}

export interface NurseAuditRecord {
  id: string;
  hospitalId: string;
  updatedBy: string;
  updatedTime: number;
  bedType: BedType;
  previousCount: number;
  newCount: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  actor: string;
  hospitalId?: string;
  hospitalName?: string;
  caseId?: string;
  action: 
    | 'bed_updated'
    | 'hold_requested'
    | 'hospital_accepted'
    | 'hospital_rejected'
    | 'request_timed_out'
    | 'next_best_offered'
    | 'hold_released'
    | 'ambulance_arrived'
    | 'sync_completed'
    | 'system_alert';
  result: string;
}

export type NavView = 
  | 'dispatch'
  | 'map'
  | 'nurse'
  | 'holds'
  | 'hospitals'
  | 'logs'
  | 'settings';

export type UserRole = 
  | 'Dispatcher'
  | 'Charge Nurse'
  | 'Hospital Coordinator'
  | 'Medical Director';

export type ConnectivityStatus = 
  | 'online'
  | 'poor_connectivity'
  | 'offline'
  | 'syncing';
