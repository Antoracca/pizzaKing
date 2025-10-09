/**
 * Format a price in euros
 */
export const formatPrice = (price: number, currency = '€'): string => {
  return `${price.toFixed(2)}${currency}`;
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format: +226 XX XX XX XX
  if (cleaned.length === 11 && cleaned.startsWith('226')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
};

/**
 * Format a date
 */
export const formatDate = (
  date: Date | number,
  format: 'short' | 'long' | 'time' = 'short'
): string => {
  const d = typeof date === 'number' ? new Date(date) : date;

  if (format === 'time') {
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (format === 'long') {
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format duration in minutes to human readable
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h${mins.toString().padStart(2, '0')}`;
};

/**
 * Format distance in meters/kilometers
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  const km = meters / 1000;
  return `${km.toFixed(1)}km`;
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Format order number
 */
export const formatOrderNumber = (orderNumber: string): string => {
  // PK-2024-00123 => #00123
  const parts = orderNumber.split('-');
  return `#${parts[parts.length - 1]}`;
};
