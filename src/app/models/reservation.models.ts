export interface Service {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  durationMin: number;
  price: number;
  priceFormatted: string;
  durationFormatted: string;
}

export interface Appointment {
  resourceServiceId: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Customer {
  id?: number;
  id_business?: number;
  first_name: string;
  last_name: string;
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
  status: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface StepData {
  service?: Service;
  serviceId?: number;
  appointment?: Appointment;
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  contactInfo?: ContactInfo;
  customer?: Customer;
}

export interface TimeSlot {
  id: string;
  appointmentId: number;
  time: string;
  available: boolean;
  date: string;
}

export interface CalendarDay {
  date: string;
  dayOfWeek: number;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAvailability: boolean;
  isSelected: boolean;
  isUnavailable: boolean;
}

export interface WeekSchedule {
  dayOfWeek: string;
  shortName: string;
  dayNumber: number;
  isAvailable: boolean;
  timeSlots: string[];
}

export interface AppointmentAvailability {
  appointmentId: number;
  currentWeekHeader: string;
  navigation: {
    canGoPrevious: boolean;
    canGoNext: boolean;
  };
  weekSchedule: WeekSchedule[];
}

export interface BookingConfirmation {
  success: boolean;
  customer: Customer;
  booking: Booking;
}
