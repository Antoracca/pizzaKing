import { FIREBASE_CONFIG } from './config';

/**
 * Error codes that are retryable
 */
const RETRYABLE_ERROR_CODES = [
  'unavailable',
  'deadline-exceeded',
  'resource-exhausted',
  'aborted',
  'internal',
  'cancelled',
];

/**
 * Checks if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    return code ? RETRYABLE_ERROR_CODES.includes(code) : false;
  }
  return false;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a Firebase operation with exponential backoff
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns The result of the operation
 */
export async function retryFirebaseOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (error: unknown, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = FIREBASE_CONFIG.MAX_RETRIES,
    initialDelay = FIREBASE_CONFIG.INITIAL_RETRY_DELAY,
    backoffMultiplier = FIREBASE_CONFIG.RETRY_BACKOFF_MULTIPLIER,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Only retry if it's a retryable error
      if (!isRetryableError(error)) {
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      // Wait before retrying with exponential backoff
      await sleep(delay);
      delay *= backoffMultiplier;
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Wrapper for Firestore read operations with retry logic
 */
export async function firestoreRead<T>(
  operation: () => Promise<T>,
  onRetry?: (error: unknown, attempt: number) => void
): Promise<T> {
  return retryFirebaseOperation(operation, { onRetry });
}

/**
 * Wrapper for Firestore write operations with retry logic
 */
export async function firestoreWrite<T>(
  operation: () => Promise<T>,
  onRetry?: (error: unknown, attempt: number) => void
): Promise<T> {
  return retryFirebaseOperation(operation, { onRetry });
}

/**
 * Wrapper for Firestore delete operations with retry logic
 */
export async function firestoreDelete<T>(
  operation: () => Promise<T>,
  onRetry?: (error: unknown, attempt: number) => void
): Promise<T> {
  return retryFirebaseOperation(operation, { onRetry });
}
