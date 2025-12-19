/**
 * Logging utility that respects environment settings
 * Prevents sensitive information from being logged in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log debug information (only in development)
 * @param message - The message to log
 * @param data - Optional data to log
 */
export function logDebug(message: string, ...data: any[]): void {
  if (isDevelopment) {
    console.log(`[Debug] ${message}`, ...data);
  }
}

/**
 * Log informational messages (only in development)
 * @param message - The message to log
 * @param data - Optional data to log
 */
export function logInfo(message: string, ...data: any[]): void {
  if (isDevelopment) {
    console.log(`[Info] ${message}`, ...data);
  }
}

/**
 * Log errors (always logs, but sanitizes in production)
 * @param message - The error message
 * @param error - The error object or additional data
 */
export function logError(message: string, error?: any): void {
  if (isDevelopment) {
    console.error(`[Error] ${message}`, error);
  } else {
    // In production, log only the message without potentially sensitive error details
    console.error(`[Error] ${message}`);
  }
}

/**
 * Log warnings (always logs)
 * @param message - The warning message
 * @param data - Optional data to log
 */
export function logWarning(message: string, ...data: any[]): void {
  if (isDevelopment) {
    console.warn(`[Warning] ${message}`, ...data);
  } else {
    console.warn(`[Warning] ${message}`);
  }
}
