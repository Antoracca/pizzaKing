// Types partagés
export type TabId = 'overview' | 'addresses' | 'settings' | 'security';

export type Feedback = { type: 'success' | 'error'; message: string };

export type ProfileForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type PreferencesForm = {
  newsletter: boolean;
  push: boolean;
  sms: boolean;
  whatsapp: boolean;
};

export type EmailForm = {
  value: string;
  newEmail: string;
};

export type PhoneForm = {
  phone: string;
  code: string;
  step: 'idle' | 'verify';
};

// Fonctions utilitaires
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractPreferences = (prefs: any): PreferencesForm => {
  if (!prefs) {
    return {
      newsletter: false,
      push: false,
      sms: false,
      whatsapp: false,
    };
  }

  const notifications = prefs.notifications ?? {};

  return {
    newsletter: prefs.newsletter ?? notifications.email ?? false,
    push: prefs.pushNotifications ?? notifications.push ?? false,
    sms: prefs.smsNotifications ?? notifications.sms ?? false,
    whatsapp: prefs.whatsappNotifications ?? notifications.whatsapp ?? false,
  };
};

export const formatPhone = (raw?: string | null): string => {
  if (!raw) return 'Non renseigné';
  return raw.replace(/\s+/g, '');
};
