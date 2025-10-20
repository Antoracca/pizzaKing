import { Timestamp } from 'firebase/firestore';

/**
 * Formate un Timestamp Firestore en heure locale (HH:MM)
 */
export function formatMessageTime(timestamp: Timestamp | null | undefined): string {
  try {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '';
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp.toDate());
  } catch {
    return '';
  }
}

/**
 * Formate un Timestamp en date complète
 */
export function formatFullDate(timestamp: Timestamp | null | undefined): string {
  try {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(timestamp.toDate());
  } catch {
    return '—';
  }
}

/**
 * Formate un temps relatif (ex: "Il y a 5 min", "À l'instant")
 */
export function formatRelativeTime(timestamp: Timestamp | Date | null | undefined): string {
  try {
    let date: Date | null = null;

    if (!timestamp) return '—';

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      return '—';
    }

    const diff = Date.now() - date.getTime();

    if (diff < 60_000) return 'À l\'instant';
    if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)} h`;

    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return '—';
  }
}

/**
 * Génère un numéro de ticket unique et lisible (ex: "PK-2025-A7B3")
 */
export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PK-${year}-${random}`;
}

/**
 * Extrait un numéro de ticket lisible depuis l'ID Firestore
 * Fallback pour tickets existants sans ticketNumber
 */
export function extractTicketNumber(firestoreId: string): string {
  return firestoreId.slice(0, 8).toUpperCase();
}

/**
 * Formate le nom d'un utilisateur depuis un objet User
 */
export function formatUserName(user: {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email?: string | null;
} | null | undefined): string {
  if (!user) return 'Utilisateur';

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (fullName) return fullName;
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];

  return 'Utilisateur';
}

/**
 * Formate une date pour les séparateurs (ex: "Aujourd'hui", "Hier", "15 janvier")
 */
export function formatDateSeparator(timestamp: Timestamp | Date | null | undefined): string {
  try {
    let date: Date | null = null;

    if (!timestamp) return '';

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      return '';
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Aujourd'hui";
    }

    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Hier';
    }

    // Less than 7 days ago: show day name
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date);
    }

    // Otherwise: show full date
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Détermine si deux dates sont sur des jours différents
 */
export function isDifferentDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return true;

  return (
    date1.getDate() !== date2.getDate() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getFullYear() !== date2.getFullYear()
  );
}
