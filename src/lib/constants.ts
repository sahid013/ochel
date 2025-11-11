// Application constants and configuration

export const RESTAURANT_CONFIG = {
  name: 'ochel',
  description: 'Experience Fine Dining at Its Best',
  tagline: 'Indulge in our exquisite cuisine crafted by world-renowned chefs. From fresh seafood to premium steaks, every dish tells a story of passion and perfection.',
  rating: 4.9,
  location: 'Downtown Fine Dining',
  hours: 'Open Daily 5PM-11PM',
  phone: '(555) 123-4567',
  email: 'info@ochel.com',
  address: '123 Fine Dining Street, Downtown'
} as const;

export const TIME_SLOTS = [
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00'
] as const;

export const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200'
} as const;

export const FORM_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 20,
  SPECIAL_REQUESTS_MAX_LENGTH: 500,
  MIN_GUESTS: 1,
  MAX_GUESTS: 50
} as const;

export const API_ERRORS = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'Requested resource not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.'
} as const;

export const SUCCESS_MESSAGES = {
  RESERVATION_CREATED: 'Reservation created successfully!',
  RESERVATION_UPDATED: 'Reservation updated successfully!',
  RESERVATION_CANCELLED: 'Reservation cancelled successfully!'
} as const;

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
} as const;