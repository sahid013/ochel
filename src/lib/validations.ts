import { z } from 'zod';

// Validation schemas using Zod
export const reservationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z
    .string()
    .min(10, 'Le numéro de téléphone est requis')
    .refine((phone) => {
      // Remove spaces and hyphens for validation
      const cleaned = phone.replace(/[^\d+]/g, '');
      // Format 1: +33 followed by 9 digits
      const format1 = /^\+33[0-9]{9}$/;
      // Format 2: 0 followed by 9 digits
      const format2 = /^0[0-9]{9}$/;
      return format1.test(cleaned) || format2.test(cleaned);
    }, 'Format invalide. Utilisez: +33612345678 ou 0612345678'),
  
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Date must be today or in the future'),
  
  time: z
    .string()
    .min(1, 'Time is required'),
  
  guests: z
    .string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 50;
    }, 'Number of guests must be between 1 and 50'),
  
  specialRequests: z
    .string()
    .max(500, 'Special requests must be less than 500 characters')
    .optional()
});

export const emailLookupSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
});

export const adminFilterSchema = z.object({
  date: z.string().optional(),
  dateFilter: z.enum(['all', 'today', 'tomorrow', 'next7days', 'next30days', 'custom']).optional(),
  status: z.enum(['all', 'confirmed', 'pending', 'cancelled', 'completed']).optional(),
  searchTerm: z.string().max(100).optional()
});

// Type inference from schemas
export type ReservationFormInput = z.infer<typeof reservationSchema>;
export type EmailLookupInput = z.infer<typeof emailLookupSchema>;
export type AdminFilterInput = z.infer<typeof adminFilterSchema>;

// Validation helper functions
export const validateReservation = (data: unknown) => {
  return reservationSchema.safeParse(data);
};

export const validateEmailLookup = (data: unknown) => {
  return emailLookupSchema.safeParse(data);
};

export const validateAdminFilters = (data: unknown) => {
  return adminFilterSchema.safeParse(data);
};