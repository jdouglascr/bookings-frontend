// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  type: string;
  iat: number;
  exp: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
}

// Category
export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  createdAt: string;
}

export interface CategoryWithServices {
  category: CategoryResponse;
  services: ServiceResponse[];
  servicesCount: number;
}

// Service
export interface ServiceRequest {
  categoryId: number;
  name: string;
  description: string;
  logoUrl: string;
  durationMin: number;
  bufferTimeMin: number;
  price: number;
}

export interface ServiceResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  logoUrl: string;
  durationMin: number;
  bufferTimeMin: number;
  price: number;
  createdAt: string;
}

// User
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'ROLE_ADMIN' | 'ROLE_STAFF';
  isActive?: boolean;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}

// Customer
export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CustomerResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Business
export interface BusinessWithHoursResponse {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  logoUrl: string;
  bannerUrl: string;
  businessHours: BusinessHourDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHourDto {
  id: number | null;
  dayOfWeek: string;
  startTime: string | null;
  endTime: string | null;
  isClosed: boolean;
}

export interface BusinessWithHoursUpdateRequest {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  businessHours: BusinessHourUpdateDto[];
}

export interface BusinessHourUpdateDto {
  id: number;
  dayOfWeek: string;
  startTime: string | null;
  endTime: string | null;
  isClosed: boolean;
}

// Booking
export interface BookingResponse {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  resourceServiceId: number;
  resourceId: number;
  resourceName: string;
  serviceId: number;
  serviceName: string;
  startDatetime: string;
  endDatetime: string;
  price: number;
  status: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  confirmationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  customerId: number;
  resourceServiceId: number;
  startDatetime: string;
  endDatetime: string;
  price: number;
  status: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  confirmationToken?: string;
}

export interface BookingCalendarParams {
  resourceId: number;
  startDate: string;
  endDate: string;
}

export interface UpdateBookingStatusRequest {
  status: string;
}

export const BOOKING_STATUSES = [
  'Pendiente',
  'Confirmada',
  'Pagada',
  'Completada',
  'Cancelada',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface CalendarWeek {
  weekStart: Date;
  weekEnd: Date;
  weekLabel: string;
}

export interface CalendarDay {
  date: Date;
  dateLabel: string;
  dayNumber: number;
  isToday: boolean;
  bookings: BookingResponse[];
}

export interface CalendarFilters {
  resourceId: number | null;
  currentWeek: CalendarWeek;
}

// Resource
export interface ResourceRequest {
  userId: number;
  name: string;
  resourceType: 'Profesional' | 'Infraestructura';
  description?: string;
  serviceIds: number[];
}

export interface ResourceResponse {
  id: number;
  userId: number;
  userName: string;
  name: string;
  resourceType: string;
  description?: string;
  imageUrl: string;
  services: ServiceInfoResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInfoResponse {
  id: number;
  name: string;
  categoryName: string;
  durationMin: number;
  price: number;
}

// Dashboard
export interface DashboardStats {
  monthlyKpis: MonthlyKpis;
  dailyBookings: DailyBookingCount[];
  topResources: TopResource[];
  topServices: TopService[];
  statusDistribution: BookingStatusDistribution;
}

export interface MonthlyKpis {
  currentMonthBookings: number;
  previousMonthBookings: number;
  bookingsChangePercent: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueChangePercent: number;
  confirmationRate: number;
  cancellationRate: number;
  newCustomers: number;
  upcomingBookingsToday: number;
  upcomingBookingsThisWeek: number;
}

export interface DailyBookingCount {
  date: string;
  count: number;
}

export interface TopResource {
  resourceName: string;
  bookingCount: number;
  totalRevenue: number;
}

export interface TopService {
  serviceName: string;
  bookingCount: number;
  totalRevenue: number;
}

export interface BookingStatusDistribution {
  pending: number;
  confirmed: number;
  paid: number;
  completed: number;
  cancelled: number;
}
