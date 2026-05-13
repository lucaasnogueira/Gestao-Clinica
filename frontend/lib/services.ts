import api from './api';
import type {
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  Bill,
  Insurance,
  Specialty,
  Notification,
  PaginatedResponse,
  AuthTokens,
  AvailabilitySlot,
  AppointmentStatus,
  CreatePatientDTO,
  CreateAppointmentDTO,
} from '@/types';

// ========================
// AUTH
// ========================
export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login', { email, password }).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api.get<{ id: string; email: string; role: string }>('/auth/me').then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
};

// ========================
// PATIENTS
// ========================
export const patientService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Patient>>('/patients', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Patient>(`/patients/${id}`).then((r) => r.data),

  create: (data: CreatePatientDTO) =>
    api.post<Patient>('/patients', data).then((r) => r.data),

  update: (id: string, data: Partial<CreatePatientDTO>) =>
    api.put<Patient>(`/patients/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/patients/${id}`).then((r) => r.data),

  search: (q: string) =>
    api.get<Patient[]>('/patients/search', { params: { q } }).then((r) => r.data),

  getAppointments: (id: string) =>
    api.get<PaginatedResponse<Appointment>>(`/patients/${id}/appointments`).then((r) => r.data),

  getMedicalRecords: (id: string) =>
    api.get<PaginatedResponse<MedicalRecord>>(`/patients/${id}/medical-records`).then((r) => r.data),

  getBills: (id: string) =>
    api.get<PaginatedResponse<Bill>>(`/patients/${id}/bills`).then((r) => r.data),

};

// ========================
// DOCTORS
// ========================
export const doctorService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Doctor>>('/doctors', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Doctor>(`/doctors/${id}`).then((r) => r.data),

  create: (data: any) =>
    api.post<Doctor>('/doctors', data).then((r) => r.data),

  update: (id: string, data: any) =>
    api.patch<Doctor>(`/doctors/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/doctors/${id}`).then((r) => r.data),

  getBySpecialty: (specialtyId: string) =>
    api.get<Doctor[]>(`/doctors/by-specialty/${specialtyId}`).then((r) => r.data),

  getSchedules: (id: string) =>
    api.get(`/doctors/${id}/schedules`).then((r) => r.data),

  getAvailability: (id: string, date: string) =>
    api.get<AvailabilitySlot>(`/doctors/${id}/availability`, { params: { date } }).then((r) => r.data),
};

// ========================
// APPOINTMENTS
// ========================
export const appointmentService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Appointment>>('/appointments', { params }).then((r) => r.data),

  today: () =>
    api.get<Appointment[]>('/appointments/today').then((r) => r.data),

  calendar: (params?: { start: string; end: string }) =>
    api.get<Appointment[]>('/appointments/calendar', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),

  create: (data: CreateAppointmentDTO) =>
    api.post<Appointment>('/appointments', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateAppointmentDTO>) =>
    api.put<Appointment>(`/appointments/${id}`, data).then((r) => r.data),

  updateStatus: (id: string, status: AppointmentStatus, cancellationReason?: string) =>
    api.patch(`/appointments/${id}/status`, { status, cancellationReason }).then((r) => r.data),

  cancel: (id: string, reason?: string) =>
    api.delete(`/appointments/${id}`, { data: { reason } }).then((r) => r.data),
};

// ========================
// MEDICAL RECORDS
// ========================
export const medicalRecordService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<MedicalRecord>>('/medical-records', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<MedicalRecord>(`/medical-records/${id}`).then((r) => r.data),

  create: (data: Partial<MedicalRecord>) =>
    api.post<MedicalRecord>('/medical-records', data).then((r) => r.data),

  update: (id: string, data: Partial<MedicalRecord>) =>
    api.patch<MedicalRecord>(`/medical-records/${id}`, data).then((r) => r.data),
};

// ========================
// BILLING
// ========================
export const billService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Bill>>('/billing', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Bill>(`/billing/${id}`).then((r) => r.data),

  registerPayment: (id: string, data: { paymentMethod: string; amount: number }) =>
    api.patch(`/billing/${id}/pay`, data).then((r) => r.data),
};

// ========================
// SPECIALTIES & INSURANCE
// ========================
export const specialtyService = {
  list: () =>
    api.get<{ data: Specialty[] }>('/specialties').then((r) => r.data.data),
};

export const insuranceService = {
  list: () =>
    api.get<{ data: Insurance[] }>('/insurance').then((r) => r.data.data),

  get: (id: string) =>
    api.get<Insurance>(`/insurance/${id}`).then((r) => r.data),
};

// ========================
// NOTIFICATIONS
// ========================
export const notificationService = {
  list: () =>
    api.get<Notification[]>('/notifications').then((r) => r.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};

// ========================
// CEP / ADDRESS
// ========================
export const cepService = {
  fetch: (cep: string) =>
    api.get<{
      zip: string;
      street: string;
      neighborhood: string;
      city: string;
      state: string;
      complement?: string;
    }>(`/cep/${cep}`).then((r) => r.data),
};

// ========================
// REPORTS & GOALS
// ========================
export const reportService = {
  getStats: () =>
    api.get('/reports').then((r) => r.data),
};

export const goalService = {
  list: () =>
    api.get('/goals').then((r) => r.data),

  findByMonth: (month: string) =>
    api.get('/goals/by-month', { params: { month } }).then((r) => r.data),

  upsert: (data: { type: string; month: string; targetValue: number }) =>
    api.post('/goals', data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/goals/${id}`).then((r) => r.data),
};
