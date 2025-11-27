import { z } from 'zod';

// Validation schemas using Zod
// Validation schemas using Zod
// emailLookupSchema and adminFilterSchema are kept below


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
// Type inference from schemas
export type EmailLookupInput = z.infer<typeof emailLookupSchema>;
export type AdminFilterInput = z.infer<typeof adminFilterSchema>;

// Validation helper functions


export const validateEmailLookup = (data: unknown) => {
  return emailLookupSchema.safeParse(data);
};

export const validateAdminFilters = (data: unknown) => {
  return adminFilterSchema.safeParse(data);
};