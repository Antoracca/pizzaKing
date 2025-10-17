'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  preferences: {
    newsletter: boolean;
    push: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
};

export default function OverviewTab({ preferences }: Props) {
  const notificationPrefs = [
    {
      label: 'Email',
      value: preferences.newsletter,
      description: 'Promotions, reçus et nouveautés.',
    },
    {
      label: 'Push',
      value: preferences.push,
      description: 'Suivi de commande en temps réel.',
    },
    {
      label: 'SMS',
      value: preferences.sms,
      description: 'Alertes de livraison urgentes.',
    },
    {
      label: 'WhatsApp',
      value: preferences.whatsapp,
      description: 'Support client et confirmations rapides.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Activité récente */}
      <Card className="border-0 shadow-md">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Activité récente
            </h2>
            <p className="text-sm text-gray-600">
              Suivez vos commandes récentes et votre progression fidélité.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            Aucune commande récente. Commencez une nouvelle commande pour
            alimenter votre historique.
          </div>
        </CardContent>
      </Card>

      {/* Préférences de notification */}
      <Card className="border-0 shadow-md">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Préférences de notification
              </h3>
              <p className="text-sm text-gray-600">
                Personnalisez les canaux par lesquels vous souhaitez recevoir
                nos alertes.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {notificationPrefs.map((pref) => (
              <div
                key={pref.label}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <p className="flex items-center gap-2 font-semibold text-gray-900">
                  <Bell className="h-4 w-4 text-orange-500" />
                  {pref.label}
                </p>
                <p className="text-xs text-gray-500">{pref.description}</p>
                <p className="mt-2 text-xs font-semibold text-gray-600">
                  {pref.value
                    ? 'Activé'
                    : 'Désactivé (modifiable dans Paramètres)'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
