// ========================
// ENUMS
// ========================

export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PATIENT';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type BloodType =
  | 'A_POSITIVE' | 'A_NEGATIVE'
  | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'O_POSITIVE' | 'O_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'INSURANCE' | 'BANK_TRANSFER';

export type NotificationType =
  | 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED' | 'EXAM_RESULT' | 'PAYMENT_DUE';

export type ExamStatus = 'REQUESTED' | 'PENDING' | 'COMPLETED';

// ========================
// ENTITIES
// ========================

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Insurance {
  id: string;
  name: string;
  ansCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface Patient {
  id: string;
  fullName: string;
  cpf: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType?: BloodType;
  phone: string;
  phoneSecondary?: string;
  email?: string;
  address?: Address;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact?: EmergencyContact;
  insuranceId?: string;
  insurance?: Insurance;
  insuranceNumber?: string;
  notes?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  crm: string;
  crmState: string;
  phone: string;
  bio?: string;
  photo?: string;
  consultDuration: number;
  consultPrice: number;
  isActive: boolean;
  specialties?: { specialty: Specialty }[];
  schedules?: Schedule[];
  user?: { email: string; isActive: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Pick<Patient, 'id' | 'fullName' | 'phone'>;
  doctorId: string;
  doctor?: Pick<Doctor, 'id' | 'fullName'>;
  specialtyId?: string;
  specialty?: Specialty;
  scheduledAt: string;
  endsAt: string;
  status: AppointmentStatus;
  type: string;
  notes?: string;
  cancellationReason?: string;
  insuranceId?: string;
  insurance?: Insurance;
  medicalRecord?: MedicalRecord;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: Pick<Patient, 'id' | 'fullName'>;
  doctorId: string;
  doctor?: Pick<Doctor, 'id' | 'fullName'>;
  appointmentId?: string;
  chiefComplaint: string;
  anamnesis: string;
  physicalExam?: string;
  diagnosis?: string;
  cidCode?: string;
  conduct: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicalRecordId?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  validUntil?: string;
  isControlled: boolean;
  createdAt: string;
}

export interface Exam {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  name: string;
  type: string;
  requestedBy: string;
  status: ExamStatus;
  resultUrl?: string;
  resultNotes?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patient?: Pick<Patient, 'id' | 'fullName'>;
  appointmentId?: string;
  insuranceId?: string;
  insurance?: Insurance;
  amount: number;
  discount: number;
  totalAmount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  patientId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  sentAt?: string;
  createdAt: string;
}

// ========================
// API WRAPPERS
// ========================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface AvailabilitySlot {
  available: boolean;
  slots: string[];
}

// ========================
// FORM DATA TYPES
// ========================

export interface CreatePatientDTO {
  fullName: string;
  cpf: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType?: BloodType;
  phone: string;
  phoneSecondary?: string;
  email?: string;
  address?: Address;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: EmergencyContact;
  insuranceId?: string;
  insuranceNumber?: string;
  notes?: string;
}

export interface CreateAppointmentDTO {
  patientId: string;
  doctorId: string;
  specialtyId?: string;
  scheduledAt: string;
  type?: string;
  notes?: string;
  insuranceId?: string;
}
