// Core types for the restaurant reservation system

export interface Reservation {
  id?: string;
  name: string;
  email: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  special_requests?: string | null;
  status?: ReservationStatus;
  requires_confirmation?: boolean;
  arrival_status?: ArrivalStatus | null;
  created_at?: string;
  updated_at?: string;
  confirmed_at?: string | null;
  confirmed_by?: string | null;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type ArrivalStatus = 'arrived' | 'no_show';

export type CreateReservationData = Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'status'>;

export interface ReservationFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  specialRequests: string;
}

export interface ReservationStats {
  total: number;
  pending?: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export interface FilterOptions {
  date?: string;
  dateFilter?: 'all' | 'today' | 'tomorrow' | 'next7days' | 'next30days' | 'custom';
  status?: string;
  searchTerm?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface SuccessResponse<T> extends ApiResponse<T> {
  data: T;
  success: true;
}

export interface ErrorResponse extends ApiResponse<never> {
  error: string;
  success: false;
}

// Common utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}