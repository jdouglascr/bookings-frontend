// SERVICE MODELS
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

// APPOINTMENT MODELS
export interface Appointment {
  resourceServiceId: number;
  name: string;
  description: string;
  imageUrl: string;
}

// CUSTOMER MODELS
export interface Customer {
  id?: number;
  id_business?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

// BOOKING MODELS
export interface Booking {
  id?: number;
  id_customer: number;
  id_appointment_service: number;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: 'Pendiente' | 'Confirmada' | 'Pagada' | 'Completada' | 'Cancelada';
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// STEPPER MODELS
export interface StepData {
  service?: Service;
  serviceId?: number;
  appointment?: Appointment;
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  contactInfo?: ContactInfo;
  customer?: Customer;
}

export interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

// AVAILABILITY MODELS
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

// DATA TABLE MODELS
export interface TableColumn<T> {
  key: string;
  label: string;
  type?: 'text' | 'avatar';
  width?: string;
  getValue: (row: T) => string;
  getAvatarText?: (row: T) => string;
}

export interface TableAction<T> {
  icon: string;
  tooltip: string;
  handler: (row: T) => void;
}

// USER MODELS
export interface UserTableRow {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  statusText: string;
  lastLogin: string;
  initials: string;
}

// AVAILABLE TIMES MODELS
export interface DaySchedule {
  id: number | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

// DIALOG MODELS
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ServiceDialogData {
  categoryId?: number;
  serviceId?: number;
}

export interface SelectedServiceDialogData {
  selectedService: Service;
}

// LAYOUT MODELS
export interface LayoutMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  isEnabled: boolean;
}
