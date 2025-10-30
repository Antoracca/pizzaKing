/**
 * Server-side validation utilities
 * Pour valider les données dans les API routes
 */

import { DELIVERY_CONFIG } from './config';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valide le montant d'un paiement
 */
export function validatePaymentAmount(
  amount: number,
  currency: string,
): ValidationResult {
  const errors: string[] = [];

  if (typeof amount !== 'number' || isNaN(amount)) {
    errors.push('Le montant doit être un nombre valide');
  }

  if (amount <= 0) {
    errors.push('Le montant doit être supérieur à 0');
  }

  if (amount > 10000000) {
    // 10 millions FCFA max
    errors.push('Le montant est trop élevé');
  }

  if (!['xaf', 'XAF'].includes(currency)) {
    errors.push('Seule la devise XAF est acceptée');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les métadonnées d'un paiement Stripe
 */
export function validatePaymentMetadata(
  metadata: Record<string, any>,
): ValidationResult {
  const errors: string[] = [];

  if (!metadata.orderReference || typeof metadata.orderReference !== 'string') {
    errors.push('orderReference est requis dans les métadonnées');
  }

  if (metadata.orderReference && metadata.orderReference.length > 100) {
    errors.push('orderReference est trop long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide une adresse de livraison
 */
export function validateAddress(address: any): ValidationResult {
  const errors: string[] = [];

  if (!address || typeof address !== 'object') {
    errors.push('Adresse invalide');
    return { isValid: false, errors };
  }

  const requiredFields = ['quartier', 'avenue', 'pointDeRepere'];
  for (const field of requiredFields) {
    if (!address[field] || typeof address[field] !== 'string' || address[field].trim() === '') {
      errors.push(`Le champ ${field} est requis`);
    }
  }

  // Vérifier les longueurs
  if (address.quartier && address.quartier.length > 100) {
    errors.push('Quartier trop long (max 100 caractères)');
  }

  if (address.avenue && address.avenue.length > 200) {
    errors.push('Avenue trop long (max 200 caractères)');
  }

  if (address.pointDeRepere && address.pointDeRepere.length > 200) {
    errors.push('Point de repère trop long (max 200 caractères)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les informations de contact
 */
export function validateContact(contact: any): ValidationResult {
  const errors: string[] = [];

  if (!contact || typeof contact !== 'object') {
    errors.push('Contact invalide');
    return { isValid: false, errors };
  }

  if (!contact.phone || typeof contact.phone !== 'string' || contact.phone.trim() === '') {
    errors.push('Numéro de téléphone requis');
  }

  if (!contact.fullName || typeof contact.fullName !== 'string' || contact.fullName.trim() === '') {
    errors.push('Nom complet requis');
  }

  // Vérifier les longueurs
  if (contact.phone && contact.phone.length > 20) {
    errors.push('Numéro de téléphone trop long');
  }

  if (contact.fullName && contact.fullName.length > 100) {
    errors.push('Nom complet trop long (max 100 caractères)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les items d'une commande
 */
export function validateOrderItems(items: any[]): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(items)) {
    errors.push('Items doit être un tableau');
    return { isValid: false, errors };
  }

  if (items.length === 0) {
    errors.push('La commande doit contenir au moins un article');
  }

  if (items.length > 50) {
    errors.push('Trop d\'articles dans la commande (max 50)');
  }

  items.forEach((item, index) => {
    if (!item.productId || typeof item.productId !== 'string') {
      errors.push(`Item ${index + 1}: productId requis`);
    }

    if (!item.name || typeof item.name !== 'string') {
      errors.push(`Item ${index + 1}: name requis`);
    }

    if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 100) {
      errors.push(`Item ${index + 1}: quantity invalide (1-100)`);
    }

    if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
      errors.push(`Item ${index + 1}: unitPrice invalide`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les montants d'une commande (subtotal, deliveryFee, total)
 */
export function validateOrderAmounts(
  subtotal: number,
  deliveryFee: number,
  total: number,
): ValidationResult {
  const errors: string[] = [];

  if (typeof subtotal !== 'number' || subtotal <= 0) {
    errors.push('Subtotal invalide');
  }

  if (typeof deliveryFee !== 'number' || deliveryFee < 0) {
    errors.push('Delivery fee invalide');
  }

  if (deliveryFee !== 0 && deliveryFee !== DELIVERY_CONFIG.FEE) {
    errors.push(`Delivery fee doit être 0 ou ${DELIVERY_CONFIG.FEE}`);
  }

  if (typeof total !== 'number' || total <= 0) {
    errors.push('Total invalide');
  }

  // Vérifier que total = subtotal + deliveryFee
  const expectedTotal = subtotal + deliveryFee;
  if (Math.abs(total - expectedTotal) > 0.01) {
    // Tolérance de 0.01 pour les arrondis
    errors.push(`Total incorrect (attendu: ${expectedTotal}, reçu: ${total})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide une commande complète
 */
export function validateCompleteOrder(order: any): ValidationResult {
  const errors: string[] = [];

  // Valider les items
  const itemsValidation = validateOrderItems(order.items);
  errors.push(...itemsValidation.errors);

  // Valider l'adresse (si présente)
  if (order.address) {
    const addressValidation = validateAddress(order.address);
    errors.push(...addressValidation.errors);
  }

  // Valider le contact
  if (order.contact) {
    const contactValidation = validateContact(order.contact);
    errors.push(...contactValidation.errors);
  }

  // Valider les montants
  const amountsValidation = validateOrderAmounts(
    order.subtotal,
    order.deliveryFee,
    order.total,
  );
  errors.push(...amountsValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}
