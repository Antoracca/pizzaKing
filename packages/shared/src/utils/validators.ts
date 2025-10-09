/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (international format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Accept formats: +226XXXXXXXX, +226 XX XX XX XX, etc.
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleaned = phone.replace(/\s/g, '');
  return phoneRegex.test(cleaned);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * Validate promo code format
 */
export const isValidPromoCode = (code: string): boolean => {
  // Alphanumeric, 4-20 characters
  return /^[A-Z0-9]{4,20}$/.test(code);
};

/**
 * Validate postal code
 */
export const isValidPostalCode = (code: string): boolean => {
  // Simple validation for 5 digits
  return /^\d{5}$/.test(code);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate credit card number (basic Luhn algorithm)
 */
export const isValidCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate CVV
 */
export const isValidCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};
