import { clsx, type ClassValue } from 'clsx';
import { STATUS_COLORS } from './constants';
import type { ReservationStatus } from '@/types';

// Utility function for conditional class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Phone number validation for French numbers
// Accepts two formats:
// 1. +33 followed by 9 digits (e.g., +33612345678)
// 2. 0 followed by 9 digits (e.g., 0612345678)
export function validatePhoneFormat(phoneNumber: string): { isValid: boolean; suggestion?: string; warning?: string } {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Format 1: +33 followed by 9 digits
  const format1 = /^\+33[0-9]{9}$/;
  // Format 2: 0 followed by 9 digits
  const format2 = /^0[0-9]{9}$/;

  // Check if it matches either format
  const isValid = format1.test(cleaned) || format2.test(cleaned);

  if (isValid) {
    return { isValid: true };
  }

  // Provide specific warnings based on what's being typed
  if (cleaned.length === 0) {
    return {
      isValid: false,
      warning: 'Veuillez entrer un numéro de téléphone'
    };
  }

  // Check if it starts correctly
  if (!cleaned.startsWith('+33') && !cleaned.startsWith('0')) {
    return {
      isValid: false,
      warning: 'Le numéro doit commencer par +33 ou 0',
      suggestion: 'Format: +33612345678 ou 0612345678'
    };
  }

  // Check length for +33 format
  if (cleaned.startsWith('+33')) {
    if (cleaned.length < 12) {
      return {
        isValid: false,
        warning: `${12 - cleaned.length} chiffre(s) restant(s)`
      };
    }
    if (cleaned.length > 12) {
      return {
        isValid: false,
        warning: 'Trop de chiffres pour le format +33',
        suggestion: 'Format: +33 suivi de 9 chiffres'
      };
    }
  }

  // Check length for 0 format
  if (cleaned.startsWith('0')) {
    if (cleaned.length < 10) {
      return {
        isValid: false,
        warning: `${10 - cleaned.length} chiffre(s) restant(s)`
      };
    }
    if (cleaned.length > 10) {
      return {
        isValid: false,
        warning: 'Trop de chiffres pour le format 0',
        suggestion: 'Format: 0 suivi de 9 chiffres'
      };
    }
  }

  return {
    isValid: false,
    warning: 'Format invalide',
    suggestion: 'Format: +33612345678 ou 0612345678'
  };
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  if (!dateString || dateString.trim() === '') {
    return 'Invalid Date';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(timeString: string): string {
  return timeString;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function getDateRange(days: number): { start: string; end: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

export function isDateInPast(dateString: string): boolean {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate < today;
}

// Status utilities
export function getStatusColor(status: ReservationStatus | undefined): string {
  return STATUS_COLORS[status || 'confirmed'];
}

export function getStatusDisplayName(status: ReservationStatus | undefined): string {
  return status || 'confirmed';
}

// Form utilities
export function createFormData(data: Record<string, unknown>) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  return formData;
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not a standard format
  return phone;
}

// Truncate string with ellipsis
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

// Reservation ID shortener
export function getShortId(id: string): string {
  return id.slice(0, 8);
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Sleep utility for testing
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}