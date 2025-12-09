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

// BOOKING MODELS
export interface Booking {
  id?: number;
  customerId: number;
  resourceServiceId: number;
  startDatetime: string;
  endDatetime: string;
  price: number;
  status: 'Pendiente' | 'Confirmada' | 'Pagada' | 'Completada' | 'Cancelada';
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// STEPPER MODELS
export type StepperMode = 'public' | 'admin';

export interface ReservationStepperData {
  mode: StepperMode;
  selectedService?: Service;
  selectedResourceId?: number;
}

export interface StepData {
  service?: Service;
  serviceId?: number;
  resourceId?: number;
  resourceServiceId?: number;
  appointment?: Appointment;
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  contactInfo?: ContactInfo;
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

export interface CustomerTableRow {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  initials: string;
}

export interface BookingTableRow {
  id: number;
  serviceName: string;
  resourceName: string;
  customerName?: string;
  duration: string;
  price: string;
  status: string;
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

export interface CustomerBookingsDialogData {
  customerId: number;
  customerName: string;
}

// LAYOUT MODELS
export interface LayoutMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  allowedRoles: string[];
}

// KPI CARD MODELS
export interface KpiCardData {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass: string;
}

// CHART DATA MODELS
export interface ChartDataPoint {
  x: string;
  y: number;
}

export interface BarChartData {
  name: string;
  value: number;
}

export interface DonutChartFormatterContext {
  globals: {
    seriesTotals: number[];
  };
}
