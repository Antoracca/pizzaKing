'use client';

import { type FormEvent } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { User } from '@pizza-king/shared';

type Props = {
  user: User;
  isPasswordProvider: boolean;
  emailForm: {
    value: string;
    newEmail: string;
  };
  phoneForm: {
    phone: string;
    code: string;
    step: 'idle' | 'verify';
  };
  emailSaving: boolean;
  phoneSaving: boolean;
  onEmailFormChange: (updates: Partial<Props['emailForm']>) => void;
  onPhoneFormChange: (updates: Partial<Props['phoneForm']>) => void;
  onEmailUpdate: (event: FormEvent<HTMLFormElement>) => void;
  onSendOtp: () => void;
  onVerifyOtp: (event: FormEvent<HTMLFormElement>) => void;
};

export default function SecurityTab({
  user,
  isPasswordProvider,
  emailForm,
  phoneForm,
  emailSaving,
  phoneSaving,
  onEmailFormChange,
  onPhoneFormChange,
  onEmailUpdate,
  onSendOtp,
  onVerifyOtp,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Email & vérification */}
      <Card className="border-0 shadow-md">
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Email & vérification
            </h2>
            <p className="text-sm text-gray-600">
              Mettez à jour votre adresse email et assurez-vous qu'elle est
              vérifiée.
            </p>
          </div>
          <form className="space-y-4" onSubmit={onEmailUpdate}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Adresse email actuelle
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{emailForm.value}</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nouvelle adresse email
              </label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(event) =>
                  onEmailFormChange({ newEmail: event.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="nouveau@email.com"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Vous recevrez un email pour confirmer votre nouvelle adresse.
              </p>
            </div>
            <Button
              type="submit"
              className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              disabled={emailSaving}
            >
              {emailSaving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise à jour…
                </span>
              ) : (
                'Mettre à jour mon email'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vérification du téléphone */}
      <Card className="border-0 shadow-md">
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Vérification du téléphone
            </h2>
            <p className="text-sm text-gray-600">
              Activez la validation par SMS pour sécuriser votre compte.
            </p>
            {isPasswordProvider && !user.phoneNumber && (
              <p className="mt-3 rounded-2xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                Ajoutez un numéro pour faciliter vos futures commandes et
                récupérer votre compte en cas d'oubli de mot de passe.
              </p>
            )}
          </div>

          <form
            className="space-y-4"
            onSubmit={
              phoneForm.step === 'verify'
                ? onVerifyOtp
                : (event) => {
                    event.preventDefault();
                    onSendOtp();
                  }
            }
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneForm.phone}
                  onChange={(event) =>
                    onPhoneFormChange({ phone: event.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="+236 70 00 00 00"
                  disabled={phoneForm.step === 'verify'}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSendOtp}
                  disabled={phoneSaving || phoneForm.step === 'verify'}
                >
                  {phoneSaving && phoneForm.step === 'idle' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Envoyer le code'
                  )}
                </Button>
              </div>
            </div>

            {phoneForm.step === 'verify' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Code SMS
                </label>
                <input
                  type="text"
                  value={phoneForm.code}
                  onChange={(event) =>
                    onPhoneFormChange({ code: event.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm uppercase tracking-widest focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="123456"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Entrez le code reçu par SMS pour confirmer votre numéro.
                </p>
              </div>
            )}

            {phoneForm.step === 'verify' && (
              <Button
                type="submit"
                className="rounded-xl bg-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-orange-700"
                disabled={phoneSaving}
              >
                {phoneSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Vérification…
                  </span>
                ) : (
                  'Confirmer le code'
                )}
              </Button>
            )}
          </form>
          <div id="phone-recaptcha" />
        </CardContent>
      </Card>
    </div>
  );
}
