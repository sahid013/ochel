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
  hero_image_url?: string | null;
  primary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  is_active: boolean;
  template: 'template1' | 'template2' | 'template3' | 'template4';
  has_completed_onboarding?: boolean;
  subscription_plan?: string | null;
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired';
  credits_left?: number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  qr_code_color?: string | null;
  qr_code_bg_color?: string | null;
  qr_code_logo_size?: number | null;
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