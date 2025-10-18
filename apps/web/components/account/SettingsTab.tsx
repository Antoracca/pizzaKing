'use client';

import { useState, useEffect, type FormEvent } from 'react';
import {
  Loader2,
  Phone as PhoneIcon,
  ShieldCheck,
  ShieldAlert,
  Bell,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { User } from '@pizza-king/shared';
import { formatPhone } from './utils';

type Props = {
  user: User;
  profileForm: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  preferencesForm: {
    newsletter: boolean;
    push: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  onProfileFormChange: (updates: Partial<Props['profileForm']>) => void;
  onPreferencesChange: (updates: Partial<Props['preferencesForm']>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  saving: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export default function SettingsTab({
  user,
  profileForm,
  preferencesForm,
  onProfileFormChange,
  onPreferencesChange,
  onSubmit,
  saving,
  emailVerified,
  phoneVerified,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [initialProfile, setInitialProfile] = useState(profileForm);
  const [initialPreferences, setInitialPreferences] = useState(preferencesForm);

  useEffect(() => {
    if (!isEditing) {
      setInitialProfile(profileForm);
      setInitialPreferences(preferencesForm);
    }
  }, [isEditing, profileForm, preferencesForm]);

  const handleEnterEdit = () => {
    setInitialProfile(profileForm);
    setInitialPreferences(preferencesForm);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    onProfileFormChange(initialProfile);
    onPreferencesChange(initialPreferences);
    setIsEditing(false);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(event);
    setIsEditing(false);
  };

  const notificationOptions = [
    {
      key: 'newsletter' as const,
      label: 'Newsletter',
      description: 'Actualités & offres hebdomadaires',
    },
    {
      key: 'push' as const,
      label: 'Notifications push',
      description: 'Statut des commandes en temps réel',
    },
    {
      key: 'sms' as const,
      label: 'SMS',
      description: 'Alertes importantes & confirmations',
    },
    {
      key: 'whatsapp' as const,
      label: 'WhatsApp',
      description: 'Support client et notifications rapides',
    },
  ];

  const personalInfo = [
    {
      label: 'Prénom',
      value: profileForm.firstName || 'Non renseigné',
    },
    {
      label: 'Nom',
      value: profileForm.lastName || 'Non renseigné',
    },
    {
      label: 'Adresse email',
      value: user.email || 'Non renseignée',
    },
    {
      label: 'Numéro de téléphone',
      value:
        formatPhone(profileForm.phoneNumber || user.phoneNumber) ||
        'Non renseigné',
    },
  ];

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-full">
            <h2 className="text-xl font-bold text-gray-900">
              Informations personnelles
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Consultez vos informations et ajustez-les depuis un espace dédié
              sans quitter votre tableau de bord.
            </p>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {!isEditing ? (
              <Button
                type="button"
                className="w-full rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-orange-700 sm:w-auto"
                onClick={handleEnterEdit}
                disabled={saving}
              >
                Modifier mon profil
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 sm:w-auto"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  form="settings-form"
                  className="w-full rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour…
                    </span>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div className="mt-6 space-y-6">
            <section className="rounded-3xl border border-gray-100 bg-gray-50/60 px-4 py-5 sm:px-6">
              <h3 className="text-sm font-semibold text-gray-800">
                Aperçu des informations
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {personalInfo.map(info => (
                  <div
                    key={info.label}
                    className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {info.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                      {info.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white px-4 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Préférences de notification
                  </h3>
                  <p className="text-xs text-gray-500">
                    Personnalisez vos canaux de contact pour suivre vos
                    commandes et les offres.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {notificationOptions.map(pref => (
                  <div
                    key={pref.key}
                    className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <p className="font-semibold text-gray-900">{pref.label}</p>
                    <p className="text-xs text-gray-500">{pref.description}</p>
                    <p className="mt-2 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                      {preferencesForm[pref.key] ? 'Activé' : 'Désactivé'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-dashed border-orange-200 bg-orange-50 px-4 py-5 sm:px-6">
              <h3 className="text-sm font-semibold text-orange-800">
                Statut des vérifications
              </h3>
              <div className="mt-4 space-y-3">
                <VerificationRow
                  label="Adresse email"
                  value={user.email}
                  verified={emailVerified}
                />
                <VerificationRow
                  label="Numéro de téléphone"
                  value={
                    formatPhone(profileForm.phoneNumber || user.phoneNumber) ||
                    'Non renseigné'
                  }
                  verified={phoneVerified}
                />
              </div>
              <p className="mt-3 text-xs font-semibold text-orange-700">
                Gérez vos vérifications dans l’onglet{' '}
                <span className="underline">Sécurité</span> pour finaliser votre
                compte.
              </p>
            </section>
          </div>
        ) : (
          <form
            id="settings-form"
            className="mt-6 space-y-6"
            onSubmit={handleFormSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={event =>
                    onProfileFormChange({ firstName: event.target.value })
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={event =>
                    onProfileFormChange({ lastName: event.target.value })
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                <span>Numéro de téléphone</span>
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 shadow-inner">
                <span>
                  {formatPhone(profileForm.phoneNumber || user.phoneNumber) ||
                    'Non renseigné'}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Pour modifier votre numéro ou le vérifier, rendez-vous dans
                l’onglet{' '}
                <span className="font-semibold text-orange-600">Sécurité</span>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  Préférences de notification
                </h3>
                <span className="text-xs text-gray-500">
                  Choisissez comment nous pouvons vous contacter.
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {notificationOptions.map(pref => (
                  <label
                    key={pref.key}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-orange-300 hover:bg-orange-50/30"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {pref.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pref.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm[pref.key]}
                      onChange={event =>
                        onPreferencesChange({
                          [pref.key]: event.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

type VerificationRowProps = {
  label: string;
  value: string;
  verified: boolean;
};

function VerificationRow({ label, value, verified }: VerificationRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="break-words text-xs text-gray-500">
          {value || 'Non renseigné'}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          verified
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-orange-100 text-orange-700'
        }`}
      >
        {verified ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            Vérifié
          </>
        ) : (
          <>
            <ShieldAlert className="h-4 w-4" />
            À vérifier
          </>
        )}
      </span>
    </div>
  );
}
