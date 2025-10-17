'use client';

import { useState, type FormEvent } from 'react';
import { Pencil, Loader2, Phone as PhoneIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { User } from '@pizza-king/shared';

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
};

export default function SettingsTab({
  user,
  profileForm,
  preferencesForm,
  onProfileFormChange,
  onPreferencesChange,
  onSubmit,
  saving,
}: Props) {
  const [editingFirstName, setEditingFirstName] = useState(false);
  const [editingLastName, setEditingLastName] = useState(false);

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <h2 className="mb-1 text-xl font-bold text-gray-900">
          Informations personnelles
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Mettez à jour vos informations de contact et vos préférences.
        </p>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Prénom avec icône d'édition */}
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Prénom</span>
                <button
                  type="button"
                  onClick={() => setEditingFirstName(!editingFirstName)}
                  className="text-orange-600 hover:text-orange-700 transition"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => onProfileFormChange({ firstName: e.target.value })}
                disabled={!editingFirstName}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                  editingFirstName
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                }`}
                placeholder="Votre prénom"
              />
            </div>

            {/* Nom avec icône d'édition */}
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Nom</span>
                <button
                  type="button"
                  onClick={() => setEditingLastName(!editingLastName)}
                  className="text-orange-600 hover:text-orange-700 transition"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => onProfileFormChange({ lastName: e.target.value })}
                disabled={!editingLastName}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                  editingLastName
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                }`}
                placeholder="Votre nom"
              />
            </div>
          </div>

          {/* Téléphone en lecture seule */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              <span>Numéro de téléphone</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
              <span>{profileForm.phoneNumber || 'Non renseigné'}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Le numéro de téléphone se modifie dans la section <span className="font-semibold text-orange-600">Sécurité</span>
            </p>
          </div>

          {/* Préférences de notification */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Préférences de notification</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
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
                  description: 'Alertes importantes & confirmation',
                },
                {
                  key: 'whatsapp' as const,
                  label: 'WhatsApp',
                  description: 'Support client et notifications rapides',
                },
              ].map((pref) => (
                <label
                  key={pref.key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition hover:border-orange-300 hover:bg-orange-50/30"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{pref.label}</p>
                    <p className="text-xs text-gray-500">{pref.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferencesForm[pref.key]}
                    onChange={(e) =>
                      onPreferencesChange({ [pref.key]: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-red-700"
            disabled={saving}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sauvegarde…
              </span>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
