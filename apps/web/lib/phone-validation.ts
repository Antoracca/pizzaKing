import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { PHONE_CONFIG } from './config';

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates a phone number with intelligent country detection
 * @param phone - Phone number to validate
 * @returns Validation result with formatted number if valid
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Numéro de téléphone requis' };
  }

  // Clean the number (remove spaces, dashes, etc.)
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // First, try to parse with automatic detection
  try {
    if (isValidPhoneNumber(cleanPhone)) {
      const parsed = parsePhoneNumber(cleanPhone);
      return {
        isValid: true,
        formatted: parsed.formatInternational(),
      };
    }
  } catch (e) {
    // Continue with country-specific validation
  }

  // Try with each configured country
  for (const country of PHONE_CONFIG.COUNTRIES) {
    try {
      if (isValidPhoneNumber(cleanPhone, country)) {
        const parsed = parsePhoneNumber(cleanPhone, country);
        return {
          isValid: true,
          formatted: parsed.formatInternational(),
        };
      }
    } catch (e) {
      continue;
    }
  }

  // If nothing works, check if it's at least a basic valid format
  const basicPhoneRegex = /^(\+|00)?[0-9]{8,15}$/;
  if (basicPhoneRegex.test(cleanPhone)) {
    return {
      isValid: true,
      formatted: cleanPhone,
    };
  }

  return {
    isValid: false,
    error: 'Numéro de téléphone invalide. Utilisez un format international (+236...) ou local',
  };
}

/**
 * Format a phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number or original if parsing fails
 */
export function formatPhoneNumber(phone: string): string {
  const validation = validatePhoneNumber(phone);
  return validation.formatted || phone;
}
