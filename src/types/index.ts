// Core types for the restaurant reservation system

// Restaurant types for multi-tenant platform
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  owner_id: string;
  logo_url?: string | null;
  primary_color: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  is_active: boolean;
  template: 'template1' | 'template2' | 'template3' | 'template4';
  created_at: string;
  updated_at: string;
}

export interface CreateRestaurantData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  owner_id: string;
  logo_url?: string | null;
  primary_color?: string;
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

export * from './menu';