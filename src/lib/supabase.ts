import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Validate and get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key length:', supabaseAnonKey?.length);
}

// Validate URL format
if (!supabaseUrl || typeof supabaseUrl !== 'string' || !supabaseUrl.startsWith('http')) {
  throw new Error(`Invalid Supabase URL: "${supabaseUrl}". Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.`);
}

if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.length < 10) {
  throw new Error(`Invalid Supabase anon key: "${supabaseAnonKey?.substring(0, 10)}...". Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.`);
}

// Create Supabase client with error handling and proper typing
let supabase: ReturnType<typeof createClient<Database>>;

try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Enable session persistence for admin authentication
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`Failed to initialize Supabase client: ${errorMessage}. URL: "${supabaseUrl}"`);
}

export { supabase };

// Re-export types from the centralized types file
export type { Reservation, ReservationStatus, CreateReservationData } from '@/types';



