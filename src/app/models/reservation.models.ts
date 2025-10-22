// Categories & Services
export interface Category {
  id: number;
  name: string;
  isActive: boolean;
  services: Service[];
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  logoUrl?: string;
  durationMin: number;
  bufferTimeMin: number;
  price: number;
  priceFormatted: string; // Ej: "$8.000"
  durationFormatted: string; // Ej: "30 min"
  isActive: boolean;
}

// Appointments (Resources/Personnel)
export interface Appointment {
  id: number;
  businessId: number;
  userId: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  availableServices: number[]; // Array de service IDs que puede prestar
}

// =====================================
// MODELOS OPTIMIZADOS - El backend procesa toda la lógica
// =====================================

// Disponibilidad ya procesada por el backend
export interface AppointmentAvailability {
  appointmentId: number;
  weekSchedule: WeekSchedule[];
  currentWeekHeader: string; // "21 - 27, Septiembre 2024" ya formateado
  navigation: {
    canGoPrevious: boolean;
    canGoNext: boolean;
  };
}

// Días de la semana con datos ya procesados
export interface WeekSchedule {
  dayOfWeek: string; // 'Lunes', 'Martes', etc. (para mostrar si es necesario)
  shortName: string; // 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do' (para el frontend)
  dayNumber: number; // 1=Lunes, 2=Martes, etc.
  isAvailable: boolean; // false para días pasados, cerrados, bloqueados
  timeSlots: string[]; // ['09:00', '10:00'] ya filtrados (sin horas pasadas)
}

// Time Slots simplificado
export interface TimeSlot {
  id: string; // "1-2024-09-27-09:00"
  appointmentId: number;
  time: string; // '09:00'
  available: boolean; // El backend ya calculó si está disponible
  date: string; // ISO date string
}

// CalendarDay simplificado - el backend ya hizo todos los cálculos
export interface CalendarDay {
  date: string; // ISO date string
  dayOfWeek: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  dayNumber: number; // Número del día del mes
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAvailability: boolean; // El backend ya calculó esto
  isSelected: boolean;
  isUnavailable: boolean; // !hasAvailability
}

// Customer & Contact Information
export interface Customer {
  id?: number;
  id_business: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Booking {
  id?: number;
  id_customer: number;
  id_appointment_service: number;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status?: string;
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
}

// Step Data for Reservation Flow
export interface StepData {
  service?: Service;
  serviceId?: number;
  appointment?: Appointment;
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  contactInfo?: ContactInfo;
}

// API Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
